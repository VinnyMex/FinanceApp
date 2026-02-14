import { Topbar } from "@/components/Topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Topbar />
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
                {children}
            </main>
        </div>
    );
}
