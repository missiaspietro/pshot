import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Investigando tabela de promoções...')
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // TESTE 1: Verificar se a tabela existe e contar registros
    console.log('📊 TESTE 1: Contando registros totais...')
    try {
      const { data: countData, error: countError } = await supabase
        .from('Relatorio Envio de Promoções')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        results.tests.push({
          test: 'Contar registros totais',
          status: 'error',
          error: countError.message,
          details: countError
        })
      } else {
        results.tests.push({
          test: 'Contar registros totais',
          status: 'success',
          count: countData?.length || 0,
          message: `Tabela existe e tem registros`
        })
      }
    } catch (error: any) {
      results.tests.push({
        test: 'Contar registros totais',
        status: 'error',
        error: error.message,
        message: 'Erro ao acessar tabela - pode não existir'
      })
    }

    // TESTE 2: Buscar primeiros 3 registros para ver estrutura
    console.log('📋 TESTE 2: Buscando primeiros registros...')
    try {
      const { data: sampleData, error: sampleError } = await supabase
        .from('Relatorio Envio de Promoções')
        .select('*')
        .limit(3)

      if (sampleError) {
        results.tests.push({
          test: 'Buscar registros de exemplo',
          status: 'error',
          error: sampleError.message,
          details: sampleError
        })
      } else {
        results.tests.push({
          test: 'Buscar registros de exemplo',
          status: 'success',
          count: sampleData?.length || 0,
          data: sampleData,
          columns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [],
          message: `Encontrados ${sampleData?.length || 0} registros de exemplo`
        })
      }
    } catch (error: any) {
      results.tests.push({
        test: 'Buscar registros de exemplo',
        status: 'error',
        error: error.message
      })
    }

    // TESTE 3: Verificar valores únicos no campo "Rede"
    console.log('🏢 TESTE 3: Verificando empresas disponíveis...')
    try {
      const { data: redeData, error: redeError } = await supabase
        .from('Relatorio Envio de Promoções')
        .select('Rede')
        .not('Rede', 'is', null)
        .limit(100)

      if (redeError) {
        results.tests.push({
          test: 'Verificar campo Rede',
          status: 'error',
          error: redeError.message,
          details: redeError
        })
      } else {
        // Extrair valores únicos
        const uniqueRedes = [...new Set(redeData?.map(item => item.Rede) || [])]
        
        results.tests.push({
          test: 'Verificar campo Rede',
          status: 'success',
          count: redeData?.length || 0,
          uniqueValues: uniqueRedes,
          totalUnique: uniqueRedes.length,
          message: `Campo Rede existe com ${uniqueRedes.length} valores únicos`
        })
      }
    } catch (error: any) {
      results.tests.push({
        test: 'Verificar campo Rede',
        status: 'error',
        error: error.message
      })
    }

    // TESTE 4: Verificar formato das datas
    console.log('📅 TESTE 4: Verificando formato das datas...')
    try {
      const { data: dateData, error: dateError } = await supabase
        .from('Relatorio Envio de Promoções')
        .select('Data_Envio')
        .not('Data_Envio', 'is', null)
        .limit(5)

      if (dateError) {
        results.tests.push({
          test: 'Verificar campo Data_Envio',
          status: 'error',
          error: dateError.message,
          details: dateError
        })
      } else {
        results.tests.push({
          test: 'Verificar campo Data_Envio',
          status: 'success',
          count: dateData?.length || 0,
          sampleDates: dateData?.map(item => item.Data_Envio) || [],
          message: `Campo Data_Envio existe com ${dateData?.length || 0} exemplos`
        })
      }
    } catch (error: any) {
      results.tests.push({
        test: 'Verificar campo Data_Envio',
        status: 'error',
        error: error.message
      })
    }

    // TESTE 5: Testar query similar à da API
    console.log('🔍 TESTE 5: Testando query similar à API...')
    try {
      const { data: apiTestData, error: apiTestError } = await supabase
        .from('Relatorio Envio de Promoções')
        .select('Cliente, Whatsapp, Loja, Data_Envio, Id')
        .limit(5)

      if (apiTestError) {
        results.tests.push({
          test: 'Testar query da API',
          status: 'error',
          error: apiTestError.message,
          details: apiTestError
        })
      } else {
        results.tests.push({
          test: 'Testar query da API',
          status: 'success',
          count: apiTestData?.length || 0,
          data: apiTestData,
          message: `Query da API funciona e retorna ${apiTestData?.length || 0} registros`
        })
      }
    } catch (error: any) {
      results.tests.push({
        test: 'Testar query da API',
        status: 'error',
        error: error.message
      })
    }

    console.log('✅ DEBUG concluído:', results)

    return NextResponse.json({
      success: true,
      message: 'Debug da tabela de promoções concluído',
      results
    })

  } catch (error) {
    console.error('💥 Erro no debug da tabela:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false
      },
      { status: 500 }
    )
  }
}