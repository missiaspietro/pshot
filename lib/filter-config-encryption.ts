import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto'

export interface FilterConfiguration {
  id: string
  name: string
  selectedFields: string[]
  responseFilter?: string // Filtro de resposta opcional
  type: 'birthday' | 'cashback' | 'survey' | 'promotions' // Tipo da configuração
  createdAt: string
  updatedAt: string
}

export interface EncryptedConfiguration {
  configurations: FilterConfiguration[]
}

export class FilterConfigEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 12
  private static readonly TAG_LENGTH = 16
  private static readonly SALT_LENGTH = 32

  /**
   * Gera um salt aleatório para o usuário
   */
  static generateSalt(): string {
    return randomBytes(this.SALT_LENGTH).toString('hex')
  }

  /**
   * Deriva uma chave a partir da senha do usuário e salt
   */
  private static deriveKey(userSalt: string): Buffer {
    // Usar um identificador único do sistema como "senha base"
    const baseKey = process.env.ENCRYPTION_SECRET || 'default-secret-key'
    return pbkdf2Sync(baseKey, userSalt, 100000, this.KEY_LENGTH, 'sha256')
  }

  /**
   * Criptografa os dados de configuração
   */
  static encrypt(data: EncryptedConfiguration, userSalt: string): string {
    try {
      const key = this.deriveKey(userSalt)
      const iv = randomBytes(this.IV_LENGTH)
      const cipher = createCipheriv(this.ALGORITHM, key, iv)

      const jsonData = JSON.stringify(data)
      let encrypted = cipher.update(jsonData, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const tag = cipher.getAuthTag()
      
      // Combinar IV + tag + dados criptografados
      const combined = iv.toString('hex') + tag.toString('hex') + encrypted
      return Buffer.from(combined, 'hex').toString('base64')
    } catch (error) {
      console.error('Erro na criptografia:', error)
      throw new Error('Falha ao criptografar configurações')
    }
  }

  /**
   * Descriptografa os dados de configuração
   */
  static decrypt(encryptedData: string, userSalt: string): EncryptedConfiguration {
    try {
      const key = this.deriveKey(userSalt)
      const combined = Buffer.from(encryptedData, 'base64').toString('hex')
      
      // Extrair IV, tag e dados criptografados
      const iv = Buffer.from(combined.slice(0, this.IV_LENGTH * 2), 'hex')
      const tag = Buffer.from(combined.slice(this.IV_LENGTH * 2, (this.IV_LENGTH + this.TAG_LENGTH) * 2), 'hex')
      const encrypted = combined.slice((this.IV_LENGTH + this.TAG_LENGTH) * 2)
      
      const decipher = createDecipheriv(this.ALGORITHM, key, iv)
      decipher.setAuthTag(tag)
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      const parsedData = JSON.parse(decrypted)
      
      // Validar estrutura dos dados
      if (!parsedData.configurations || !Array.isArray(parsedData.configurations)) {
        throw new Error('Estrutura de dados inválida')
      }
      
      return parsedData as EncryptedConfiguration
    } catch (error) {
      console.error('Erro na descriptografia:', error)
      // Retornar estrutura vazia em caso de erro
      return { configurations: [] }
    }
  }

  /**
   * Valida uma configuração individual
   */
  static validateConfiguration(config: Partial<FilterConfiguration>): config is FilterConfiguration {
    return !!(
      config.id &&
      config.name &&
      config.selectedFields &&
      Array.isArray(config.selectedFields) &&
      config.type &&
      ['birthday', 'cashback', 'survey', 'promotions'].includes(config.type) &&
      config.createdAt &&
      config.updatedAt
    )
  }

  /**
   * Sanitiza o nome da configuração
   */
  static sanitizeConfigName(name: string): string {
    return name.trim().slice(0, 50).replace(/[<>\"'&]/g, '')
  }
}