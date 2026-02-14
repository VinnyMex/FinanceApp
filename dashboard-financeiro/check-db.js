
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Testando conexão com o banco...')

    try {
        // Tenta buscar um usuário qualquer
        const user = await prisma.user.findFirst()

        if (user) {
            console.log('Usuário encontrado:', user.email)
            console.log('Colunas disponíveis no objeto user:')
            console.log(Object.keys(user))

            const missingColumns = []
            if (!('salary' in user)) missingColumns.push('salary')
            if (!('foodVoucher' in user)) missingColumns.push('foodVoucher')

            if (missingColumns.length > 0) {
                console.error('❌ ERRO CRÍTICO: As seguintes colunas NÃO existem no retorno do Prisma:', missingColumns)
                console.error('Isso significa que elas não existem no banco OU o Prisma Client está desatualizado.')
            } else {
                console.log('✅ SUCESSO: Todas as colunas novas (salary, foodVoucher) foram encontradas!')
            }

        } else {
            console.log('Nenhum usuário encontrado, mas a conexão funcionou.')
        }

    } catch (e) {
        console.error('❌ Erro ao conectar/consultar:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
