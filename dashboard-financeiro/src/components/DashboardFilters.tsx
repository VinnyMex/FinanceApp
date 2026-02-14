"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function DashboardFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentMonth = searchParams.get("month") || (new Date().getMonth() + 0).toString()
    const currentYear = searchParams.get("year") || new Date().getFullYear().toString()

    const handleMonthChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("month", value)
        router.push(`/?${params.toString()}`)
    }

    const handleYearChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("year", value)
        router.push(`/?${params.toString()}`)
    }

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString())

    return (
        <div className="flex items-center gap-2">
            <Select value={currentMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[140px] bg-card/50 backdrop-blur-sm border-none ring-1 ring-border/20">
                    <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                    {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                            {month}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={currentYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[100px] bg-card/50 backdrop-blur-sm border-none ring-1 ring-border/20">
                    <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
