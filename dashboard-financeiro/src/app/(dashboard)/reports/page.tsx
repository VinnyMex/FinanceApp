import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/user-sync";
import { ReportCharts } from "@/components/ReportCharts";
import { ReportFilters } from "@/components/ReportFilters";
import { startOfMonth, endOfMonth, startOfYear, eachMonthOfInterval, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

function getDateRange(period: string | undefined) {
    const now = new Date();
    switch (period) {
        case "1m": return { start: startOfMonth(now), end: endOfMonth(now) };
        case "3m": return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
        case "6m": return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
        case "1y": return { start: startOfYear(now), end: endOfMonth(now) };
        case "12m": return { start: startOfMonth(subMonths(now, 11)), end: endOfMonth(now) };
        default: return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
    }
}

export default async function ReportsPage({
    searchParams
}: {
    searchParams: Promise<{ period?: string }>
}) {
    const user = await syncUser();
    if (!user) redirect("/sign-in");

    const params = await searchParams;
    const { start, end } = getDateRange(params.period);

    // Get transactions in range
    const transactions = await db.transaction.findMany({
        where: {
            userId: user.id,
            date: { gte: start, lte: end },
        },
        include: { category: true },
    });

    // Category breakdown (expenses only)
    const categoryTotals: Record<string, number> = {};
    const COLORS = ["#a855f7", "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];
    transactions
        .filter((t: any) => t.type === "EXPENSE")
        .forEach((t: any) => {
            categoryTotals[t.category.name] = (categoryTotals[t.category.name] || 0) + t.amount;
        });

    const categoryData = Object.entries(categoryTotals).map(([name, value], i) => ({
        name,
        value,
        color: COLORS[i % COLORS.length]
    }));

    // Monthly breakdown
    const months = eachMonthOfInterval({ start, end });
    const monthlyData = months.map((month) => {
        const monthStr = format(month, "MMM", { locale: ptBR });
        const ms = startOfMonth(month);
        const me = endOfMonth(month);

        const incomes = transactions
            .filter((t: any) => t.type === "INCOME" && t.date >= ms && t.date <= me)
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        const expenses = transactions
            .filter((t: any) => t.type === "EXPENSE" && t.date >= ms && t.date <= me)
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        return {
            month: monthStr.charAt(0).toUpperCase() + monthStr.slice(1),
            income: incomes,
            expense: expenses,
        };
    });

    const totalIncome = transactions.filter((t: any) => t.type === "INCOME").reduce((s: number, t: any) => s + t.amount, 0);
    const totalExpense = transactions.filter((t: any) => t.type === "EXPENSE").reduce((s: number, t: any) => s + t.amount, 0);
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gráficos e Relatórios</h1>
                    <p className="text-muted-foreground">
                        Análise detalhada de sua saúde financeira.
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="h-10 bg-accent/50 rounded-xl animate-pulse" />}>
                <ReportFilters />
            </Suspense>

            <ReportCharts
                categoryData={categoryData.length > 0 ? categoryData : [{ name: "Sem dados", value: 1, color: "#333" }]}
                monthlyData={monthlyData}
            />

            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Destaques do Período</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-sm text-emerald-500 font-medium">Total Receitas</p>
                        <p className="text-2xl font-bold mt-1 text-emerald-100">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalIncome)}
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <p className="text-sm text-rose-500 font-medium">Total Despesas</p>
                        <p className="text-2xl font-bold mt-1 text-rose-100">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalExpense)}
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm text-primary font-medium">Categoria mais cara</p>
                        <p className="text-2xl font-bold mt-1">
                            {topCategory?.[0] || "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
