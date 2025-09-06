import { NextRequest, NextResponse } from 'next/server'
import { FilterConfigEncryption, EncryptedConfiguration, FilterConfiguration } from '@/lib/filter-config-encryption'
import { AuthService } from '@/lib/auth-service'
import { DatabaseService } from '@/lib/database-service'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Obter usuário real da sessão
    const cookies = request.headers.get('cookie') || ''
    const sessionMatch = cookies.match(/ps_session=([^;]+)/)
    
    if (!sessionMatch) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    const email = sessionMatch[1].split('_')[0]
    
    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, nome')
      .eq('email', email)
      .eq('sistema', 'Praise Shot')
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado' } },
        { status: 401 }
      )
    }

    const user = { id: userData.id, email: userData.email }
    console.log('GET /api/users/report-filters - Usuário autenticado:', user)

    // Verificar se a tabela users existe e está acessível
    const tableExists = await DatabaseService.checkUserTableStructure()
    if (!tableExists) {
      console.error('GET /api/users/report-filters - Tabela users não está acessível')
      return NextResponse.json(
        { success: false, error: { code: 'TABLE_ERROR', message: 'Erro de acesso ao banco de dados' } },
        { status: 500 }
      )
    }

    // Buscar dados do usuário no banco
    let dbUser = await DatabaseService.getUserById(user.id)
    if (!dbUser) {
      // Criar usuário de teste se não existir
      console.log('Usuário não encontrado, criando usuário de teste...')
      const created = await DatabaseService.createTestUser(user.id, user.email)
      if (created) {
        dbUser = await DatabaseService.getUserById(user.id)
      }
      
      if (!dbUser) {
        return NextResponse.json(
          { success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado' } },
          { status: 404 }
        )
      }
    }

    let configurations: FilterConfiguration[] = []

    if (dbUser.config_filtros_relatorios) {
      try {
        const userSalt = await DatabaseService.getUserSalt(user.id)
        const decryptedData = FilterConfigEncryption.decrypt(
          dbUser.config_filtros_relatorios,
          userSalt
        )
        configurations = decryptedData.configurations || []
      } catch (error) {
        console.error('Erro ao descriptografar configurações:', error)
        // Return empty array if decryption fails
        configurations = []
      }
    }

    return NextResponse.json({
      success: true,
      data: configurations
    })

  } catch (error) {
    console.error('Erro ao carregar configurações:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter usuário real da sessão
    const cookies = request.headers.get('cookie') || ''
    const sessionMatch = cookies.match(/ps_session=([^;]+)/)
    
    if (!sessionMatch) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' } },
        { status: 401 }
      )
    }

    const email = sessionMatch[1].split('_')[0]
    
    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, nome')
      .eq('email', email)
      .eq('sistema', 'Praise Shot')
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado' } },
        { status: 401 }
      )
    }

    const user = { id: userData.id, email: userData.email }
    console.log('POST /api/users/report-filters - Usuário autenticado:', user)

    // Verificar se a tabela users existe e está acessível
    const tableExists = await DatabaseService.checkUserTableStructure()
    if (!tableExists) {
      console.error('POST /api/users/report-filters - Tabela users não está acessível')
      return NextResponse.json(
        { success: false, error: { code: 'TABLE_ERROR', message: 'Erro de acesso ao banco de dados' } },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, selectedFields, responseFilter, type } = body
    
    console.log('POST /api/users/report-filters - Dados recebidos:', { name, selectedFields, responseFilter, type })

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_NAME', message: 'Nome é obrigatório' } },
        { status: 400 }
      )
    }

    if (!selectedFields || !Array.isArray(selectedFields) || selectedFields.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FIELDS', message: 'Campos selecionados são obrigatórios' } },
        { status: 400 }
      )
    }

    const sanitizedName = FilterConfigEncryption.sanitizeConfigName(name)
    if (sanitizedName.length < 3) {
      return NextResponse.json(
        { success: false, error: { code: 'NAME_TOO_SHORT', message: 'Nome deve ter pelo menos 3 caracteres' } },
        { status: 400 }
      )
    }

    // Buscar dados do usuário no banco
    let dbUser = await DatabaseService.getUserById(user.id)
    if (!dbUser) {
      // Criar usuário de teste se não existir
      console.log('Usuário não encontrado, criando usuário de teste...')
      const created = await DatabaseService.createTestUser(user.id, user.email)
      if (created) {
        dbUser = await DatabaseService.getUserById(user.id)
      }
      
      if (!dbUser) {
        return NextResponse.json(
          { success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado' } },
          { status: 404 }
        )
      }
    }

    // Obter salt do usuário
    const userSalt = await DatabaseService.getUserSalt(user.id)
    console.log('POST /api/users/report-filters - Salt obtido:', userSalt.substring(0, 20) + '...')

    // Load existing configurations
    let existingData: EncryptedConfiguration = { configurations: [] }
    if (dbUser.config_filtros_relatorios) {
      try {
        existingData = FilterConfigEncryption.decrypt(
          dbUser.config_filtros_relatorios,
          userSalt
        )
      } catch (error) {
        console.error('Erro ao descriptografar configurações existentes:', error)
        // Start fresh if decryption fails
        existingData = { configurations: [] }
      }
    }

    // Check for duplicate names
    const isDuplicate = existingData.configurations.some(
      config => config.name.toLowerCase() === sanitizedName.toLowerCase()
    )
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_NAME', message: 'Já existe uma configuração com este nome' } },
        { status: 400 }
      )
    }

    // Check maximum limit
    if (existingData.configurations.length >= 10) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_EXCEEDED', message: 'Limite máximo de configurações atingido (10)' } },
        { status: 400 }
      )
    }

    // Create new configuration
    const newConfig: FilterConfiguration = {
      id: uuidv4(),
      name: sanitizedName,
      selectedFields: selectedFields,
      responseFilter: responseFilter,
      type: type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to existing configurations
    existingData.configurations.push(newConfig)

    // Encrypt and save
    console.log('POST /api/users/report-filters - Criptografando dados...')
    let encryptedData: string
    try {
      encryptedData = FilterConfigEncryption.encrypt(existingData, userSalt)
      console.log('POST /api/users/report-filters - Dados criptografados com sucesso')
    } catch (encryptError) {
      console.error('POST /api/users/report-filters - Erro na criptografia:', encryptError)
      return NextResponse.json(
        { success: false, error: { code: 'ENCRYPT_FAILED', message: 'Erro ao criptografar dados' } },
        { status: 500 }
      )
    }

    console.log('POST /api/users/report-filters - Salvando no banco de dados...')
    const success = await DatabaseService.updateUserFilterConfig(user.id, encryptedData)

    if (!success) {
      console.error('POST /api/users/report-filters - Falha ao salvar no banco')
      return NextResponse.json(
        { success: false, error: { code: 'SAVE_FAILED', message: 'Erro ao salvar no banco de dados' } },
        { status: 500 }
      )
    }

    console.log('POST /api/users/report-filters - Configuração salva com sucesso')

    return NextResponse.json({
      success: true,
      data: newConfig
    })

  } catch (error) {
    console.error('Erro ao salvar configuração:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}