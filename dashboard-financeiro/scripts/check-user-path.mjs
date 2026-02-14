// Check User Path Suggestions
const CANDIDATES = [
    'https://n8n.vinfomkt.fun/8081',
    'https://n8n.vinfomkt.fun/8080',
    'https://n8n.vinfomkt.fun:8080',
    'http://n8n.vinfomkt.fun:8080',
    'https://n8n.vinfomkt.fun'
];

const API_KEY = 'C9E6F66B6175-42C0-8807-4E78925B5199';

async function testConnection() {
    console.log("🔍 Testando caminhos sugeridos pelo usuário...\n");

    for (const url of CANDIDATES) {
        console.log(`Testing ${url}...`);
        try {
            // Tenta pegar instâncias
            const response = await fetch(`${url}/instance/fetchInstances`, {
                method: 'GET',
                headers: { 'apikey': API_KEY }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ SUCESSO! A API respondeu em: ${url}`);
                console.log("📦 Instâncias:", JSON.stringify(data, null, 2));
                return;
            } else {
                const text = await response.text();
                console.log(`❌ Falha em ${url}: Status ${response.status} - ${text.substring(0, 50)}...`);
            }
        } catch (error) {
            console.log(`❌ Erro em ${url}: ${error.code || error.message}`);
        }
        console.log("---");
    }
    console.log("Nenhuma URL funcionou.");
}

testConnection();
