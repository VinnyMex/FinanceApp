"use server"

import { db } from "@/lib/db"
import { syncUser } from "@/lib/user-sync"
import { sendWhatsAppMessage, formatTransactionAlert, formatDueAlert } from "@/lib/whatsapp"

export async function sendTransactionAlert(transactionData: {
    type: string
    description: string
    amount: number
    date: string
}) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    // Buscar whatsapp do usuário
    const userData = await (db as any).user.findUnique({
        where: { id: user.id },
        select: { whatsapp: true, alertFrequency: true }
    })

    if (!userData?.whatsapp) {
        return { success: false, error: "Número WhatsApp não configurado. Acesse Configurações para adicionar." }
    }

    const message = formatTransactionAlert(
        transactionData.type,
        transactionData.description,
        transactionData.amount,
        transactionData.date
    )

    return await sendWhatsAppMessage(userData.whatsapp, message)
}

export async function sendTestMessage() {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    const userData = await (db as any).user.findUnique({
        where: { id: user.id },
        select: { whatsapp: true }
    })

    if (!userData?.whatsapp) {
        return { success: false, error: "Número WhatsApp não configurado." }
    }

    const message = `✅ *Teste de Conexão - PrevisionFinance*

Seu WhatsApp está conectado com sucesso!
Você receberá alertas de transações e vencimentos aqui.

_Enviado pelo PrevisionFinance_`

    return await sendWhatsAppMessage(userData.whatsapp, message)
}

export async function checkDueTransactions() {
    const users = await (db as any).user.findMany({
        where: {
            whatsapp: { not: null },
            alertFrequency: { gt: 0 }
        }
    })

    for (const user of users) {
        const daysAhead = user.alertFrequency || 3
        const now = new Date()
        const futureDate = new Date(now)
        futureDate.setDate(futureDate.getDate() + daysAhead)

        const upcomingTransactions = await db.transaction.findMany({
            where: {
                userId: user.id,
                type: "EXPENSE",
                date: {
                    gte: now,
                    lte: futureDate
                }
            },
            orderBy: { date: "asc" }
        })

        for (const tx of upcomingTransactions) {
            const daysUntil = Math.ceil(
                (new Date(tx.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )

            const message = formatDueAlert(
                tx.description,
                tx.amount,
                daysUntil,
                new Date(tx.date).toLocaleDateString("pt-BR")
            )

            await sendWhatsAppMessage(user.whatsapp, message)
        }
    }

    return { success: true }
}
