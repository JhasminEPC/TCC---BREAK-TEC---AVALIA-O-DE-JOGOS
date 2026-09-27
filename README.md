# 🎮 Break Tec

Break Tec é uma plataforma web desenvolvida para publicação e avaliação de projetos relacionados a jogos.

O sistema possui cadastro e login de usuários, perfis, publicação de projetos, edição, exclusão, favoritos e outras funcionalidades em desenvolvimento.

## 🛠️ Tecnologias

- HTML
- CSS
- JavaScript
- Node.js
- Express
- MySQL
- bcrypt
- express-session
- dotenv
- Git e GitHub

## 📥 Como baixar o projeto

Primeiro, instale:

- Git
- Node.js
- MySQL
- Visual Studio Code

Depois, copie o endereço HTTPS deste repositório e execute:

```bash
git clone ENDERECO_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd break-tec
```

Abra no VS Code:

```bash
code .
```

Se `code .` não funcionar, abra o VS Code e selecione:

File → Open Folder

## 📦 Instalar dependências

Dentro da pasta do projeto:

```bash
npm install
```

Não é necessário compartilhar a pasta `node_modules`.

## 🗄️ Configurar o banco de dados

O arquivo:

```text
database.sql
```

contém a estrutura necessária para criar o banco e as tabelas.

Abra o MySQL Workbench ou outro cliente MySQL e execute o conteúdo desse arquivo.

## 🔐 Configurar o .env

O arquivo `.env` contém informações privadas e não está disponível no GitHub.

Use o arquivo:

```text
.env.example
```

como modelo.

Crie um arquivo chamado `.env` e configure:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA_DO_MYSQL
DB_NAME=breaktec
SESSION_SECRET=CRIE_SUA_CHAVE_SECRETA
```

Cada integrante deve utilizar as próprias configurações do MySQL.

Nunca envie o `.env` para o GitHub.

## ▶️ Executar o projeto

No terminal:

```bash
node server.js
```

Depois acesse:

```text
http://localhost:3000
```

## 👥 Trabalhando em grupo

Antes de começar a trabalhar, baixe as alterações mais recentes:

```bash
git pull
```

Depois de alterar arquivos:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

Sempre execute `git pull` antes de começar a trabalhar para diminuir a chance de conflitos.

## 🌿 Recomendação: usar branches

Para mudanças maiores, crie uma branch própria:

```bash
git switch -c nome-da-branch
```

Por exemplo:

```bash
git switch -c favoritos
```

Depois:

```bash
git add .
git commit -m "Implementa sistema de favoritos"
git push -u origin favoritos
```

A alteração poderá então ser revisada no GitHub antes de entrar na branch `main`.

## 📁 Arquivos privados

Os seguintes arquivos/pastas não devem ser enviados:

```text
.env
node_modules/
```