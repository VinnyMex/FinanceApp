import { NextResponse } from "next/server"
import { checkDueTransactions } from "@/app/(dashboard)/actions/whatsapp"

// API Route to check due transactions and send WhatsApp alerts
// Can be called by n8n, cron job, or any external scheduler
// GET /api/cron/alerts
export async function GET(request: Request) {
    // Simple auth via query param or header
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key") || request.headers.get("x-api-key")

    if (key !== process.env.EVOLUTION_API_KEY) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    try {
        const result = await checkDueTransactions()
        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Erro no cron de alertas:", error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
