# API NestJS com GraphQL (Schema-First)

## Visão Geral

Esta é uma API escalável construída com **NestJS**, utilizando **GraphQL** na abordagem _Schema-First_. O projeto serve como um exemplo prático de como estruturar uma aplicação moderna, com foco em performance, boas práticas e testabilidade.

A API utiliza um banco de dados **PostgreSQL** gerenciado pela ORM **Sequelize**, com autenticação baseada em **JWT (JSON Web Tokens)** e otimizações de consulta para resolver o problema N+1 usando **DataLoaders** e análise de **AST (Abstract Syntax Tree)**.

## Tecnologias Principais

- **Framework**: NestJS
- **API**: GraphQL (Apollo Server, Schema-First)
- **Banco de Dados**: PostgreSQL
- **ORM**: Sequelize
- **Autenticação**: JWT (JSON Web Tokens)
- **Testes**: Jest para testes unitários
- **Linguagem**: TypeScript

## Arquitetura e Conceitos Chave

### 1. NestJS

O projeto é estruturado em módulos, controladores (resolvers) e serviços, seguindo a arquitetura modular do NestJS. Isso promove uma clara separação de responsabilidades e facilita a manutenção e o crescimento da aplicação. A injeção de dependência é usada extensivamente para gerenciar os serviços e outras dependências.

### 2. GraphQL (Schema-First)

A abordagem _Schema-First_ foi adotada, o que significa que o contrato da API é definido em um arquivo de schema GraphQL (`.graphql`). As vantagens incluem:

- **Fonte Única de Verdade**: O schema é a documentação definitiva da API.
- **Desenvolvimento Paralelo**: As equipes de frontend e backend podem trabalhar em paralelo, usando o schema como contrato.
- **Geração de Tipos**: Os tipos do TypeScript podem ser gerados a partir do schema, garantindo consistência entre o schema e os resolvers.

Os resolvers do NestJS implementam a lógica para cada campo definido no schema.

### 3. Otimização de Performance

Para garantir que a API seja rápida e eficiente, duas técnicas principais de otimização foram implementadas:

#### a. DataLoader

O padrão **DataLoader** é utilizado para resolver o clássico problema de consulta N+1 em GraphQL. Ele agrupa múltiplas requisições de dados que ocorreriam em um único ciclo de eventos em uma única consulta ao banco de dados.

No projeto, os `CommentLoader` (por `postId` e `userId`) são exemplos claros dessa implementação. Eles recebem uma lista de IDs, buscam todos os comentários correspondentes de uma só vez e os distribuem de volta para os resolvers corretos.

#### b. Análise de AST (Abstract Syntax Tree)

Para evitar a busca de dados desnecessários no banco de dados (_over-fetching_), a API analisa a árvore de sintaxe abstrata (AST) da consulta GraphQL.

A função utilitária `getAttributes` inspeciona o objeto `GraphQLResolveInfo` para determinar exatamente quais campos foram solicitados pelo cliente. Apenas esses campos são incluídos na consulta ao banco de dados feita pelo Sequelize, resultando em queries mais leves e eficientes.

### 4. Banco de Dados e ORM (Postgres & Sequelize)

O **PostgreSQL** foi escolhido como o banco de dados relacional, e o **Sequelize** atua como a camada de ORM (Object-Relational Mapping). O Sequelize facilita a definição de modelos, a execução de migrações e a interação com o banco de dados de forma segura e produtiva, usando objetos e métodos TypeScript em vez de SQL bruto.

### 5. Autenticação com JWT

A segurança das rotas que exigem autenticação é garantida por meio de JSON Web Tokens. O fluxo geral é:

1. O usuário faz login com suas credenciais.
2. A API valida as credenciais e gera um token JWT assinado, contendo informações do usuário (como o `userId`).
3. O cliente armazena o token e o envia no cabeçalho `Authorization` de cada requisição subsequente.
4. Um `Guard` do NestJS intercepta as requisições, valida o token e anexa os dados do usuário (payload) ao objeto da requisição.
5. Os resolvers e serviços usam o `userId` da requisição para autorizar ações (ex: verificar se o usuário pode editar ou deletar um comentário).

### 6. Testes Unitários

O projeto possui uma suíte de testes unitários construída com **Jest**. Os testes focam em isolar e validar a lógica de negócio nos serviços e a correta implementação dos `DataLoaders`, utilizando mocks para simular dependências como serviços e o banco de dados. Isso garante que novas alterações não quebrem a funcionalidade existente.

## Como Executar

1.  **Configurar Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz do projeto a partir do `.env.example` e preencha as variáveis necessárias (banco de dados, segredo do JWT, etc.).

2.  **Instalar Dependências**

    ```bash
    pnpm install
    ```

3.  **Executar a Aplicação**
    ```bash
    pnpm start:dev
    ```

A API estará disponível em `http://localhost:3000/graphql`.

## Executando os Testes

Para rodar a suíte de testes unitários, execute:

```bash
npm test
```

Para ver a cobertura de testes:

```bash
npm run test:cov
```
