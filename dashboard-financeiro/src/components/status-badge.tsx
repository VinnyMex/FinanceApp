import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    if (status === "COMPLETED") {
        return (
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500", className)}>
                Pago
            </span>
        );
    }

    if (status === "PENDING") {
        return (
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500", className)}>
                Pendente
            </span>
        );
    }

    if (status === "CANCELED") {
        return (
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground", className)}>
                Cancelado
            </span>
        );
    }

    return null;
}
