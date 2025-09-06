import { NextRequest, NextResponse } from 'next/server'
import { FilterConfigEncryption, EncryptedConfiguration } from '@/lib/filter-config-encryption'
import { AuthService } from '@/lib/auth-service'
import { DatabaseService } from '@/lib/database-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
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
    console.log('DELETE /api/users/report-filters/[configId] - Usuário autenticado:', user)

    const { configId } = params
    if (!configId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'ID da configuração é obrigatório' } },
        { status: 400 }
      )
    }

    // Buscar dados do usuário no banco
    const dbUser = await DatabaseService.getUserById(user.id)
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado' } },
        { status: 404 }
      )
    }

    // Obter salt do usuário
    const userSalt = await DatabaseService.getUserSalt(user.id)

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
        return NextResponse.json(
          { success: false, error: { code: 'DECRYPT_ERROR', message: 'Erro ao acessar configurações' } },
          { status: 500 }
        )
      }
    }

    // Find configuration to delete
    const configIndex = existingData.configurations.findIndex(
      config => config.id === configId
    )

    if (configIndex === -1) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFIG_NOT_FOUND', message: 'Configuração não encontrada' } },
        { status: 404 }
      )
    }

    // Remove configuration
    const deletedConfig = existingData.configurations[configIndex]
    existingData.configurations.splice(configIndex, 1)

    // Encrypt and save updated data
    const encryptedData = FilterConfigEncryption.encrypt(existingData, userSalt)
    const success = await DatabaseService.updateUserFilterConfig(user.id, encryptedData)

    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'SAVE_FAILED', message: 'Erro ao salvar no banco de dados' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Configuração "${deletedConfig.name}" excluída com sucesso`
    })

  } catch (error) {
    console.error('Erro ao excluir configuração:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}