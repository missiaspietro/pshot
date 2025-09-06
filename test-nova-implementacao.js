// Teste da nova implementação do filtro de empresa
// Execute com: node test-nova-implementacao.js

const API_BASE = 'http://localhost:3000/api'

async function testNovaImplementacao() {
  console.log('🆕 Testando NOVA IMPLEMENTAÇÃO do Filtro de Empresa\n')

  try {
    console.log('1️⃣ Fazendo requisição para a API...')
    
    const response = await fetch(`${API_BASE}/reports/birthday`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      return
    }

    const result = await response.json()
    
    console.log('✅ Resposta recebida com sucesso!')
    console.log('\n📊 ANÁLISE DOS RESULTADOS:')
    console.log(`   Total de registros: ${result.total}`)
    console.log(`   Rede do usuário: ${result.userNetwork}`)
    console.log(`   Redes disponíveis: ${result.availableNetworks?.join(', ') || 'N/A'}`)

    if (result.data && result.data.length > 0) {
      // Analisar as redes nos dados retornados
      const redesNosResultados = [...new Set(result.data.map(item => item.rede).filter(Boolean))]
      
      console.log('\n🔍 VERIFICAÇÃO DE SEGURANÇA:')
      console.log(`   Redes encontradas nos resultados: ${redesNosResultados.join(', ')}`)
      console.log(`   Quantidade de redes diferentes: ${redesNosResultados.length}`)
      
      if (redesNosResultados.length === 1) {
        if (redesNosResultados[0] === result.userNetwork) {
          console.log('✅ PERFEITO: Apenas dados da rede correta!')
        } else {
          console.log('⚠️  ATENÇÃO: Dados de rede diferente da esperada')
          console.log(`     Esperado: ${result.userNetwork}`)
          console.log(`     Encontrado: ${redesNosResultados[0]}`)
        }
      } else if (redesNosResultados.length > 1) {
        console.log('🚨 PROBLEMA: Múltiplas redes encontradas!')
        console.log('   Isso indica que o filtro não está funcionando')
      } else {
        console.log('⚠️  Nenhuma rede encontrada nos dados')
      }

      // Mostrar amostra dos dados
      console.log('\n📋 AMOSTRA DOS DADOS (primeiros 5):')
      result.data.slice(0, 5).forEach((item, index) => {
        console.log(`   ${index + 1}. Rede: ${item.rede || 'N/A'}, Cliente: ${item.cliente || 'N/A'}, Data: ${item.criado_em || 'N/A'}`)
      })

      // Contar registros por rede
      const contadorRedes = result.data.reduce((acc, item) => {
        const rede = item.rede || 'SEM_REDE'
        acc[rede] = (acc[rede] || 0) + 1
        return acc
      }, {})

      console.log('\n📈 DISTRIBUIÇÃO POR REDE:')
      Object.entries(contadorRedes).forEach(([rede, count]) => {
        console.log(`   ${rede}: ${count} registros`)
      })

    } else {
      console.log('\n📭 Nenhum dado retornado')
    }

    // Verificar se há logs de debug no console
    console.log('\n💡 DICA: Verifique o console do servidor para logs detalhados da nova implementação')
    console.log('   Procure por logs que começam com "🔄 NOVA IMPLEMENTAÇÃO"')

  } catch (error) {
    console.error('💥 Erro durante o teste:', error.message)
  }
}

// Executar teste
testNovaImplementacao()