"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowUpCircle, ArrowDownCircle, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { EditTransactionDialog } from "@/components/EditTransactionDialog"
import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PayablesTableProps {
    transactions: any[]
    categories: string[]
    accounts: string[]
}

export function PayablesTable({ transactions, categories, accounts }: PayablesTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Status filter state
    const currentStatus = searchParams.get("status") || "ALL"
    const currentYear = searchParams.get("year") || new Date().getFullYear().toString()

    function handleStatusChange(value: string) {
        const params = new URLSearchParams(searchParams)
        if (value === "ALL") params.delete("status")
        else params.set("status", value)
        router.push(`/payables?${params.toString()}`)
    }

    function handleYearChange(value: string) {
        const params = new URLSearchParams(searchParams)
        params.set("year", value)
        router.push(`/payables?${params.toString()}`)
    }

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card shadow-sm flex-wrap">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Contas e Despesas</h3>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
                        | {transactions.length} registros encontrados
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Ano:</span>
                        <Select value={currentYear} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[100px] h-8 text-xs font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                                <SelectItem value="2027">2027</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Status:</span>
                        <Select value={currentStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                                <SelectValue placeholder="Todos Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos Status</SelectItem>
                                <SelectItem value="COMPLETED">Pago</SelectItem>
                                <SelectItem value="PENDING">Pendente</SelectItem>
                                <SelectItem value="CANCELED">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50 text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Conta</th>
                                <th className="px-6 py-4 text-right">Valor Líquido</th>
                                <th className="px-6 py-4 w-12">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        Nenhuma conta encontrada para o filtro atual.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <StatusBadge status={t.status || "COMPLETED"} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-medium">
                                            {format(new Date(t.date), "dd/MM/yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{t.description}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                                {t.frequency === "INSTALLMENT"
                                                    ? `Parcela ${t.currentInstallment}/${t.installmentsTotal}`
                                                    : t.frequency === "FIXED" ? "Fixa Mensal" : ""}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {t.category.name}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {t.account.name}
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-right font-bold text-base",
                                            t.type === "INCOME" ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(t.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <EditTransactionDialog
                                                transaction={t}
                                                categories={categories}
                                                accounts={accounts}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
