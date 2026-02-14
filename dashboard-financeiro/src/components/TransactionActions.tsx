"use client"

import { useState, useTransition } from "react"
import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { deleteTransaction, updateTransaction } from "@/app/(dashboard)/actions/transactions"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Transaction = {
    id: string
    description: string
    amount: number
    date: Date
    type: string
    frequency: string
    category: { name: string }
    account: { name: string }
}

export function TransactionActions({ transaction }: { transaction: Transaction }) {
    const [showMenu, setShowMenu] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [editData, setEditData] = useState({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
    })

    const handleDelete = () => {
        startTransition(async () => {
            await deleteTransaction(transaction.id)
            setShowDelete(false)
        })
    }

    const handleEdit = () => {
        startTransition(async () => {
            await updateTransaction(transaction.id, {
                description: editData.description,
                amount: editData.amount,
                type: editData.type,
            })
            setShowEdit(false)
        })
    }

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    title="Ações da transação"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu && (
                    <div className="absolute right-0 top-8 bg-card border border-border/50 rounded-lg shadow-xl z-50 min-w-[140px] overflow-hidden">
                        <button
                            onClick={() => { setShowEdit(true); setShowMenu(false) }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                            <Pencil className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                            onClick={() => { setShowDelete(true); setShowMenu(false) }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={showEdit} onOpenChange={setShowEdit}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Editar Transação</DialogTitle>
                        <DialogDescription>Altere os campos e salve.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Descrição</label>
                            <Input
                                value={editData.description}
                                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Valor (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={editData.amount}
                                onChange={(e) => setEditData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tipo</label>
                            <Select value={editData.type} onValueChange={(v) => setEditData(prev => ({ ...prev, type: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                                    <SelectItem value="INCOME">Receita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowEdit(false)}>
                                Cancelar
                            </Button>
                            <Button className="flex-1" onClick={handleEdit} disabled={isPending}>
                                {isPending ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="sm:max-w-[360px]">
                    <DialogHeader>
                        <DialogTitle>Excluir Transação</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir "{transaction.description}"? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={isPending}>
                            {isPending ? "Excluindo..." : "Excluir"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
