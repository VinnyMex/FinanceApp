"use server"

import { db } from "@/lib/db"
import { syncUser } from "@/lib/user-sync"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
    salary: z.coerce.number().min(0),
    foodVoucher: z.coerce.number().min(0),
    transportVoucher: z.coerce.number().min(0),
    goal1: z.string().optional(),
    goal2: z.string().optional(),
    goal3: z.string().optional(),
})

export async function updateFinancialProfile(formData: z.infer<typeof profileSchema>) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    await db.user.update({
        where: { id: user.id },
        data: {
            salary: formData.salary,
            foodVoucher: formData.foodVoucher,
            transportVoucher: formData.transportVoucher,
            goal1: formData.goal1,
            goal2: formData.goal2,
            goal3: formData.goal3,
        }
    })

    revalidatePath("/settings")
    revalidatePath("/") // Dashboard uses this info now
    return { success: true }
}

const settingsSchema = z.object({
    whatsapp: z.string().optional(),
    alertFrequency: z.number().min(0).max(30),
})

export async function updateUserSettings(data: z.infer<typeof settingsSchema>) {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    await db.user.update({
        where: { id: user.id },
        data: {
            whatsapp: data.whatsapp,
            alertFrequency: data.alertFrequency,
        }
    })

    revalidatePath("/settings")
    return { success: true }
}
