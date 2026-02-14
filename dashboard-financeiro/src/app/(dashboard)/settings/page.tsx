import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/user-sync";
import { SettingsClient } from "@/components/SettingsClient";
import { FinancialProfileForm } from "@/components/FinancialProfileForm";

export default async function SettingsPage() {
    const user = await syncUser();
    if (!user) redirect("/sign-in");

    const categories = await db.category.findMany({
        where: { userId: user.id },
        include: { _count: { select: { transactions: true } } },
        orderBy: { name: "asc" },
    });

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">
                    Gerencie suas preferências, perfil financeiro e alertas.
                </p>
            </div>

            <div className="grid gap-6">
                <FinancialProfileForm
                    initialData={{
                        // Cast to any to avoid TS errors if types are not updated yet
                        salary: (user as any).salary,
                        foodVoucher: (user as any).foodVoucher,
                        transportVoucher: (user as any).transportVoucher,
                        goal1: (user as any).goal1,
                        goal2: (user as any).goal2,
                        goal3: (user as any).goal3,
                    }}
                />

                <SettingsClient
                    categories={categories as any}
                    whatsapp={user.whatsapp || ""}
                    alertFrequency={user.alertFrequency}
                />
            </div>
        </div>
    );
}
