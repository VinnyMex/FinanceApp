import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, AlertCircle, CalendarClock } from "lucide-react"

interface PayablesSummaryProps {
    paidAmount: number
    paidCount: number
    overdueAmount: number
    overdueCount: number
    pendingAmount: number
    pendingCount: number
}

export function PayablesSummary({
    paidAmount,
    paidCount,
    overdueAmount,
    overdueCount,
    pendingAmount,
    pendingCount
}: PayablesSummaryProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* PAGO */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Total Pago (Listagem)</span>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-emerald-500">
                    {formatCurrency(paidAmount)}
                </div>
                <p className="text-xs text-emerald-500/60 mt-1">
                    {paidCount} despesa{paidCount !== 1 && "s"} paga{paidCount !== 1 && "s"} na listagem atual.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
            </div>

            {/* VENCIDO */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Total Vencido (Não Pago)</span>
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                </div>
                <div className="text-3xl font-bold text-rose-500">
                    {formatCurrency(overdueAmount)}
                </div>
                <p className="text-xs text-rose-500/60 mt-1">
                    {overdueCount} despesa{overdueCount !== 1 && "s"} vencida{overdueCount !== 1 && "s"} e não paga{overdueCount !== 1 && "s"}.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
            </div>

            {/* A VENCER */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Total a Vencer (Não Pago)</span>
                    <CalendarClock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-3xl font-bold text-amber-500">
                    {formatCurrency(pendingAmount)}
                </div>
                <p className="text-xs text-amber-500/60 mt-1">
                    {pendingCount} despesa{pendingCount !== 1 && "s"} a vencer e não paga{pendingCount !== 1 && "s"}.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
            </div>
        </div>
    )
}
