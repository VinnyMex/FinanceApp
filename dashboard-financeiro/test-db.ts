import "dotenv/config";
import { db } from "./src/lib/db";


async function main() {
    try {
        console.log("⏳ Testando conexão com Turso...");
        const userCount = await db.user.count();
        console.log(`✅ Conexão estabelecida! Total de usuários: ${userCount}`);
    } catch (error) {
        console.error("❌ Erro ao conectar com Turso:", error);
    } finally {
        await db.$disconnect();
    }
}

main();
