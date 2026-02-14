import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/user-sync";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { subDays, subMonths, subYears, startOfMonth } from "date-fns";
import {
    ArrowUpCircle,
    ArrowDownCircle,
} from "lucide-react";
import { TransactionActions } from "@/components/TransactionActions";
import { TransactionFilters } from "@/components/TransactionFilters";
import { NewTransactionDialog } from "@/components/NewTransactionDialog";

export default async function TransactionsPage({
    searchParams
}: {
    searchParams: Promise<{ type?: string; category?: string; period?: string; search?: string }>
}) {
    const user = await syncUser();
    if (!user) redirect("/sign-in");

    const params = await searchParams;
    const { type, category, period, search } = params;

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    if (period === "7d") dateFilter = { gte: subDays(now, 7) };
    else if (period === "1m") dateFilter = { gte: startOfMonth(now) };
    else if (period === "3m") dateFilter = { gte: subMonths(now, 3) };
    else if (period === "6m") dateFilter = { gte: subMonths(now, 6) };
    else if (period === "1y") dateFilter = { gte: subYears(now, 1) };

    // Build where clause
    const where: any = { userId: user.id };
    if (type) where.type = type;
    if (dateFilter.gte) where.date = dateFilter;
    if (search) {
        where.description = { contains: search };
    }

    const transactions = await db.transaction.findMany({
        where,
        include: {
            category: true,
            account: true,
        },
        orderBy: { date: "desc" },
    });

    // Filter by category name (post-query since SQLite doesn't support nested where easily)
    const filtered = category
        ? transactions.filter((t: any) => t.category.name === category)
        : transactions;

    const categories = await db.category.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
    });

    const accounts = await db.account.findMany({
        where: { userId: user.id },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
                    <p className="text-muted-foreground">
                        {filtered.length} movimentação{filtered.length !== 1 ? "ões" : ""} encontrada{filtered.length !== 1 ? "s" : ""}.
                    </p>
                </div>
                <NewTransactionDialog
                    categories={categories.map((c: any) => c.name)}
                    accounts={accounts.map((a: any) => a.name)}
                />
            </div>

            <Suspense fallback={<div className="h-12 bg-accent/50 rounded-xl animate-pulse" />}>
                <TransactionFilters categories={categories as any} />
            </Suspense>

            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Frequência</th>
                                <th className="px-6 py-4">Conta</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        Nenhuma transação encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((transaction: any) => (
                                    <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {format(new Date(transaction.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                {transaction.type === "INCOME" ? (
                                                    <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                                                ) : (
                                                    <ArrowDownCircle className="h-5 w-5 text-rose-500" />
                                                )}
                                                {transaction.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                                                {transaction.category.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {transaction.frequency === "FIXED" && (
                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-500 uppercase">Fixa</span>
                                            )}
                                            {transaction.frequency === "INSTALLMENT" && (
                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">
                                                    Parcelada ({transaction.currentInstallment}/{transaction.installmentsTotal})
                                                </span>
                                            )}
                                            {transaction.frequency === "VARIABLE" && (
                                                <span className="text-[10px] text-muted-foreground uppercase font-medium">Variável</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {transaction.account.name}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-semibold ${transaction.type === "INCOME" ? "text-emerald-500" : "text-rose-500"}`}>
                                            {transaction.type === "INCOME" ? "+" : "-"}
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <TransactionActions transaction={transaction} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
