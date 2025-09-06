import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export const surveySchema = z.object({
  pergunta: z.string().min(1, "Pergunta é obrigatória"),
  opcoes: z.array(z.string().min(1, "Opção não pode ser vazia")).min(2, "Pelo menos 2 opções são necessárias").max(4, "Máximo 4 opções"),
  passo: z.number().int().min(1, "O passo deve ser maior que zero").default(1),
  status: z.string().default("ativo"),
  loja: z.string().min(1, "Selecione uma loja"),
  bot: z.string().min(1, "Selecione um bot"),
  sala: z.string().min(1, "Selecione uma sala"),
})

export const promotionSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
  store_id: z.number().min(1, "Você precisa selecionar uma loja para continuar"),
})

export const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
  access_level: z.enum(["admin", "gerente", "vendedor"]),
  rede: z.string().min(1, "Selecione uma loja"),
  permissions: z.object({
    dashboard: z.boolean().optional(),
    visitantes: z.boolean().optional(),
    historico: z.boolean().optional(),
    mensagens: z.boolean().optional(),
    eventos: z.boolean().optional(),
    treinamento: z.boolean().optional(),
    conexao: z.boolean().optional(),
    usuarios: z.boolean().optional(),
    promocoes: z.boolean().optional(),
    relatorios: z.boolean().optional(),
    aniversarios: z.boolean().optional(),
    pesquisas: z.boolean().optional(),
    bots: z.boolean().optional()
  }).optional()
})

export const birthdayFilterSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
})
