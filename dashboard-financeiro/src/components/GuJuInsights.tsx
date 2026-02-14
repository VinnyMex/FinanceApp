"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { generateInsights } from "@/app/(dashboard)/actions/ai"

interface PrevisionInsightsProps {
    insights: { id: string; content: string; type: string }[]
}

export function PrevisionInsights({ insights }: PrevisionInsightsProps) {
    const [isPending, startTransition] = useTransition()

    const handleRefresh = () => {
        startTransition(async () => {
            await generateInsights()
        })
    }

    return (
        <Card className="border-none bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-md shadow-xl shadow-purple-500/10 ring-1 ring-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                    </div>
                    <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        PrevisionFinance IA Insight
                    </CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isPending}
                    className="text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                </Button>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
                {isPending ? (
                    <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded-lg animate-pulse" />
                        <div className="h-4 bg-white/10 rounded-lg animate-pulse w-3/4" />
                        <div className="h-4 bg-white/10 rounded-lg animate-pulse w-1/2" />
                    </div>
                ) : insights.length === 0 ? (
                    <p className="text-sm text-purple-200/60 italic">
                        Clique no botão 🔄 para gerar seus primeiros insights financeiros com IA...
                    </p>
                ) : (
                    insights.map((insight) => (
                        <div
                            key={insight.id}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10"
                        >
                            <p className="text-sm text-purple-50 leading-relaxed whitespace-pre-line">
                                {insight.content}
                            </p>
                        </div>
                    ))
                )}
            </CardContent>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full" />
        </Card>
    )
}
