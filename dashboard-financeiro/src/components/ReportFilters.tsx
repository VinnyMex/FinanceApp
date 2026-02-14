"use client"

import { useRouter, useSearchParams } from "next/navigation"

const periods = [
    { label: "Mês Atual", value: "1m" },
    { label: "3 Meses", value: "3m" },
    { label: "6 Meses", value: "6m" },
    { label: "Ano Atual", value: "1y" },
    { label: "12 Meses", value: "12m" },
    { label: "Todos", value: "" },
]

export function ReportFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentPeriod = searchParams.get("period") || ""

    const updatePeriod = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set("period", value)
        } else {
            params.delete("period")
        }
        router.push(`/reports?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
                <button
                    key={p.value}
                    onClick={() => updatePeriod(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentPeriod === p.value
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    )
}
