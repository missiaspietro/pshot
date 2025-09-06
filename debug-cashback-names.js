// Script para investigar o problema dos nomes "Invalid Date" no cashback

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function investigateCashbackNames() {
  console.log('🔍 INVESTIGAÇÃO: Problema dos nomes "Invalid Date" no cashback')
  console.log('=' .repeat(60))

  try {
    // 1. Buscar uma amostra de dados da tabela
    console.log('📊 1. Buscando amostra de dados da tabela EnvioCashTemTotal...')
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('EnvioCashTemTotal')
      .select('*')
      .limit(10)

    if (sampleError) {
      console.error('❌ Erro ao buscar amostra:', sampleError)
      return
    }

    console.log('📈 Total de registros na amostra:', sampleData?.length || 0)

    if (sampleData && sampleData.length > 0) {
      console.log('\n📋 2. Analisando estrutura dos dados:')
      console.log('Campos disponíveis:', Object.keys(sampleData[0]))
      
      console.log('\n🔍 3. Analisando primeiros 5 registros:')
      sampleData.slice(0, 5).forEach((item, index) => {
        console.log(`\n   Registro ${index + 1}:`)
        console.log(`   - ID: ${item.id}`)
        console.log(`   - Nome: "${item.Nome}" (tipo: ${typeof item.Nome})`)
        console.log(`   - Whatsapp: "${item.Whatsapp}" (tipo: ${typeof item.Whatsapp})`)
        console.log(`   - Loja: "${item.Loja}" (tipo: ${typeof item.Loja})`)
        console.log(`   - Rede_de_loja: "${item.Rede_de_loja}" (tipo: ${typeof item.Rede_de_loja})`)
        console.log(`   - Envio_novo: "${item.Envio_novo}" (tipo: ${typeof item.Envio_novo})`)
        console.log(`   - Status: "${item.Status}" (tipo: ${typeof item.Status})`)
        
        // Verificar se algum campo tem valor que pode ser interpretado como data
        Object.keys(item).forEach(key => {
          const value = item[key]
          if (typeof value === 'string' && value.includes('T')) {
            console.log(`   ⚠️ Campo ${key} parece ser uma data: "${value}"`)
          }
        })
      })

      // 4. Verificar se há registros com nomes vazios ou nulos
      console.log('\n🔍 4. Verificando registros com problemas no nome:')
      
      const { data: problemData, error: problemError } = await supabase
        .from('EnvioCashTemTotal')
        .select('id, Nome, Whatsapp, Rede_de_loja')
        .or('Nome.is.null,Nome.eq.')
        .limit(10)

      if (problemError) {
        console.error('❌ Erro ao buscar registros com problemas:', problemError)
      } else {
        console.log('📊 Registros com nome vazio/nulo:', problemData?.length || 0)
        if (problemData && problemData.length > 0) {
          problemData.forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id}, Nome: "${item.Nome}", Whatsapp: "${item.Whatsapp}"`)
          })
        }
      }

      // 5. Verificar se há registros com nomes válidos
      console.log('\n🔍 5. Verificando registros com nomes válidos:')
      
      const { data: validData, error: validError } = await supabase
        .from('EnvioCashTemTotal')
        .select('id, Nome, Whatsapp, Rede_de_loja')
        .not('Nome', 'is', null)
        .neq('Nome', '')
        .limit(10)

      if (validError) {
        console.error('❌ Erro ao buscar registros válidos:', validError)
      } else {
        console.log('📊 Registros com nome válido:', validData?.length || 0)
        if (validData && validData.length > 0) {
          validData.slice(0, 3).forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.id}, Nome: "${item.Nome}", Whatsapp: "${item.Whatsapp}"`)
          })
        }
      }

      // 6. Testar formatação de dados como no modal
      console.log('\n🔍 6. Testando formatação de dados:')
      
      const testItem = sampleData[0]
      console.log('Item de teste:', testItem)
      
      Object.keys(testItem).forEach(key => {
        const value = testItem[key]
        let formattedValue = value
        
        // Aplicar mesma lógica do modal
        if (value === null || value === undefined || value === '') {
          formattedValue = '-'
        } else if (typeof value === 'string' && value.includes('T')) {
          try {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              formattedValue = date.toLocaleDateString('pt-BR')
            }
          } catch (error) {
            console.warn('⚠️ Erro ao formatar data:', value, error)
          }
        }
        
        if (formattedValue !== value) {
          console.log(`   ${key}: "${value}" → "${formattedValue}"`)
        }
      })

    } else {
      console.log('❌ Nenhum dado encontrado na tabela')
    }

  } catch (error) {
    console.error('💥 Erro na investigação:', error)
  }
}

// Executar investigação
investigateCashbackNames().then(() => {
  console.log('\n✅ Investigação concluída')
  process.exit(0)
}).catch(error => {
  console.error('💥 Erro fatal:', error)
  process.exit(1)
})