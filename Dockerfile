# Stage 1: Build
FROM node:22-alpine3.20 AS build

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (melhor cache)
COPY package*.json ./

# Instalar dependências
RUN npm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar build de produção
RUN npm run build

# Stage 2: Production
FROM nginx:1.28.0-alpine-slim

# Copiar configuração customizada do nginx
COPY --from=build /app/nginx /etc/nginx/conf.d

# Copiar arquivos estáticos do build
COPY --from=build /app/dist /usr/share/nginx/html

# Expor porta
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]