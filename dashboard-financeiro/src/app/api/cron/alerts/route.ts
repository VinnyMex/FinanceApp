import { NextResponse } from "next/server"
import { checkDueTransactions } from "@/app/(dashboard)/actions/whatsapp"

// API Route para verificar transações vencidas e enviar alertas WhatsApp
// Chamada por n8n, Vercel Cron ou qualquer scheduler externo
// GET /api/cron/alerts
// Autenticação: somente via header "x-api-key" (nunca query param — evita log de chave em URLs)
export async function GET(request: Request) {
    const cronKey = process.env.CRON_SECRET

    if (!cronKey) {
        console.error("CRON_SECRET não configurado")
        return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 })
    }

    // Aceita apenas autenticação via header — query params ficam em logs de CDN/proxy
    const providedKey = request.headers.get("x-api-key") ?? request.headers.get("authorization")?.replace("Bearer ", "")

    if (!providedKey || providedKey !== cronKey) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    try {
        const result = await checkDueTransactions()
        return NextResponse.json(result)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido"
        console.error("Erro no cron de alertas:", message)
        // Mensagem genérica para o cliente — detalhe fica só no log servidor
        return NextResponse.json({ error: "Erro interno ao processar alertas" }, { status: 500 })
    }
}
