# ⚡ Notoria API -- Back-end da Plataforma de Gestão Educacional

- ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![Fastify](https://img.shields.io/badge/Fastify-202020?style=for-the-badge&logo=fastify&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
  ![NeonDB](https://img.shields.io/badge/NeonDB-00897B?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Google
Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)

---

## 🎯 Sobre o Projeto

A **Notoria API** é o back-end da plataforma **Notoria**, responsável
por gerenciar toda a lógica de negócio e comunicação com o banco de
dados.\
Ela fornece endpoints seguros e escaláveis para autenticação, gestão de
professores, alunos, turmas e atividades, além de envio de notificações
por e-mail.

---

## 📌 Funcionalidades Principais

- 🔑 **Autenticação** de usuários (professores e alunos).\
- 🏫 **Gestão de turmas**: criação, listagem e associação de alunos e
  professores.\
- 📝 **Gestão de atividades**: criação, submissão e correção.\
- 📊 **Desempenho de alunos**: cálculo e acompanhamento de
  notas/scores.\
- 📧 **Envio de e-mails** via integração com **Google Gmail API**.
- 💬 **Chat** entre Professores e Alunos

---

## 🛠️ Tecnologias Utilizadas

- **Fastify** -- Framework Node.js leve e rápido para criação da API.\
- **TypeScript** -- Tipagem estática para maior confiabilidade do
  código.\
- **PostgreSQL** -- Banco de dados relacional robusto.\
- **Prisma ORM** -- Mapeamento de dados eficiente e tipado.\
- **NeonDB** -- Banco de dados PostgreSQL em nuvem.\
- **Vercel** -- Deploy da API em ambiente serverless.\
- **Google Gmail API** -- Envio de e-mails automatizados.

---

## ⚙️ Instalação e Uso

### Pré-requisitos

- Node.js >= 18
- PostgreSQL
- Conta Google com senha de app para envio de e-mails (necessita de autênticação de dois fatores).
- [Notoria Front-end](https://github.com/nielassis/notoria-front-end)

### Passos

```bash
# Clone este repositório
git clone https://github.com/nielassis/notoria-user-module
cd notoria-api

# Instale as dependências
npm install

# Configure variáveis de ambiente no arquivo .env
DATABASE_URL="" # Url do banco de dados
PORT="" # Porta da aplicação
SECRET="" # Secret do token (login)
FRONT_END_URL="" # url da aplicação front-end
GMAIL_USER="" # email do administrador (é necessário criar um app no google para enviar emails)
GMAIL_APP_PASSWORD="" # senha do app (é necessário criar um app no google para enviar emails)

# Execute as migrações do Prisma
npx prisma migrate dev

# Rode o servidor em desenvolvimento
npm run dev
```

A API estará disponível em:

    http://localhost:3001

---

obs: lembre-se de rodar a aplicação front-end também >:D

## 📦 Deploy

A API está configurada para rodar em ambiente **serverless** via
**Vercel**, com conexão direta ao banco **NeonDB**.\
Basta configurar as variáveis de ambiente no painel da Vercel e realizar
o deploy.

---
