# NextLevel — Frontend 

Frontend da plataforma NextLevel (E‑learning). Projeto acadêmico construído com React + TypeScript e empacotado com Vite. O frontend consome microservices do backend via API Gateway e está configurado para apontar ao ambiente de produção (Railway).

## Tecnologias principais
- React (TypeScript)
- Vite
- Material UI (MUI) 
- React Router
- @tanstack/react-query
- Axios
- ECharts (visualizações)
- react-toastify
- jwt-decode

## Arquitetura e integrações principais
- Banco: PostgreSQL (hospedado via Supabase) — usado para persistência relacional (usuários, progresso, gamification, etc.).
- Armazenamento de arquivos: AWS S3 (região sa-east-1) — materiais de curso e certificados são armazenados no S3 via backend.
- Mensageria/filas: RabbitMQ (instância CloudAMQP) — utilizado para eventos e notificações entre microservices.
  - Observação: a URI do broker está gerenciada no Railway (credenciais não incluídas neste README).
- Cache / Leaderboard: Redis — instância provisionada no Railway e consumida pelo gamification-service (ioredis).
- Email: SendGrid — envio de e‑mails (cadastro, redefinição de senha, notificações). A integração usa a API do SendGrid no notification-service.
- Microservices via API Gateway — cada serviço expõe OpenAPI (documentação disponível desatualizada).

## OpenAPI  (documentação desatualizada)
- Gateway:  https://nextlevel-api-gateway-production.up.railway.app/docs/

## Deploy (produção)
- Plataforma: Railway
- Frontend: https://nextlevel-e-learning.up.railway.app/
- Variáveis (S3, SendGrid, Redis, RabbitMQ, Postgres) estão gerenciados no projeto Railway.

## Fluxos relevantes
- Cadastro / senha:
  - Funcionários fazem auto-cadastro (regra de ambiente: e-mail @gmail.com).
  - O notification-service consome eventos (RabbitMQ) e envia e‑mail com a senha/recuperação via SendGrid.

- Gamification:
  - O gamification-service usa Redis para leaderboard (sorted sets), e periodicamente sincroniza dados do Postgres para Redis (job agendado).

- Notificações:
  - notification-service consome eventos de vários exchanges (user, auth, progress, assessment, gamification) e cria/agenda envios de e‑mail e notificações internas.

## Usuários padrão
- Admin
  - Email: admin@nextlevel.com
  - Senha: NL123
  
- Instrutor 
  - Email: instrutor@nextlevel.com
  - Senha: NL123

## Repositórios relacionados
- api-gateway
- auth-service
- user-service
- notification-service
- course-service
- assessment-service
- progress-service
- gamification-service
- infra
