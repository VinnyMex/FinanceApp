"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { updateTransaction, deleteTransaction } from "@/app/(dashboard)/actions/transactions"

const formSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.coerce.number().positive("Valor deve ser maior que zero"),
    date: z.date({
        required_error: "Data é obrigatória",
    }),
    type: z.enum(["INCOME", "EXPENSE"]),
    categoryName: z.string().min(1, "Categoria é obrigatória"),
    accountName: z.string().min(1, "Conta é obrigatória"),
    frequency: z.enum(["VARIABLE", "FIXED", "INSTALLMENT"]),
    status: z.enum(["PENDING", "COMPLETED", "CANCELED"]),
})

type TransactionFormValues = z.infer<typeof formSchema>

interface EditTransactionDialogProps {
    transaction: any
    categories?: string[]
    accounts?: string[]
}

export function EditTransactionDialog({
    transaction,
    categories = [],
    accounts = [],
}: EditTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [newCategory, setNewCategory] = useState(false)
    const [newAccount, setNewAccount] = useState(false)

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            categoryName: transaction.category?.name || "",
            accountName: transaction.account?.name || "",
            date: new Date(transaction.date),
            frequency: transaction.frequency,
            status: transaction.status || "COMPLETED",
        },
    })

    async function onSubmit(values: TransactionFormValues) {
        if (loading) return
        setLoading(true)
        try {
            await updateTransaction(transaction.id, values)
            setOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (isDeleting) return
        setIsDeleting(true)
        if (confirm("Tem certeza que deseja excluir esta transação?")) {
            try {
                await deleteTransaction(transaction.id)
                setOpen(false)
            } catch (error) {
                console.error(error)
            } finally {
                setIsDeleting(false)
            }
        } else {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Editar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Transação</DialogTitle>
                    <DialogDescription>
                        Alterar detalhes ou atualizar status da transação.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("EXPENSE")}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                                                field.value === "EXPENSE"
                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                                    : "bg-accent/50 text-muted-foreground border-transparent hover:bg-accent"
                                            )}
                                        >
                                            Despesa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("INCOME")}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                                                field.value === "INCOME"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                    : "bg-accent/50 text-muted-foreground border-transparent hover:bg-accent"
                                            )}
                                        >
                                            Receita
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("COMPLETED")}
                                            className={cn(
                                                "px-2 py-1.5 rounded-lg text-xs font-bold transition-all border uppercase",
                                                field.value === "COMPLETED"
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                                    : "bg-accent/50 text-muted-foreground border-transparent hover:bg-accent"
                                            )}
                                        >
                                            Pago / Recebido
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("PENDING")}
                                            className={cn(
                                                "px-2 py-1.5 rounded-lg text-xs font-bold transition-all border uppercase",
                                                field.value === "PENDING"
                                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                                    : "bg-accent/50 text-muted-foreground border-transparent hover:bg-accent"
                                            )}
                                        >
                                            Pendente
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange("CANCELED")}
                                            className={cn(
                                                "px-2 py-1.5 rounded-lg text-xs font-bold transition-all border uppercase",
                                                field.value === "CANCELED"
                                                    ? "bg-muted text-muted-foreground border-border"
                                                    : "bg-accent/50 text-muted-foreground border-transparent hover:bg-accent"
                                            )}
                                        >
                                            Cancelado
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Supermercado, Salário..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2.5">
                                        <FormLabel>Data</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Escolha uma data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    locale={ptBR}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frequência</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="VARIABLE">Variável</SelectItem>
                                            <SelectItem value="FIXED">Fixa Mensal</SelectItem>
                                            <SelectItem value="INSTALLMENT">Parcelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category - selectable buttons */}
                        <FormField
                            control={form.control}
                            name="categoryName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    {categories.length > 0 && !newCategory && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => field.onChange(cat)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                                                        field.value === cat
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-accent/50 text-muted-foreground border-border/50 hover:bg-accent"
                                                    )}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => { setNewCategory(true); field.onChange("") }}
                                                className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                                            >
                                                + Nova
                                            </button>
                                        </div>
                                    )}
                                    {(categories.length === 0 || newCategory) && (
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input placeholder="Ex: Alimentação" {...field} />
                                            </FormControl>
                                            {newCategory && (
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setNewCategory(false)}>
                                                    Voltar
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Account - selectable buttons */}
                        <FormField
                            control={form.control}
                            name="accountName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conta</FormLabel>
                                    {accounts.length > 0 && !newAccount && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {accounts.map((acc) => (
                                                <button
                                                    key={acc}
                                                    type="button"
                                                    onClick={() => field.onChange(acc)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                                                        field.value === acc
                                                            ? "bg-primary text-primary-foreground border-primary"
                                                            : "bg-accent/50 text-muted-foreground border-border/50 hover:bg-accent"
                                                    )}
                                                >
                                                    {acc}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => { setNewAccount(true); field.onChange("") }}
                                                className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                                            >
                                                + Nova
                                            </button>
                                        </div>
                                    )}
                                    {(accounts.length === 0 || newAccount) && (
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input placeholder="Ex: Itaú, Nubank" {...field} />
                                            </FormControl>
                                            {newAccount && (
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setNewAccount(false)}>
                                                    Voltar
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="destructive" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isDeleting ? "Excluindo..." : "Excluir"}
                            </Button>
                            <Button type="submit" className="flex-[2]" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
