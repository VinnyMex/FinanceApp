"use server"

import { db } from "@/lib/db"
import { syncUser } from "@/lib/user-sync"
import { revalidatePath } from "next/cache"

export async function getCategories() {
    const user = await syncUser()
    if (!user) return []

    return await db.category.findMany({
        where: { userId: user.id },
        orderBy: { name: "asc" }
    })
}

export async function createCategory(name: string) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    const existing = await db.category.findFirst({
        where: { name, userId: user.id }
    })
    if (existing) return existing

    const category = await db.category.create({
        data: { name, userId: user.id }
    })
    revalidatePath("/")
    revalidatePath("/settings")
    return category
}

export async function deleteCategory(categoryId: string) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    // Check if category has transactions
    const txCount = await db.transaction.count({
        where: { categoryId, userId: user.id }
    })

    if (txCount > 0) {
        throw new Error(`Esta categoria possui ${txCount} transação(ões). Remova-as primeiro.`)
    }

    await db.category.delete({ where: { id: categoryId } })
    revalidatePath("/")
    revalidatePath("/settings")
}
