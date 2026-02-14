// Create PrevisionFinance alerts workflow on n8n
const N8N_URL = 'https://n8n.vinfomkt.fun'
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTRmNTc5Yy0zNTIyLTRkM2MtODNjZi1lN2VjNmIxNzBhNWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYTk1OTM2MjItNGViMC00ZDJjLTk3YjMtMTAzMzEzZmY2ZGU5IiwiaWF0IjoxNzcwOTkzNTEwfQ.D4BvKfQ4l4M4OPfMEv0HscI3MR5pNjcJOQaHmgZHe2s'

const workflow = {
    name: 'PrevisionFinance - Alertas WhatsApp',
    nodes: [
        {
            parameters: {
                rule: {
                    interval: [{
                        field: 'hours',
                        hoursInterval: 24,
                        triggerAtHour: 8
                    }]
                }
            },
            name: 'Diário às 8h',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1.2,
            position: [250, 300]
        },
        {
            parameters: {
                method: 'GET',
                url: 'http://localhost:3000/api/cron/alerts?key=C9E6F66B6175-42C0-8807-4E78925B5199',
                options: { timeout: 30000 }
            },
            name: 'Verificar Vencimentos',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.2,
            position: [470, 300]
        },
        {
            parameters: {
                conditions: {
                    options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
                    conditions: [{
                        id: 'c1',
                        leftValue: '={{ $json.success }}',
                        rightValue: true,
                        operator: { type: 'boolean', operation: 'equals', singleValue: true }
                    }],
                    combinator: 'and'
                },
                options: {}
            },
            name: 'Sucesso?',
            type: 'n8n-nodes-base.if',
            typeVersion: 2.2,
            position: [690, 300]
        },
        {
            parameters: {
                assignments: {
                    assignments: [
                        { id: 's1', name: 'status', value: '✅ Alertas enviados com sucesso', type: 'string' },
                        { id: 's2', name: 'timestamp', value: '={{ $now.toISO() }}', type: 'string' }
                    ]
                },
                options: {}
            },
            name: 'Log Sucesso',
            type: 'n8n-nodes-base.set',
            typeVersion: 3.4,
            position: [910, 200]
        },
        {
            parameters: {
                assignments: {
                    assignments: [
                        { id: 'e1', name: 'status', value: '={{ "❌ Erro: " + $json.error }}', type: 'string' },
                        { id: 'e2', name: 'timestamp', value: '={{ $now.toISO() }}', type: 'string' }
                    ]
                },
                options: {}
            },
            name: 'Log Erro',
            type: 'n8n-nodes-base.set',
            typeVersion: 3.4,
            position: [910, 400]
        }
    ],
    connections: {
        'Diário às 8h': { main: [[{ node: 'Verificar Vencimentos', type: 'main', index: 0 }]] },
        'Verificar Vencimentos': { main: [[{ node: 'Sucesso?', type: 'main', index: 0 }]] },
        'Sucesso?': { main: [[{ node: 'Log Sucesso', type: 'main', index: 0 }], [{ node: 'Log Erro', type: 'main', index: 0 }]] }
    },
    settings: { executionOrder: 'v1' }
}

async function main() {
    console.log('Criando workflow no n8n...')

    const res = await fetch(`${N8N_URL}/api/v1/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': API_KEY },
        body: JSON.stringify(workflow)
    })

    if (!res.ok) {
        console.error(`Erro ${res.status}: ${await res.text()}`)
        process.exit(1)
    }

    const data = await res.json()
    console.log(`✅ Workflow criado! ID: ${data.id}`)
    console.log(`   URL: ${N8N_URL}/workflow/${data.id}`)

    // Activate
    console.log('Ativando workflow...')
    const actRes = await fetch(`${N8N_URL}/api/v1/workflows/${data.id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': API_KEY }
    })

    if (actRes.ok) {
        console.log('✅ Workflow ativado! Alertas serão enviados diariamente às 8h.')
    } else {
        console.log(`⚠️ Ative manualmente em: ${N8N_URL}/workflow/${data.id}`)
    }
}

main()
