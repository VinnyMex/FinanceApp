import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/user-sync";
import { PayablesTable } from "@/components/payables/PayablesTable";
import { PayablesSummary } from "@/components/payables/PayablesSummary";
import { MonthTabs } from "@/components/payables/MonthTabs";
import { startOfMonth, endOfMonth, setMonth, setYear } from "date-fns";
import { NewTransactionDialog } from "@/components/NewTransactionDialog";

export default async function PayablesPage({
    searchParams
}: {
    searchParams: Promise<{ month?: string; year?: string; status?: string }>
}) {
    const user = await syncUser();
    if (!user) redirect("/sign-in");

    const params = await searchParams;
    const currentYear = parseInt(params.year || new Date().getFullYear().toString());
    const currentMonth = parseInt(params.month || new Date().getMonth().toString());
    const statusFilter = params.status;

    // Calculate Grid Range
    const date = setYear(setMonth(new Date(), currentMonth), currentYear);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    // Build query
    const where: any = {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: start, lte: end },
    };

    if (statusFilter && statusFilter !== "ALL") {
        where.status = statusFilter;
    }

    const transactions = await db.transaction.findMany({
        where,
        include: {
            category: true,
            account: true,
        },
        orderBy: { date: "asc" },
    });

    const categories = await db.category.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" },
    });

    const accounts = await db.account.findMany({
        where: { userId: user.id },
    });

    const categoriesNames = categories.map(c => c.name);
    const accountsNames = accounts.map(a => a.name);

    // Calculate Totals (based on the filtered list, but we need the full list of the month for the summary cards if status filter is applied? 
    // Usually summary cards show the full picture of the month, regardless of the table filter.
    // So let's fetch all expenses for the month for the summary.

    const allMonthTransactions = statusFilter && statusFilter !== "ALL"
        ? await db.transaction.findMany({
            where: {
                userId: user.id,
                type: "EXPENSE",
                date: { gte: start, lte: end },
            },
        })
        : transactions; // If no filter, reuse the result

    const now = new Date();

    // Totals logic
    let paidAmount = 0;
    let paidCount = 0;

    let overdueAmount = 0;
    let overdueCount = 0;

    let pendingAmount = 0; // A vencer
    let pendingCount = 0;

    allMonthTransactions.forEach((t: any) => {
        const status = t.status || "COMPLETED"; // Default for legacy

        if (status === "COMPLETED") {
            paidAmount += t.amount;
            paidCount++;
        } else if (status === "PENDING") {
            if (new Date(t.date) < now) {
                // Vencido
                overdueAmount += t.amount;
                overdueCount++;
            } else {
                // A vencer
                pendingAmount += t.amount;
                pendingCount++;
            }
        }
    });

    // Serialize dates for client components
    const serializedTransactions = transactions.map((t: any) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
        status: t.status || "COMPLETED"
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
                    <p className="text-muted-foreground">
                        Gestão de despesas, vencimentos e pagamentos.
                    </p>
                </div>
                <NewTransactionDialog
                    categories={categoriesNames}
                    accounts={accountsNames}
                />
            </div>

            <PayablesSummary
                paidAmount={paidAmount}
                paidCount={paidCount}
                overdueAmount={overdueAmount}
                overdueCount={overdueCount}
                pendingAmount={pendingAmount}
                pendingCount={pendingCount}
            />

            <div className="space-y-4">
                <MonthTabs />

                <Suspense fallback={<div className="h-64 bg-accent/50 rounded-xl animate-pulse" />}>
                    <PayablesTable
                        transactions={serializedTransactions}
                        categories={categoriesNames}
                        accounts={accountsNames}
                    />
                </Suspense>
            </div>
        </div>
    );
}
