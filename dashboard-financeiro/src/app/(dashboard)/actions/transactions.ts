"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { syncUser } from "@/lib/user-sync"
import { z } from "zod"
import { addMonths } from "date-fns"
import { sendWhatsAppMessage, formatTransactionAlert } from "@/lib/whatsapp"

const transactionSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.coerce.number().positive("Valor deve ser maior que zero"),
    date: z.date(),
    type: z.enum(["INCOME", "EXPENSE"]),
    categoryName: z.string().min(1, "Categoria é obrigatória"),
    accountName: z.string().min(1, "Conta é obrigatória"),
    frequency: z.enum(["VARIABLE", "FIXED", "INSTALLMENT"]).default("VARIABLE"),
    status: z.enum(["PENDING", "COMPLETED", "CANCELED"]).default("COMPLETED"),
    installmentsTotal: z.coerce.number().int().min(1).optional(),
})

export async function createTransaction(formData: z.infer<typeof transactionSchema>) {
    const user = await syncUser()

    if (!user) {
        throw new Error("Usuário não autenticado")
    }

    let account = await db.account.findFirst({
        where: { name: formData.accountName, userId: user.id },
    })

    if (!account) {
        account = await db.account.create({
            data: {
                name: formData.accountName,
                userId: user.id,
                type: "CHECKING",
                balance: 0,
            },
        })
    }

    let category = await db.category.findFirst({
        where: { name: formData.categoryName, userId: user.id },
    })

    if (!category) {
        category = await db.category.create({
            data: {
                name: formData.categoryName,
                userId: user.id,
            },
        })
    }

    const recurrenceId = formData.frequency === "INSTALLMENT" ? Math.random().toString(36).substring(7) : null
    const initialStatus = formData.status || "COMPLETED"

    if (formData.frequency === "INSTALLMENT" && formData.installmentsTotal && formData.installmentsTotal > 1) {
        const transactions = []
        for (let i = 0; i < formData.installmentsTotal; i++) {
            // Parcela 1 segue o status escolhido, as outras nascem PENDING
            const installmentStatus = i === 0 ? initialStatus : "PENDING"

            transactions.push({
                description: formData.description,
                amount: formData.amount,
                date: addMonths(formData.date, i),
                type: formData.type,
                frequency: "INSTALLMENT",
                status: installmentStatus,
                installmentsTotal: formData.installmentsTotal,
                currentInstallment: i + 1,
                recurrenceId: recurrenceId,
                accountId: account.id,
                categoryId: category.id,
                userId: user.id,
            })
        }

        await db.transaction.createMany({
            data: transactions,
        })
    } else {
        await db.transaction.create({
            data: {
                description: formData.description,
                amount: formData.amount,
                date: formData.date,
                type: formData.type,
                frequency: formData.frequency,
                status: initialStatus,
                installmentsTotal: formData.frequency === "INSTALLMENT" ? 1 : null,
                currentInstallment: formData.frequency === "INSTALLMENT" ? 1 : null,
                recurrenceId: recurrenceId,
                accountId: account.id,
                categoryId: category.id,
                userId: user.id,
            },
        })
    }

    // Update balance ONLY if status is COMPLETED
    if (initialStatus === "COMPLETED") {
        const multiplier = formData.type === "INCOME" ? 1 : -1
        await db.account.update({
            where: { id: account.id },
            data: {
                balance: {
                    increment: formData.amount * multiplier,
                },
            },
        })
    }

    // Create notification (non-blocking)
    try {
        await (db as any).notification.create({
            data: {
                title: formData.type === "INCOME" ? "Nova receita" : "Nova despesa",
                message: `${formData.description}: R$ ${formData.amount.toFixed(2)}`,
                type: "SUCCESS",
                userId: user.id
            }
        })
    } catch (notifError) {
        console.warn("Falha ao criar notificação:", notifError)
    }

    // Send WhatsApp alert (non-blocking)
    try {
        const userData = await (db as any).user.findUnique({
            where: { id: user.id },
            select: { whatsapp: true, alertFrequency: true }
        })
        if (userData?.whatsapp) {
            const message = formatTransactionAlert(
                formData.type,
                formData.description,
                formData.amount,
                new Date(formData.date).toLocaleDateString("pt-BR")
            )
            await sendWhatsAppMessage(userData.whatsapp, message)
        }
    } catch (whatsappError) {
        console.warn("Falha ao enviar alerta WhatsApp:", whatsappError)
    }

    revalidatePath("/")
    revalidatePath("/transactions")
    revalidatePath("/reports")
    revalidatePath("/wallet")
    revalidatePath("/payables")

    return { success: true }
}

export async function updateTransaction(transactionId: string, formData: {
    description?: string;
    amount?: number;
    date?: Date;
    type?: string;
    categoryName?: string;
    accountName?: string;
    frequency?: string;
    status?: string;
}) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    const existing = await db.transaction.findUnique({ where: { id: transactionId } })
    if (!existing || existing.userId !== user.id) throw new Error("Transação não encontrada")

    const updateData: any = {}

    if (formData.description) updateData.description = formData.description
    if (formData.amount) updateData.amount = formData.amount
    if (formData.date) updateData.date = formData.date
    if (formData.type) updateData.type = formData.type
    if (formData.frequency) updateData.frequency = formData.frequency
    if (formData.status) updateData.status = formData.status

    if (formData.categoryName) {
        let category = await db.category.findFirst({
            where: { name: formData.categoryName, userId: user.id }
        })
        if (!category) {
            category = await db.category.create({
                data: { name: formData.categoryName, userId: user.id }
            })
        }
        updateData.categoryId = category.id
    }

    if (formData.accountName) {
        let account = await db.account.findFirst({
            where: { name: formData.accountName, userId: user.id }
        })
        if (!account) {
            account = await db.account.create({
                data: { name: formData.accountName, userId: user.id, type: "CHECKING", balance: 0 }
            })
        }
        updateData.accountId = account.id
    }

    // Logic to update balance
    // 1. Revert old impact IF it was COMPLETED
    // 2. Apply new impact IF it is COMPLETED

    const oldStatus = existing.status || "COMPLETED" // Default for old records
    const newStatus = formData.status || oldStatus

    // If needed, we revert the old amount from the OLD account
    if (oldStatus === "COMPLETED") {
        const oldMultiplier = existing.type === "INCOME" ? 1 : -1
        await db.account.update({
            where: { id: existing.accountId },
            data: { balance: { decrement: existing.amount * oldMultiplier } }
        })
    }

    // Apply new amount to the NEW (or same) account
    if (newStatus === "COMPLETED") {
        const newType = formData.type || existing.type
        const newAmount = formData.amount || existing.amount
        const newMultiplier = newType === "INCOME" ? 1 : -1
        const targetAccountId = updateData.accountId || existing.accountId

        await db.account.update({
            where: { id: targetAccountId },
            data: { balance: { increment: newAmount * newMultiplier } }
        })
    }

    await db.transaction.update({
        where: { id: transactionId },
        data: updateData
    })

    revalidatePath("/")
    revalidatePath("/transactions")
    revalidatePath("/reports")
    revalidatePath("/wallet")
    revalidatePath("/payables")

    return { success: true }
}

export async function deleteTransaction(transactionId: string) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    const transaction = await db.transaction.findUnique({ where: { id: transactionId } })
    if (!transaction || transaction.userId !== user.id) throw new Error("Transação não encontrada")

    // Reverse balance impact ONLY if status was COMPLETED
    const currentStatus = transaction.status || "COMPLETED"

    if (currentStatus === "COMPLETED") {
        const multiplier = transaction.type === "INCOME" ? 1 : -1
        await db.account.update({
            where: { id: transaction.accountId },
            data: { balance: { decrement: transaction.amount * multiplier } }
        })
    }

    await db.transaction.delete({ where: { id: transactionId } })

    revalidatePath("/")
    revalidatePath("/transactions")
    revalidatePath("/reports")
    revalidatePath("/wallet")
    revalidatePath("/payables")

    return { success: true }
}
