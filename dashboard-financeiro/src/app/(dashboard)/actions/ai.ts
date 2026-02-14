"use server"

import { db } from "@/lib/db"
import { syncUser } from "@/lib/user-sync"
import { revalidatePath } from "next/cache"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = "gemini-2.0-flash"

export async function generateInsights() {
    const user = await syncUser()
    if (!user) throw new Error("Não autorizado")

    if (!GEMINI_API_KEY) {
        await db.insight.deleteMany({ where: { userId: user.id } })
        await db.insight.create({
            data: {
                content: "⚠️ Para receber conselhos personalizados, configure sua chave da API do Gemini nas variáveis de ambiente.",
                type: "WARNING",
                userId: user.id
            }
        })
        revalidatePath("/")
        return
    }

    // Busca dados para o contexto da IA
    const transactions = await db.transaction.findMany({
        where: { userId: user.id },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 30
    })

    const accounts = await db.account.findMany({
        where: { userId: user.id }
    })

    const totalBalance = accounts.reduce((acc: number, curr: any) => acc + curr.balance, 0)

    // Perfil Financeiro
    const financialProfile = {
        salary: (user as any).salary || 0,
        foodVoucher: (user as any).foodVoucher || 0,
        transportVoucher: (user as any).transportVoucher || 0,
        goals: [
            (user as any).goal1,
            (user as any).goal2,
            (user as any).goal3
        ].filter(Boolean)
    }

    const totalIncomeFixed = financialProfile.salary + financialProfile.foodVoucher + financialProfile.transportVoucher

    const context = transactions.map((t: any) => ({
        tipo: t.type,
        valor: t.amount,
        categoria: t.category?.name || "Sem categoria",
        descricao: t.description,
        data: t.date.toISOString().split("T")[0]
    }))

    const prompt = `Você é o PrevisionFinance IA, um consultor financeiro pessoal focado em alcançar objetivos.

PERFIL DO USUÁRIO:
- Renda Mensal Fixa: R$ ${totalIncomeFixed.toFixed(2)} (Salário + Benefícios)
- Saldo Atual em Contas: R$ ${totalBalance.toFixed(2)}
- OBJETIVOS FINANCEIROS (Prioridade Alta):
${financialProfile.goals.map((g: string, i: number) => `  ${i + 1}. ${g}`).join("\n")}

DADOS RECENTES:
- Últimas ${context.length} transações: ${JSON.stringify(context)}

TAREFA:
Analise as finanças considerando os OBJETIVOS acima. Forneça exatamente 3 insights acionáveis para ajudar o usuário a alcançar essas metas.

REGRAS:
1. Se o usuário tem objetivos claros (ex: comprar moto), o Insight #1 DEVE ser um plano específico para isso.
2. Insight #2 deve focar em otimização de gastos ou economia.
3. Insight #3 deve ser uma dica de hábito financeiro ou investimento.
4. Máximo 120 caracteres por insight.
5. Comece cada insight com um emoji.
6. Responda APENAS os 3 insights, um por linha.
7. Responda em Português do Brasil.`

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            })
        })

        const data = await response.json()

        // Log para depuração
        if (!response.ok) {
            console.error("Gemini API Error:", JSON.stringify(data, null, 2))
            throw new Error(`Gemini API retornou ${response.status}: ${data.error?.message || "Erro desconhecido"}`)
        }

        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!rawContent) {
            console.error("Gemini response sem conteúdo:", JSON.stringify(data, null, 2))
            throw new Error("Resposta vazia da API Gemini")
        }

        // Divide os insights por linha e limpa
        const insightLines = rawContent
            .split("\n")
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
            .slice(0, 3)

        // Limpa insights antigos e salva os novos
        await db.insight.deleteMany({ where: { userId: user.id } })

        for (const line of insightLines) {
            await db.insight.create({
                data: {
                    content: line,
                    type: "ADVICE",
                    userId: user.id
                }
            })
        }

        revalidatePath("/")
    } catch (error) {
        console.error("Erro PrevisionFinance IA:", error)

        // Salva um insight de erro para feedback visual
        await db.insight.deleteMany({ where: { userId: user.id } })
        await db.insight.create({
            data: {
                content: `❌ Erro ao gerar insights: ${error instanceof Error ? error.message : "Erro desconhecido"}. Tente novamente.`,
                type: "WARNING",
                userId: user.id
            }
        })
        revalidatePath("/")
    }
}
