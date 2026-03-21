"use server"

import { db } from "@/lib/db"
import { syncUser } from "@/lib/user-sync"
import { revalidatePath } from "next/cache"

export async function getAccounts() {
    const user = await syncUser()
    if (!user) return []

    return await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        include: {
            _count: { select: { transactions: true } }
        }
    })
}

export async function createAccount(data: { name: string; type: string; balance?: number; color?: string; logoUrl?: string }) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    const account = await (db as any).account.create({
        data: {
            name: data.name,
            type: data.type,
            balance: data.balance || 0,
            color: data.color,
            logoUrl: data.logoUrl,
            userId: user.id
        }
    })
    revalidatePath("/")
    revalidatePath("/wallet")
    return account
}

export async function updateAccount(accountId: string, data: { name?: string; type?: string; balance?: number; color?: string; logoUrl?: string }) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    // Verifica propriedade antes de atualizar
    const existing = await db.account.findUnique({ where: { id: accountId } })
    if (!existing || existing.userId !== user.id) throw new Error("Conta não encontrada")

    const account = await (db as any).account.update({
        where: { id: accountId },
        data
    })
    revalidatePath("/")
    revalidatePath("/wallet")
    return account
}

export async function deleteAccount(accountId: string) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    // Verifica propriedade antes de deletar
    const existing = await db.account.findUnique({ where: { id: accountId } })
    if (!existing || existing.userId !== user.id) throw new Error("Conta não encontrada")

    const txCount = await db.transaction.count({
        where: { accountId, userId: user.id }
    })

    if (txCount > 0) {
        throw new Error(`Esta conta possui ${txCount} transação(ões). Remova-as primeiro.`)
    }

    await db.account.delete({ where: { id: accountId, userId: user.id } })
    revalidatePath("/")
    revalidatePath("/wallet")
}

export async function getAccountWithTransactions(accountId: string) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    const account = await db.account.findUnique({
        where: { id: accountId },
        include: {
            transactions: {
                orderBy: { date: "desc" },
                take: 50,
                include: { category: true }
            }
        }
    })

    // Garante que o usuário só acessa suas próprias contas
    if (!account || account.userId !== user.id) throw new Error("Conta não encontrada")

    return account
}
