// Teste específico para verificar autenticação e integridade dos nomes
// Execute com: node test-autenticacao-nomes.js

const API_BASE = 'http://localhost:3000/api'

async function testAutenticacaoENomes() {
  console.log('🔐 Testando Autenticação Real e Integridade dos Nomes\n')

  try {
    console.log('1️⃣ Testando API de relatórios com autenticação...')
    
    const response = await fetch(`${API_BASE}/reports/birthday`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Simular cookie de sessão - você precisará ajustar com um cookie real
        'Cookie': 'ps_session=seu_email@empresa.com_1234567890'
      },
      body: JSON.stringify({
        selectedFields: ['criado_em', 'cliente', 'whatsApp', 'rede', 'loja'],
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
    })

    if (!response.ok) {
      console.error('❌ Erro HTTP:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('   Resposta:', errorText)
      
      if (response.status === 401) {
        console.log('\n💡 DICA: Você precisa estar logado no sistema!')
        console.log('   1. Acesse http://localhost:3000 no navegador')
        console.log('   2. Faça login com suas credenciais')
        console.log('   3. Abra o console do navegador (F12)')
        console.log('   4. Execute: document.cookie')
        console.log('   5. Copie o valor do cookie ps_session e use no teste')
      }
      return
    }

    const result = await response.json()
    
    console.log('✅ Resposta recebida com sucesso!')
    console.log('\n📊 INFORMAÇÕES DE AUTENTICAÇÃO:')
    console.log(`   Empresa do usuário: ${result.userNetwork}`)
    console.log(`   Total de registros: ${result.total}`)
    
    if (result.userInfo) {
      console.log(`   ID do usuário: ${result.userInfo.id}`)
      console.log(`   Email: ${result.userInfo.email}`)
      console.log(`   Nome: ${result.userInfo.nome}`)
      console.log(`   Empresa: ${result.userInfo.empresa}`)
      console.log(`   Rede: ${result.userInfo.rede}`)
    }

    if (result.data && result.data.length > 0) {
      console.log('\n🔍 VERIFICAÇÃO DOS NOMES DOS CLIENTES:')
      result.data.slice(0, 5).forEach((item, index) => {
        const cliente = item.cliente
        console.log(`   ${index + 1}. Cliente: "${cliente}"`)
        console.log(`      Tamanho: ${cliente?.length || 0} caracteres`)
        console.log(`      Rede: ${item.rede}`)
        
        // Verificar se há caracteres estranhos
        if (cliente) {
          const hasSpecialChars = /[^\w\sÀ-ÿ\-\.]/.test(cliente)
          const hasConsecutiveSpaces = /\s{2,}/.test(cliente)
          const startsOrEndsWithSpace = cliente.startsWith(' ') || cliente.endsWith(' ')
          
          if (hasSpecialChars) {
            console.log(`      ⚠️  Contém caracteres especiais`)
          }
          if (hasConsecutiveSpaces) {
            console.log(`      ⚠️  Contém espaços consecutivos`)
          }
          if (startsOrEndsWithSpace) {
            console.log(`      ⚠️  Inicia ou termina com espaço`)
          }
          if (!hasSpecialChars && !hasConsecutiveSpaces && !startsOrEndsWithSpace) {
            console.log(`      ✅ Nome parece estar íntegro`)
          }
        }
      })

      // Verificar se todos os registros são da mesma empresa
      const empresas = [...new Set(result.data.map(item => item.rede).filter(Boolean))]
      console.log('\n🏢 VERIFICAÇÃO DE FILTRO POR EMPRESA:')
      console.log(`   Empresas encontradas: ${empresas.join(', ')}`)
      
      if (empresas.length === 1) {
        if (empresas[0] === result.userNetwork) {
          console.log('   ✅ PERFEITO: Todos os registros são da empresa correta!')
        } else {
          console.log('   ⚠️  ATENÇÃO: Empresa dos dados diferente da empresa do usuário')
        }
      } else if (empresas.length > 1) {
        console.log('   🚨 PROBLEMA: Múltiplas empresas encontradas!')
      }
    } else {
      console.log('\n📭 Nenhum dado retornado')
    }

    console.log('\n💡 DICA: Verifique o console do servidor para logs detalhados')
    console.log('   Procure por logs que começam com:')
    console.log('   - "🎯 Gerando relatório. Empresa do user:"')
    console.log('   - "🔍 Verificando integridade dos nomes dos clientes:"')

  } catch (error) {
    console.error('💥 Erro durante o teste:', error.message)
  }
}

// Executar teste
testAutenticacaoENomes()