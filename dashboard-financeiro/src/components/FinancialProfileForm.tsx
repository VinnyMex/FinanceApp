"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, Target, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea" -> Não existe, usando Input ou removendo uso
import { updateFinancialProfile } from "@/app/(dashboard)/actions/settings"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const profileSchema = z.object({
    salary: z.coerce.number().min(0, "Valor inválido"),
    foodVoucher: z.coerce.number().min(0, "Valor inválido"),
    transportVoucher: z.coerce.number().min(0, "Valor inválido"),
    goal1: z.string().optional(),
    goal2: z.string().optional(),
    goal3: z.string().optional(),
})

interface FinancialProfileFormProps {
    initialData: {
        salary: number
        foodVoucher: number
        transportVoucher: number
        goal1?: string | null
        goal2?: string | null
        goal3?: string | null
    }
}

export function FinancialProfileForm({ initialData }: FinancialProfileFormProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            salary: initialData.salary || 0,
            foodVoucher: initialData.foodVoucher || 0,
            transportVoucher: initialData.transportVoucher || 0,
            goal1: initialData.goal1 || "",
            goal2: initialData.goal2 || "",
            goal3: initialData.goal3 || "",
        },
    })

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setLoading(true)
        try {
            await updateFinancialProfile(values)
            toast.success("Perfil financeiro atualizado!")
        } catch (error) {
            toast.error("Erro ao salvar perfil.")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* RENDA FIXA */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-emerald-500" />
                            Renda Fixa Mensal
                        </CardTitle>
                        <CardDescription>
                            Informe seus ganhos fixos para ajudar no cálculo de saldo disponível.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salário Líquido (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="foodVoucher"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vale Alimentação/Refeição (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="transportVoucher"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vale Transporte (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* OBJETIVOS */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            Objetivos Financeiros
                        </CardTitle>
                        <CardDescription>
                            Defina até 3 objetivos para que nossa IA possa te orientar melhor.
                            Ex: "Comprar moto de 15k", "Juntar 10k para reserva".
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="goal1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objetivo Principal (Prioridade 1)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Comprar uma moto (R$ 15.000)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="goal2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Objetivo Secundário</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Viagem de fim de ano" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="goal3"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Objetivo Terciário</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Reserva de emergência" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading} size="lg">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Perfil Completo
                    </Button>
                </div>
            </form>
        </Form>
    )
}
