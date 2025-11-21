FROM node:22-alpine3.20 AS dev
WORKDIR /usr/src/app

# Copiar apenas arquivos de dependências primeiro (melhor cache)
COPY package*.json ./

# Instalar as dependências
RUN npm ci

# Stage de build para produção
FROM node:22-alpine3.20 AS build
WORKDIR /usr/src/app

# Copiar dependências já instaladas
COPY --from=dev /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copiar o código fonte
COPY ./ ./

# Build para produção
RUN npm run build

FROM nginx:1.28.0-alpine-slim
COPY --from=build /usr/src/app/nginx /etc/nginx/conf.d
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]