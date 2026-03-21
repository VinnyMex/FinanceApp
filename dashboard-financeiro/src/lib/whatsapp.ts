// Evolution API WhatsApp Integration
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE

// Valida e normaliza número de telefone brasileiro (com ou sem DDI 55)
// Aceita: +5511999999999, 5511999999999, 11999999999, (11) 9 9999-9999
function normalizePhoneNumber(phone: string): string | null {
    const digits = phone.replace(/\D/g, "")

    // Aceita 10-13 dígitos
    if (digits.length < 10 || digits.length > 13) return null

    // Se não tem DDI, adiciona 55 (Brasil)
    const withCountry = digits.startsWith("55") ? digits : `55${digits}`

    // Mínimo: 55 + DDD (2) + número (8) = 12 | Máximo: 55 + DDD (2) + 9 + número (8) = 13
    if (withCountry.length < 12 || withCountry.length > 13) return null

    return withCountry
}

export async function sendWhatsAppMessage(phone: string, message: string) {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
        console.warn("EvolutionAPI não configurada. Verifique as variáveis de ambiente.")
        return { success: false, error: "EvolutionAPI não configurada" }
    }

    const cleanPhone = normalizePhoneNumber(phone)
    if (!cleanPhone) {
        console.warn(`Número de WhatsApp inválido: ${phone.substring(0, 4)}****`)
        return { success: false, error: "Número de telefone inválido" }
    }

    try {
        const evolutionApiUrl = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`

        // Check if using N8N Proxy (workaround for Windows networking issues)
        const proxyUrl = process.env.WHATSAPP_PROXY_URL
        const finalUrl = proxyUrl ? proxyUrl : evolutionApiUrl

        // If using proxy, we might need different payload structure or headers
        // But the N8N workflow is designed to accept { number, text } and forward it
        // The only difference is that for Proxy we don't need to append instance to URL if it's a fixed webhook

        console.log(`Enviando mensagem para ${cleanPhone} via ${proxyUrl ? 'Proxy N8N' : 'EvolutionAPI'}...`)

        const response = await fetch(finalUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Only include apikey if not using proxy, or if the proxy also expects it
                ...(proxyUrl ? {} : { apikey: EVOLUTION_API_KEY as string }),
            },
            body: JSON.stringify({
                number: cleanPhone,
                text: message,
                // These fields are specific to EvolutionAPI, might not be needed for proxy
                ...(proxyUrl ? {} : { delay: 1200, linkPreview: true })
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error("Erro ao enviar WhatsApp:", response.status, errorData)
            return { success: false, error: `Erro ${response.status}: ${errorData}` }
        }

        const data = await response.json()
        return { success: true, data }
    } catch (error: any) {
        console.error("Falha ao enviar WhatsApp:", error.message)

        let errorMessage = error.message
        if (error.message.includes("fetch failed") || error.code === "ECONNREFUSED") {
            errorMessage = `Não foi possível conectar ao EvolutionAPI em ${EVOLUTION_API_URL}. Verifique se o serviço está rodando e acessível.`
        }

        return { success: false, error: errorMessage }
    }
}

export function formatTransactionAlert(type: string, description: string, amount: number, date: string) {
    const emoji = type === "INCOME" ? "💰" : "💸"
    const typeLabel = type === "INCOME" ? "Receita" : "Despesa"
    const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)

    return `${emoji} *Nova ${typeLabel} Registrada*

📝 *Descrição:* ${description}
💵 *Valor:* ${formattedAmount}
📅 *Data:* ${date}

_Enviado pelo PrevisionFinance_`
}

export function formatDueAlert(description: string, amount: number, daysUntilDue: number, dueDate: string) {
    const urgency = daysUntilDue <= 1 ? "🔴" : daysUntilDue <= 3 ? "🟡" : "🟢"

    return `${urgency} *Alerta de Vencimento*

📝 *Descrição:* ${description}
💵 *Valor:* ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)}
📅 *Vencimento:* ${dueDate}
⏰ *Faltam:* ${daysUntilDue} dia${daysUntilDue !== 1 ? "s" : ""}

_Enviado pelo PrevisionFinance_`
}

export function formatDailyReport(totalIncome: number, totalExpense: number, balance: number, transactionCount: number) {
    const formattedIncome = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalIncome)
    const formattedExpense = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalExpense)
    const formattedBalance = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(balance)

    return `📊 *Relatório Diário - PrevisionFinance*

💰 Receitas: ${formattedIncome}
💸 Despesas: ${formattedExpense}
📈 Saldo: ${formattedBalance}
📋 Total de transações: ${transactionCount}

_Enviado pelo PrevisionFinance_`
}
