# NextLevel E-Learning System - Frontend Repository Summary

## 📚 Visão Geral do Projeto

Este repositório contém o **frontend** do sistema NextLevel E-Learning, uma plataforma educacional desenvolvida para organizações gerenciarem cursos, acompanharem o progresso de aprendizado de funcionários e gamificarem a experiência de aprendizado.

**Links Importantes:**
- 🌐 **Produção**: https://nextlevel-e-learning.up.railway.app/
- 📡 **API Gateway**: https://nextlevel-api-gateway-production.up.railway.app/docs/

---

## 🛠️ Tecnologias Principais

### Framework e Build
- **React 18.3** com **TypeScript** - Framework JavaScript para construção de interfaces
- **Vite** (beta) - Ferramenta de build rápida e moderna
- **ESLint** - Linter para qualidade de código

### UI/UX
- **Material-UI (MUI) v7.3.2** - Biblioteca de componentes React
- **Emotion** - CSS-in-JS para estilização
- **React Router v6** - Roteamento de páginas

### Gerenciamento de Estado e Dados
- **TanStack React Query v5** - Gerenciamento de estado do servidor
- **Axios** - Cliente HTTP para requisições à API
- **React Context** - Gerenciamento de autenticação
- **Zod** - Validação de schemas

### Outras Bibliotecas
- **ECharts** - Visualização de dados e gráficos
- **react-toastify** - Sistema de notificações
- **jwt-decode** - Decodificação de tokens JWT
- **date-fns** - Manipulação de datas

---

## 👥 Tipos de Usuários

O sistema suporta **três perfis principais**:

1. **FUNCIONARIO (Colaborador/Aluno)** 
   - Acessa cursos disponíveis
   - Visualiza progresso de aprendizado
   - Realiza avaliações e quizzes
   - Participa do sistema de gamificação

2. **INSTRUTOR (Instrutor)**
   - Cria e gerencia cursos
   - Desenvolve módulos e materiais
   - Acompanha progresso dos alunos
   - Cria avaliações

3. **ADMIN (Administrador)**
   - Gerencia usuários e departamentos
   - Configura categorias de cursos
   - Administra o sistema completo

---

## 🎯 Funcionalidades Principais

### 📖 Gerenciamento de Cursos
- Criação e edição de cursos com múltiplos módulos
- Upload de materiais (vídeos, documentos, slides)
- Organização por categorias
- Sistema de pré-requisitos

### 🎓 Experiência de Aprendizado
- Player de vídeo integrado
- Navegação por módulos e conteúdos
- Sistema de avaliações e quizzes
- Acompanhamento de progresso em tempo real

### 📊 Acompanhamento e Relatórios
- Dashboard de progresso individual
- Métricas de conclusão de cursos
- Estatísticas de desempenho
- Histórico de atividades

### 🏆 Gamificação
- Sistema de ranking/leaderboard
- Conquistas e badges
- Pontuação por atividades
- Competição saudável entre colaboradores

### 👤 Gerenciamento de Usuários
- Cadastro e autenticação (JWT)
- Gerenciamento de departamentos
- Atribuição de cursos
- Perfis e permissões

### 📜 Certificados
- Geração automática de certificados
- Armazenamento e visualização
- Download em PDF

### 🔔 Sistema de Notificações
- Notificações em tempo real
- Alertas de novos cursos
- Lembretes de atividades

---

## 🏗️ Arquitetura do Sistema

### Backend (Microserviços)
A aplicação frontend se comunica com múltiplos microserviços através de um API Gateway:

- **api-gateway** - Ponto de entrada único para todas as requisições
- **auth-service** - Autenticação e autorização
- **user-service** - Gerenciamento de usuários
- **course-service** - Gerenciamento de cursos e módulos
- **assessment-service** - Sistema de avaliações
- **progress-service** - Acompanhamento de progresso
- **gamification-service** - Sistema de gamificação e ranking
- **notification-service** - Envio de notificações

### Infraestrutura
- **Banco de Dados**: PostgreSQL (Supabase)
- **Armazenamento**: AWS S3 (região sa-east-1)
- **Fila de Mensagens**: RabbitMQ (CloudAMQP)
- **Cache**: Redis (Railway) - usado para leaderboard
- **E-mail**: SendGrid para envio de e-mails
- **Deploy**: Railway (plataforma de hospedagem)

---

## 📁 Estrutura do Projeto

```
web-frontend/
├── src/
│   ├── pages/              # Páginas da aplicação
│   │   ├── Admin/          # Dashboards administrativos
│   │   ├── Employee/       # Páginas do colaborador
│   │   ├── Instructor/     # Páginas do instrutor
│   │   ├── Login/          # Autenticação
│   │   └── Register/       # Cadastro
│   │
│   ├── components/         # Componentes reutilizáveis
│   │   ├── admin/          # Componentes administrativos
│   │   ├── assessments/    # Componentes de avaliações
│   │   ├── learning/       # Componentes de aprendizado
│   │   ├── modules/        # Componentes de módulos
│   │   └── ...
│   │
│   ├── api/                # Clientes HTTP para serviços
│   │   ├── authApi.ts
│   │   ├── coursesApi.ts
│   │   ├── progressApi.ts
│   │   └── ...
│   │
│   ├── contexts/           # Contextos React
│   │   └── AuthContext.tsx # Contexto de autenticação
│   │
│   ├── hooks/              # Custom React Hooks
│   ├── routes/             # Configuração de rotas
│   ├── config/             # Configurações
│   └── types/              # Definições TypeScript
│
├── public/                 # Arquivos estáticos
├── index.html             # HTML principal
├── package.json           # Dependências
├── vite.config.ts         # Configuração Vite
└── tsconfig.json          # Configuração TypeScript
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão recomendada: 18+)
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Variáveis de Ambiente
Configure as variáveis necessárias para conectar aos serviços backend (API Gateway URL, etc.)

---

## 📄 Páginas Principais

### Autenticação
- `/login` - Login de usuários
- `/register` - Cadastro de novos usuários
- `/forgot-password` - Recuperação de senha

### Colaborador (Employee)
- `/employee/dashboard` - Dashboard principal
- `/employee/courses` - Catálogo de cursos
- `/employee/courses/:id` - Detalhes e conteúdo do curso
- `/employee/progress` - Acompanhamento de progresso
- `/employee/ranking` - Leaderboard/ranking

### Instrutor
- `/instructor/dashboard` - Dashboard do instrutor
- `/instructor/courses` - Gerenciamento de cursos
- `/instructor/students` - Acompanhamento de alunos

### Administrador
- `/admin/dashboard` - Dashboard administrativo
- `/admin/users` - Gerenciamento de usuários
- `/admin/departments` - Gerenciamento de departamentos
- `/admin/categories` - Gerenciamento de categorias
- `/admin/courses` - Gerenciamento de cursos
- `/admin/instructors` - Gerenciamento de instrutores

---

## 🔐 Autenticação e Segurança

- Sistema de autenticação baseado em **JWT (JSON Web Tokens)**
- Tokens armazenados de forma segura
- Rotas protegidas com guards baseados em perfil de usuário
- Renovação automática de tokens
- Logout seguro

---

## 📊 Funcionalidades de Visualização de Dados

- Gráficos de progresso usando **ECharts**
- Dashboards interativos
- Métricas em tempo real
- Relatórios visuais de desempenho

---

## 🎨 Design e UX

- Interface moderna e responsiva com **Material-UI**
- Design system consistente
- Tema customizável
- Experiência otimizada para desktop e mobile
- Feedback visual para todas as ações

---

## 🧪 Qualidade de Código

- **TypeScript** para type safety
- **ESLint** para linting
- Estrutura de código organizada e modular
- Componentes reutilizáveis
- Separação clara de responsabilidades

---

## 📝 Observações Importantes

Este é um **projeto acadêmico** desenvolvido como parte de um sistema de e-learning completo. O frontend está integrado com uma arquitetura de microserviços robusta e utiliza tecnologias modernas para proporcionar uma experiência de aprendizado rica e interativa.

A aplicação está em **produção** e pode ser acessada através do link: https://nextlevel-e-learning.up.railway.app/

---

## 📧 Contato e Suporte

Para mais informações sobre o projeto ou suporte, consulte a documentação da API Gateway em:
https://nextlevel-api-gateway-production.up.railway.app/docs/
