"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Tag, Smartphone, Bell, Save, Check, Send, Loader2 } from "lucide-react"
import { createCategory, deleteCategory } from "@/app/(dashboard)/actions/categories"
import { updateUserSettings } from "@/app/(dashboard)/actions/settings"
import { sendTestMessage } from "@/app/(dashboard)/actions/whatsapp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Category = {
    id: string
    name: string
    _count: { transactions: number }
}

const ALERT_OPTIONS = [
    { value: 0, label: "Desativado" },
    { value: 1, label: "1 dia antes" },
    { value: 3, label: "3 dias antes" },
    { value: 5, label: "5 dias antes" },
    { value: 7, label: "7 dias antes" },
]

export function SettingsClient({
    categories,
    whatsapp,
    alertFrequency
}: {
    categories: Category[]
    whatsapp: string
    alertFrequency: number
}) {
    const [isPending, startTransition] = useTransition()
    const [newCatName, setNewCatName] = useState("")
    const [phone, setPhone] = useState(whatsapp)
    const [alertFreq, setAlertFreq] = useState(alertFrequency)
    const [saved, setSaved] = useState(false)
    const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
    const [testError, setTestError] = useState("")

    const handleAddCategory = () => {
        if (!newCatName.trim()) return
        startTransition(async () => {
            await createCategory(newCatName.trim())
            setNewCatName("")
        })
    }

    const handleDeleteCategory = (id: string) => {
        startTransition(async () => {
            try {
                await deleteCategory(id)
            } catch (err: any) {
                alert(err.message)
            }
        })
    }

    const handleSaveSettings = () => {
        startTransition(async () => {
            try {
                await updateUserSettings({
                    whatsapp: phone,
                    alertFrequency: alertFreq,
                })
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
            } catch (err: any) {
                alert("Erro ao salvar: " + err.message)
            }
        })
    }

    const handleTestWhatsApp = async () => {
        if (!phone.trim()) {
            alert("Informe o número WhatsApp antes de testar.")
            return
        }

        // Reset states
        setTestStatus("sending")
        setTestError("")

        try {
            // 1. Save settings first
            try {
                await updateUserSettings({ whatsapp: phone, alertFrequency: alertFreq })
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
            } catch (saveError: any) {
                setTestStatus("error")
                setTestError("Falha ao salvar configurações: " + saveError.message)
                return // Stop if save fails
            }

            // 2. Send test message
            const result = await sendTestMessage()

            if (result.success) {
                setTestStatus("success")
                setTimeout(() => setTestStatus("idle"), 3000)
            } else {
                setTestStatus("error")
                // Check for common connection errors
                if (result.error?.includes("fetch failed") || result.error?.includes("ECONNREFUSED")) {
                    setTestError("Erro de conexão com EvolutionAPI. Verifique se o serviço está rodando.")
                } else {
                    setTestError(result.error || "Falha ao enviar")
                }
                setTimeout(() => setTestStatus("idle"), 5000)
            }
        } catch (err: any) {
            setTestStatus("error")
            setTestError("Erro inesperado: " + err.message)
            setTimeout(() => setTestStatus("idle"), 5000)
        }
    }

    return (
        <div className="space-y-8">
            {/* Categories */}
            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Categorias</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Gerencie as categorias de suas transações.</p>
                </div>

                <div className="p-5 space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nova categoria..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                        />
                        <Button onClick={handleAddCategory} disabled={isPending} size="sm" className="gap-1">
                            <Plus className="h-4 w-4" /> Adicionar
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium group"
                            >
                                <span>{cat.name}</span>
                                <span className="text-xs text-primary/50">({cat._count.transactions})</span>
                                <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-primary/50 hover:text-destructive"
                                    title="Excluir categoria"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhuma categoria criada.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* WhatsApp Alerts */}
            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold">Alertas WhatsApp</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Receba alertas de transações e vencimentos no seu WhatsApp.</p>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Número WhatsApp</label>
                        <Input
                            placeholder="5511999999999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Formato: código país + DDD + número (sem espaços)</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                            <Bell className="h-4 w-4" /> Frequência de Alerta
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ALERT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setAlertFreq(opt.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${alertFreq === opt.value
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button onClick={handleSaveSettings} disabled={isPending} className="gap-2">
                            {saved ? (
                                <>
                                    <Check className="h-4 w-4" /> Salvo!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" /> Salvar Configurações
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleTestWhatsApp}
                            disabled={testStatus === "sending" || !phone.trim()}
                            className="gap-2"
                        >
                            {testStatus === "sending" ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                                </>
                            ) : testStatus === "success" ? (
                                <>
                                    <Check className="h-4 w-4 text-emerald-500" /> Enviado!
                                </>
                            ) : testStatus === "error" ? (
                                <>
                                    <Send className="h-4 w-4 text-destructive" /> Falhou
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" /> Testar WhatsApp
                                </>
                            )}
                        </Button>
                    </div>

                    {testStatus === "error" && testError && (
                        <p className="text-xs text-destructive mt-1">{testError}</p>
                    )}

                    {testStatus === "success" && (
                        <p className="text-xs text-emerald-500 mt-1">✅ Mensagem de teste enviada! Verifique seu WhatsApp.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
