FROM node:22-alpine3.20 AS build
WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (melhor cache)
COPY package*.json ./

# Instalar as dependências
RUN npm install --frozen-lockfile

# Copiar o código fonte (isso invalida o cache quando há mudanças)
COPY . .

FROM nginx:1.28.0-alpine-slim
COPY --from=build /app/nginx /etc/nginx/conf.d
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;", "npm", "run", "dev"]