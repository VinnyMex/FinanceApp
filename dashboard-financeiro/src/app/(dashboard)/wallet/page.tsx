import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/user-sync";
import { WalletClient } from "@/components/WalletClient";

export default async function WalletPage() {
    const user = await syncUser();
    if (!user) redirect("/sign-in");

    const accounts = await db.account.findMany({
        where: { userId: user.id },
        include: {
            transactions: {
                orderBy: { date: "desc" },
                take: 10,
                include: { category: true },
            },
            _count: { select: { transactions: true } },
        },
    });

    const totalBalance = accounts.reduce((sum: number, a: any) => sum + a.balance, 0);

    // Serialize dates
    const serialized = accounts.map((a: any) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        transactions: a.transactions.map((t: any) => ({
            ...t,
            date: t.date.toISOString(),
            createdAt: t.createdAt.toISOString(),
            category: t.category,
        })),
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Carteira</h1>
                <p className="text-muted-foreground">
                    Administre suas contas bancárias e acompanhe o fluxo financeiro.
                </p>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6">
                <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
                <p className={`text-4xl font-bold tracking-tight ${totalBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{accounts.length} conta{accounts.length !== 1 ? "s" : ""} ativa{accounts.length !== 1 ? "s" : ""}</p>
            </div>

            <WalletClient accounts={serialized} />
        </div>
    );
}
