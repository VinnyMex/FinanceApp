"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const MONTHS = [
    { value: "0", label: "Janeiro" },
    { value: "1", label: "Fevereiro" },
    { value: "2", label: "Março" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Maio" },
    { value: "5", label: "Junho" },
    { value: "6", label: "Julho" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Setembro" },
    { value: "9", label: "Outubro" },
    { value: "10", label: "Novembro" },
    { value: "11", label: "Dezembro" },
]

export function MonthTabs() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth().toString()

    const selectedMonth = searchParams.get("month") || currentMonth
    const selectedYear = searchParams.get("year") || currentYear.toString()

    function handleMonthChange(monthValue: string) {
        const params = new URLSearchParams(searchParams)
        params.set("month", monthValue)
        router.push(`/payables?${params.toString()}`)
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mês de Vencimento</h3>
            <div className="flex flex-wrap gap-2">
                {MONTHS.map((month) => {
                    const isSelected = month.value === selectedMonth
                    return (
                        <button
                            key={month.value}
                            onClick={() => handleMonthChange(month.value)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                isSelected
                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-card border border-border/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {month.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
