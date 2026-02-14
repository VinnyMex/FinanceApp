"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"
import { useState } from "react"

type Category = { id: string; name: string }

export function TransactionFilters({ categories }: { categories: Category[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [showFilters, setShowFilters] = useState(false)

    const currentType = searchParams.get("type") || ""
    const currentCategory = searchParams.get("category") || ""
    const currentPeriod = searchParams.get("period") || ""

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/transactions?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push("/transactions")
    }

    const hasFilters = currentType || currentCategory || currentPeriod

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border px-3 py-2 gap-2 ${hasFilters
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-accent"
                        }`}
                >
                    <Filter className="h-4 w-4" />
                    Filtrar
                    {hasFilters && (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                            {[currentType, currentCategory, currentPeriod].filter(Boolean).length}
                        </span>
                    )}
                </button>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-3 w-3" /> Limpar
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-card border border-border/50">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                        <select
                            aria-label="Filtrar por tipo"
                            value={currentType}
                            onChange={(e) => updateFilter("type", e.target.value)}
                            className="block w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        >
                            <option value="">Todos</option>
                            <option value="INCOME">Receitas</option>
                            <option value="EXPENSE">Despesas</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                        <select
                            aria-label="Filtrar por categoria"
                            value={currentCategory}
                            onChange={(e) => updateFilter("category", e.target.value)}
                            className="block w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        >
                            <option value="">Todas</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Período</label>
                        <select
                            aria-label="Filtrar por período"
                            value={currentPeriod}
                            onChange={(e) => updateFilter("period", e.target.value)}
                            className="block w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        >
                            <option value="">Todo período</option>
                            <option value="7d">Últimos 7 dias</option>
                            <option value="1m">Mês atual</option>
                            <option value="3m">Últimos 3 meses</option>
                            <option value="6m">Últimos 6 meses</option>
                            <option value="1y">Último ano</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}
