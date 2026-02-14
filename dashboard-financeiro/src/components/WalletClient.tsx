"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, PiggyBank, TrendingUp, Banknote, Pencil, X, ExternalLink } from "lucide-react"
import { createAccount, deleteAccount, updateAccount } from "@/app/(dashboard)/actions/accounts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const ACCOUNT_TYPES = [
    { value: "CHECKING", label: "Conta Corrente", icon: Wallet },
    { value: "SAVINGS", label: "Poupança", icon: PiggyBank },
    { value: "INVESTMENT", label: "Investimento", icon: TrendingUp },
    { value: "CREDIT", label: "Cartão de Crédito", icon: CreditCard },
    { value: "CASH", label: "Dinheiro", icon: Banknote },
]

const COLORS = ["#a855f7", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"]

// Logos padrão de bancos populares brasileiros
const DEFAULT_LOGOS: Record<string, string> = {
    "nubank": "https://logo.clearbit.com/nubank.com.br",
    "itaú": "https://logo.clearbit.com/itau.com.br",
    "itau": "https://logo.clearbit.com/itau.com.br",
    "bradesco": "https://logo.clearbit.com/bradesco.com.br",
    "banco do brasil": "https://logo.clearbit.com/bb.com.br",
    "santander": "https://logo.clearbit.com/santander.com.br",
    "caixa": "https://logo.clearbit.com/caixa.gov.br",
    "inter": "https://logo.clearbit.com/bancointer.com.br",
    "c6": "https://logo.clearbit.com/c6bank.com.br",
    "c6 bank": "https://logo.clearbit.com/c6bank.com.br",
    "btg": "https://logo.clearbit.com/btgpactual.com",
    "picpay": "https://logo.clearbit.com/picpay.com",
    "mercado pago": "https://logo.clearbit.com/mercadopago.com.br",
    "pagbank": "https://logo.clearbit.com/pagseguro.com.br",
    "neon": "https://logo.clearbit.com/neon.com.br",
    "original": "https://logo.clearbit.com/original.com.br",
    "next": "https://logo.clearbit.com/next.me",
    "will bank": "https://logo.clearbit.com/willbank.com.br",
    "sicoob": "https://logo.clearbit.com/sicoob.com.br",
    "sicredi": "https://logo.clearbit.com/sicredi.com.br",
}

function getDefaultLogo(name: string): string | null {
    const lower = name.toLowerCase().trim()
    for (const [key, url] of Object.entries(DEFAULT_LOGOS)) {
        if (lower.includes(key)) return url
    }
    return null
}

export function WalletClient({ accounts }: { accounts: any[] }) {
    const [showNew, setShowNew] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [newName, setNewName] = useState("")
    const [newType, setNewType] = useState("CHECKING")
    const [newBalance, setNewBalance] = useState("")
    const [newLogoUrl, setNewLogoUrl] = useState("")
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

    // Edit state
    const [editId, setEditId] = useState("")
    const [editName, setEditName] = useState("")
    const [editType, setEditType] = useState("")
    const [editBalance, setEditBalance] = useState("")
    const [editLogoUrl, setEditLogoUrl] = useState("")

    const handleCreate = () => {
        if (!newName.trim() || isPending) return
        startTransition(async () => {
            const detectedLogo = getDefaultLogo(newName)
            await createAccount({
                name: newName.trim(),
                type: newType,
                balance: parseFloat(newBalance) || 0,
                color: COLORS[accounts.length % COLORS.length],
                logoUrl: newLogoUrl.trim() || detectedLogo || undefined,
            })
            setShowNew(false)
            setNewName("")
            setNewBalance("")
            setNewLogoUrl("")
        })
    }

    const handleOpenEdit = (account: any) => {
        setEditId(account.id)
        setEditName(account.name)
        setEditType(account.type)
        setEditBalance(String(account.balance))
        setEditLogoUrl(account.logoUrl || "")
        setShowEdit(true)
    }

    const handleSaveEdit = () => {
        if (!editName.trim() || isPending) return
        startTransition(async () => {
            await updateAccount(editId, {
                name: editName.trim(),
                type: editType,
                balance: parseFloat(editBalance) || 0,
                logoUrl: editLogoUrl.trim() || undefined,
            })
            setShowEdit(false)
        })
    }

    const handleDelete = (accountId: string) => {
        if (!confirm("Tem certeza? A conta só pode ser excluída se não tiver transações.")) return
        startTransition(async () => {
            try {
                await deleteAccount(accountId)
            } catch (err: any) {
                alert(err.message)
            }
        })
    }

    const selected = accounts.find(a => a.id === selectedAccount)

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account: any, i: number) => {
                    const income = account.transactions
                        .filter((t: any) => t.type === "INCOME")
                        .reduce((s: number, t: any) => s + t.amount, 0)
                    const expense = account.transactions
                        .filter((t: any) => t.type === "EXPENSE")
                        .reduce((s: number, t: any) => s + t.amount, 0)
                    const Icon = ACCOUNT_TYPES.find(t => t.value === account.type)?.icon || Wallet
                    const accountColor = account.color || COLORS[i % COLORS.length]
                    const logoSrc = account.logoUrl || getDefaultLogo(account.name)

                    return (
                        <div
                            key={account.id}
                            onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
                            className={`rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${selectedAccount === account.id ? "border-primary ring-1 ring-primary" : "border-border/50"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {logoSrc ? (
                                        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-white/10 overflow-hidden">
                                            <img
                                                src={logoSrc}
                                                alt={account.name}
                                                className="h-8 w-8 rounded object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none"
                                                    const parent = (e.target as HTMLImageElement).parentElement
                                                    if (parent) parent.innerHTML = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1"/></svg>`
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: accountColor + "20" }}
                                        >
                                            <Icon className="h-5 w-5" style={{ color: accountColor }} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold">{account.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {ACCOUNT_TYPES.find(t => t.value === account.type)?.label || account.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(account) }}
                                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                        title="Editar conta"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(account.id) }}
                                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                        title="Excluir conta"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <p className={`text-2xl font-bold ${account.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(account.balance)}
                            </p>

                            <div className="flex gap-4 mt-3 text-xs">
                                <div className="flex items-center gap-1 text-emerald-500">
                                    <ArrowUpCircle className="h-3 w-3" />
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(income)}
                                </div>
                                <div className="flex items-center gap-1 text-rose-500">
                                    <ArrowDownCircle className="h-3 w-3" />
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(expense)}
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground mt-2">{account._count.transactions} transações</p>
                        </div>
                    )
                })}

                {/* Add new account */}
                <button
                    onClick={() => setShowNew(true)}
                    className="rounded-xl border border-dashed border-border/50 p-5 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[180px]"
                >
                    <Plus className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">Nova Conta</span>
                </button>
            </div>

            {/* Transaction history for selected account */}
            {selected && selected.transactions.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden mt-6">
                    <div className="p-4 border-b border-border/50">
                        <h3 className="font-semibold">Últimas transações – {selected.name}</h3>
                    </div>
                    <div className="divide-y divide-border/50">
                        {selected.transactions.map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    {t.type === "INCOME" ? (
                                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">{t.description}</p>
                                        <p className="text-xs text-muted-foreground">{t.category?.name} • {new Date(t.date).toLocaleDateString("pt-BR")}</p>
                                    </div>
                                </div>
                                <span className={`text-sm font-semibold ${t.type === "INCOME" ? "text-emerald-500" : "text-rose-500"}`}>
                                    {t.type === "INCOME" ? "+" : "-"}R$ {t.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New Account Dialog */}
            <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Nova Conta</DialogTitle>
                        <DialogDescription>Adicione uma nova conta bancária ou carteira.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Nome</label>
                            <Input
                                placeholder="Ex: Nubank, Itaú..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tipo</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ACCOUNT_TYPES.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setNewType(t.value)}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${newType === t.value
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border/50 text-muted-foreground hover:bg-accent"
                                            }`}
                                    >
                                        <t.icon className="h-4 w-4" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Saldo Inicial (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newBalance}
                                onChange={(e) => setNewBalance(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">URL do Logo (opcional)</label>
                            <Input
                                placeholder="https://..."
                                value={newLogoUrl}
                                onChange={(e) => setNewLogoUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Deixe vazio para usar o logo oficial detectado automaticamente.
                            </p>
                        </div>
                        <Button className="w-full" onClick={handleCreate} disabled={isPending || !newName.trim()}>
                            {isPending ? "Criando..." : "Criar Conta"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Account Dialog */}
            <Dialog open={showEdit} onOpenChange={setShowEdit}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Editar Conta</DialogTitle>
                        <DialogDescription>Altere os dados da conta. Você pode ajustar o saldo manualmente.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Nome</label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tipo</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ACCOUNT_TYPES.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setEditType(t.value)}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${editType === t.value
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border/50 text-muted-foreground hover:bg-accent"
                                            }`}
                                    >
                                        <t.icon className="h-4 w-4" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Saldo Atual (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={editBalance}
                                onChange={(e) => setEditBalance(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Ajuste o saldo manualmente para corrigir erros ou importar o valor real.
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">URL do Logo</label>
                            <Input
                                placeholder="https://..."
                                value={editLogoUrl}
                                onChange={(e) => setEditLogoUrl(e.target.value)}
                            />
                            {editLogoUrl && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-8 w-8 rounded bg-white/10 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={editLogoUrl}
                                            alt="Preview"
                                            className="h-6 w-6 object-contain"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">Preview do logo</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowEdit(false)}>
                                Cancelar
                            </Button>
                            <Button className="flex-1" onClick={handleSaveEdit} disabled={isPending || !editName.trim()}>
                                {isPending ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
