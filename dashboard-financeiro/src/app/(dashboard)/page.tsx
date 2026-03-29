import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wallet, TrendingUp, ReceiptText, AlertCircle, CheckCircle2, Calendar } from "lucide-react"
import { NewTransactionDialog } from "@/components/NewTransactionDialog"
import { DashboardFilters } from "@/components/DashboardFilters"
import { PrevisionInsights } from "@/components/GuJuInsights"
import { db } from "@/lib/db"
import { syncUser } from "@/lib/user-sync"

import { startOfMonth, endOfMonth, setMonth, setYear, format, isSameMonth, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn, formatCurrency } from "@/lib/utils"

interface HomeProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const user = await syncUser()
  const { month, year } = await searchParams

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    )
  }

  // Configuração da data baseada nos filtros
  const now = new Date()
  const selectedMonth = month ? parseInt(month) : now.getMonth()
  const selectedYear = year ? parseInt(year) : now.getFullYear()

  const baseDate = setYear(setMonth(now, selectedMonth), selectedYear)
  const monthStart = startOfMonth(baseDate)
  const monthEnd = endOfMonth(baseDate)
  const isCurrentMonth = isSameMonth(baseDate, now)

  // Obter dados reais
  const accounts = await db.account.findMany({
    where: { userId: user.id },
  })

  // Transações do mês selecionado
  const monthlyTransactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      OR: [
        { date: { gte: monthStart, lte: monthEnd } },
        { frequency: "FIXED", date: { lte: monthEnd } }, // Fixas aparecem sempre
      ],
    },
    include: { category: true },
    orderBy: { date: "asc" }
  })

  // Cálculos Básicos
  const income = monthlyTransactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0)

  // Total a Pagar Restante (Somente Pendentes deste mês)
  const pendingExpenses = monthlyTransactions
    .filter((t: any) => t.type === "EXPENSE" && t.status === "PENDING")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0)

  // Próximas Dívidas (Top 5 Pendentes ordenadas por data)
  const nextDebts = monthlyTransactions
    .filter((t: any) => t.type === "EXPENSE" && t.status === "PENDING")
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  // Últimas 5 transações gerais
  const lastTransactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 5,
    include: { category: true }
  })

  // Total já pago
  const paidExpenses = monthlyTransactions
    .filter((t: any) => t.type === "EXPENSE" && t.status === "COMPLETED")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0)

  // Insights
  const insights = await db.insight.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3
  })

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/30 p-4 rounded-2xl ring-1 ring-border/20 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(baseDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={<div className="h-9 w-[250px] bg-card/50 rounded-md animate-pulse" />}>
            <DashboardFilters />
          </Suspense>
          <NewTransactionDialog
            categories={Array.from(new Set(monthlyTransactions.map((t: any) => t.category?.name).filter(Boolean)))}
            accounts={accounts.map((a: any) => a.name)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lado Esquerdo: Cards Principais */}
        <div className="lg:col-span-2 space-y-6">

          <div className="grid gap-4 md:grid-cols-2">
            {/* Card Principal: Falta Pagar */}
            <Card className="border-none bg-primary shadow-lg shadow-primary/20 text-primary-foreground overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium opacity-90 uppercase tracking-wider">Restante a Pagar</CardTitle>
                <AlertCircle className="h-4 w-4 opacity-90" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">{formatCurrency(pendingExpenses)}</div>
                <p className="text-xs opacity-70 mt-1">
                  {isCurrentMonth ? "Contas pendentes deste mês" : "Contas pendentes do período"}
                </p>
              </CardContent>
            </Card>

            {/* Card Secundário: Já Pago */}
            <Card className="border-none bg-emerald-500/10 backdrop-blur-sm ring-1 ring-emerald-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-500 uppercase tracking-wider">Já Pago</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">{formatCurrency(paidExpenses)}</div>
                <p className="text-xs text-emerald-500/70 mt-1">Total quitado no período</p>
              </CardContent>
            </Card>
          </div>


          <div className="grid gap-6 md:grid-cols-2">
            {/* Seção Próximas Dívidas */}
            <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Próximas Dívidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextDebts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Tudo pago!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nextDebts.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold text-[10px] uppercase">
                            {format(t.date, "dd")}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate max-w-[120px]">{t.description}</p>
                            <p className="text-[10px] text-muted-foreground">{t.category?.name || "Geral"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xs text-rose-500">{formatCurrency(t.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção Últimas Transações */}
            <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-muted-foreground" />
                  Últimas Atividades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastTransactions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-xs">Nenhuma atividade recente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lastTransactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px]",
                            t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            {t.type === "INCOME" ? "+" : "-"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate max-w-[120px]">{t.description}</p>
                            <p className="text-[10px] text-muted-foreground">{format(t.date, "dd/MM")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn("font-bold text-xs", t.type === "INCOME" ? "text-emerald-500" : "text-rose-500")}>
                            {formatCurrency(t.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Lado Direito: Insights IA */}
        <div className="space-y-6">
          <PrevisionInsights insights={insights as any} />

          {/* Card Resumo Rápido */}
          <Card className="border-none bg-card/40 backdrop-blur-sm ring-1 ring-border/10">
            <CardHeader>
              <CardTitle className="text-sm font-semibold opacity-80 uppercase tracking-widest">Resumo Operacional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Entradas</span>
                <span className="font-medium text-emerald-500">{formatCurrency(income)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Saídas Totais</span>
                <span className="font-medium text-rose-500">{formatCurrency(paidExpenses + pendingExpenses)}</span>
              </div>
              <div className="border-t border-border/50 my-2" />
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Saldo Previsto</span>
                <span className={cn("font-bold", (income - (paidExpenses + pendingExpenses)) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                  {formatCurrency(income - (paidExpenses + pendingExpenses))}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center pt-2">
                *Considerando todas as receitas e despesas (pagas + pendentes) do mês.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
