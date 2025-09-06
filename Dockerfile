# Use a imagem oficial do Node.js como base
FROM node:18-alpine AS base

# Instalar dependências apenas quando necessário
FROM base AS deps
# Verificar https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine para entender por que libc6-compat pode ser necessário.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependências baseadas no gerenciador de pacotes preferido
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild o código fonte apenas quando necessário
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js coleta dados de telemetria completamente anônimos sobre uso geral.
# Saiba mais aqui: https://nextjs.org/telemetry
# Descomente a linha seguinte caso queira desabilitar a telemetria durante o build.
ENV NEXT_TELEMETRY_DISABLED=1

# Definir variáveis de ambiente necessárias para o build
ENV NEXT_PUBLIC_SUPABASE_URL=https://studio.praisesistemas.uk
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzAzMzg2ODAwLAogICJleHAiOiAxODYxMjM5NjAwCn0.kU_d1xlxfuEgkYMC0mYoiZHQpUvRE2EnilTZ7S0bfIM
ENV SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MDMzODY4MDAsCiAgImV4cCI6IDE4NjEyMzk2MDAKfQ.mj3UcBqInQLBf0hTWf5HILeZa8yKfT5Oic6oFbO11LM
ENV NEXTAUTH_URL=https://pshot.praisechat.com.br
ENV NEXTAUTH_SECRET=fcvxe9oxp6ppcpn3c4dyi8inf0bjs91xmfd00tpp
ENV ENCRYPTION_SECRET=fcvxe9oxp6ppcpn3c4dyi8inf0bjs91xmfd00tpp
ENV NEXT_PUBLIC_WEBHOOK_URL=https://praisewhk.praisesistemas.uk/webhook/criarqrpshot

RUN npm run build

# Imagem de produção, copiar todos os arquivos e executar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Descomente a linha seguinte caso queira desabilitar a telemetria durante o runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Definir as permissões corretas para o cache de pré-renderização
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Aproveitar automaticamente os traces de saída para reduzir o tamanho da imagem
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js é criado pelo next build a partir do trace de saída
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]