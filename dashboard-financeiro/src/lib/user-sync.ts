import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function syncUser() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
        return null;
    }

    // Tenta encontrar o usuário no banco
    let user = await db.user.findUnique({
        where: { email },
    });

    // Se não existir, cria
    if (!user) {
        user = await db.user.create({
            data: {
                id: clerkUser.id,
                email: email,
                name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Usuário",
            },
        });
    }

    return user;
}
