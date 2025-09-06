// Script de teste para verificar se as correções estão funcionando
// Execute com: node test-birthday-api.js

const API_BASE = 'http://localhost:3000/api'

async function testBirthdayReport() {
  console.log('🧪 Testando API de Relatórios de Aniversários...\n')

  try {
    // Teste 1: Buscar relatório de aniversários
    console.log('1️⃣ Testando busca de relatório de aniversários...')
    
    const reportResponse = await fetch(`${API_BASE}/reports/birthday`, {
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

    const reportData = await reportResponse.json()
    
    if (reportResponse.ok) {
      console.log('✅ Relatório de aniversários funcionando!')
      console.log(`📊 Total de registros: ${reportData.total}`)
      console.log(`🏢 Rede do usuário: ${reportData.userNetwork}`)
      console.log(`📅 Primeiro registro: ${reportData.data[0]?.criado_em || 'N/A'}`)
      console.log(`📅 Último registro: ${reportData.data[reportData.data.length - 1]?.criado_em || 'N/A'}`)
    } else {
      console.log('❌ Erro no relatório de aniversários:', reportData.error)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Teste 2: Salvar configuração de filtros
    console.log('2️⃣ Testando salvamento de configuração...')
    
    const saveResponse = await fetch(`${API_BASE}/users/report-filters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Teste Configuração',
        selectedFields: ['criado_em', 'cliente', 'whatsApp']
      })
    })

    const saveData = await saveResponse.json()
    
    if (saveResponse.ok) {
      console.log('✅ Salvamento de configuração funcionando!')
      console.log(`📝 Configuração criada: ${saveData.data.name}`)
      console.log(`🆔 ID: ${saveData.data.id}`)
    } else {
      console.log('❌ Erro ao salvar configuração:', saveData.error)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Teste 3: Carregar configurações
    console.log('3️⃣ Testando carregamento de configurações...')
    
    const loadResponse = await fetch(`${API_BASE}/users/report-filters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const loadData = await loadResponse.json()
    
    if (loadResponse.ok) {
      console.log('✅ Carregamento de configurações funcionando!')
      console.log(`📋 Total de configurações: ${loadData.data.length}`)
      loadData.data.forEach((config, index) => {
        console.log(`   ${index + 1}. ${config.name} (${config.selectedFields.length} campos)`)
      })
    } else {
      console.log('❌ Erro ao carregar configurações:', loadData.error)
    }

  } catch (error) {
    console.error('💥 Erro durante os testes:', error.message)
  }
}

// Executar testes
testBirthdayReport()