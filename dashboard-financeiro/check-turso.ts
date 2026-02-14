
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("❌ TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN não definidos no .env");
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function main() {
    console.log(`📡 Conectando ao Turso: ${url}`);

    try {
        const result = await client.execute("PRAGMA table_info(User)");

        // Pragma table_info retorna colunas: cid, name, type, notnull, dflt_value, pk
        const columns = result.rows.map(r => r.name);

        console.log("📋 Colunas encontradas na tabela User:", columns);

        const needed = ["salary", "foodVoucher", "transportVoucher", "goal1"];
        const missing = needed.filter(c => !columns.includes(c));

        if (missing.length > 0) {
            console.error("❌ FALTAM COLUNAS! O banco não tem: ", missing);
            console.error("⚠️  O script SQL não foi rodado neste banco ou não funcionou.");
        } else {
            console.log("✅ TODAS AS COLUNAS ESTÃO PRESENTES!");
            console.log("🚀 O banco está correto. Se o erro persiste no app, pode ser cache do Next.js.");
        }

    } catch (e) {
        console.error("❌ Erro ao conectar no Turso:", e);
    }
}

main();
