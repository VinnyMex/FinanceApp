"use server"

import { db } from "@/lib/db"
import { syncUser } from "@/lib/user-sync"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
    const user = await syncUser()
    if (!user) return []

    return await (db as any).notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20
    })
}

export async function markNotificationRead(notificationId: string) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    await (db as any).notification.update({
        where: { id: notificationId },
        data: { read: true }
    })
    revalidatePath("/")
}

export async function markAllNotificationsRead() {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    await (db as any).notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true }
    })
    revalidatePath("/")
}

export async function createNotification(data: { title: string; message: string; type?: string }) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    await (db as any).notification.create({
        data: {
            title: data.title,
            message: data.message,
            type: data.type || "INFO",
            userId: user.id
        }
    })
    revalidatePath("/")
}
