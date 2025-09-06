/**
 * Debug específico para testar o serviço de cashback passo a passo
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugCashbackService() {
  console.log('🔍 DEBUG: Testando serviço de cashback passo a passo')
  console.log('=' .repeat(80))

  try {
    // Simular exatamente os mesmos parâmetros que a API usa
    const empresa = 'temtotal'
    const selectedFields = ['Nome', 'Whatsapp', 'Loja', 'Status', 'Envio_novo']
    const startDate = '2024-01-01'
    const endDate = '2025-12-31'

    console.log('📋 Parâmetros do teste:')
    console.log('   empresa:', empresa)
    console.log('   selectedFields:', selectedFields)
    console.log('   startDate:', startDate)
    console.log('   endDate:', endDate)

    // 1. Validar campos
    const availableFields = ['Nome', 'Whatsapp', 'Loja', 'Rede_de_loja', 'Envio_novo', 'Status', 'id']
    const validFields = selectedFields.filter(field => availableFields.includes(field))
    if (!validFields.includes('id')) {
      validFields.push('id')
    }
    
    console.log('\n1️⃣ Campos validados:', validFields)

    // 2. Construir query exatamente como o serviço faz
    console.log('\n2️⃣ Construindo query...')
    let query = supabase
      .from('EnvioCashTemTotal')
      .select(validFields.join(', '))
      .eq('Rede_de_loja', empresa)

    console.log('   Query base criada com campos:', validFields.join(', '))
    console.log('   Filtro empresa aplicado:', empresa)

    // Aplicar filtros de data
    if (startDate) {
      query = query.gte('Envio_novo', startDate)
      console.log('   Filtro data inicial aplicado:', startDate)
    }
    
    if (endDate) {
      query = query.lte('Envio_novo', endDate)
      console.log('   Filtro data final aplicado:', endDate)
    }

    // Ordenar e limitar
    query = query
      .order('Envio_novo', { ascending: false })
      .order('id', { ascending: false })
      .limit(1000)

    console.log('   Ordenação e limite aplicados')

    // 3. Executar query
    console.log('\n3️⃣ Executando query...')
    const { data, error } = await query

    if (error) {
      console.error('❌ Erro na query:', error)
      return
    }

    console.log('✅ Query executada com sucesso')
    console.log('📊 Registros retornados:', data?.length || 0)

    if (data && data.length > 0) {
      console.log('\n📋 Primeiros 3 registros:')
      data.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. Nome: "${item.Nome}" | Status: "${item.Status}" | Data: "${item.Envio_novo}"`)
      })

      // 4. Validar dados da empresa (como o serviço faz)
      console.log('\n4️⃣ Validando dados da empresa...')
      const dadosValidados = data.filter(item => {
        const itemEmpresa = item.Rede_de_loja
        const isValid = itemEmpresa === empresa
        
        if (!isValid) {
          console.warn('🚨 Removendo dados de empresa não autorizada:', {
            esperada: empresa,
            encontrada: itemEmpresa,
            id: item.id
          })
        }
        
        return isValid
      })

      console.log('✅ Dados validados:', dadosValidados.length, 'registros')

      if (dadosValidados.length > 0) {
        console.log('\n📋 Primeiros 3 registros validados:')
        dadosValidados.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. Nome: "${item.Nome}" | Status: "${item.Status}" | Data: "${item.Envio_novo}"`)
        })
      }

      return dadosValidados
    } else {
      console.log('📭 Nenhum dado retornado pela query')
      
      // Investigar por que não há dados
      console.log('\n🔍 Investigando por que não há dados...')
      
      // Teste sem filtros de data
      const { data: noDateData, error: noDateError } = await supabase
        .from('EnvioCashTemTotal')
        .select('id, Nome, Envio_novo, Status')
        .eq('Rede_de_loja', empresa)
        .limit(5)

      console.log('   Teste sem filtros de data:', noDateData?.length || 0, 'registros')
      
      if (noDateData && noDateData.length > 0) {
        console.log('   Exemplo sem filtro de data:', noDateData[0])
        
        // Verificar se as datas estão no formato correto
        const sampleDate = noDateData[0].Envio_novo
        if (sampleDate) {
          const dateObj = new Date(sampleDate)
          const isInRange = dateObj >= new Date(startDate) && dateObj <= new Date(endDate)
          console.log('   Data do exemplo:', sampleDate)
          console.log('   Data está no range?', isInRange)
          console.log('   Data como objeto:', dateObj.toISOString())
        }
      }

      return []
    }

  } catch (error) {
    console.error('💥 Erro no debug do serviço:', error)
    return []
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  debugCashbackService()
    .then((result) => {
      console.log('\n' + '='.repeat(80))
      console.log('🔍 DEBUG DO SERVIÇO CONCLUÍDO')
      console.log('📊 Resultado final:', result?.length || 0, 'registros')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Erro no debug do serviço:', error)
      process.exit(1)
    })
}

module.exports = { debugCashbackService }