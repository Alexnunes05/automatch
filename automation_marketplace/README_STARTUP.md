# Como Iniciar o Aplicativo

Este projeto utiliza **Vite** para o frontend e um servidor **Node.js** para o backend.

## Pré-requisitos

Certifique-se de ter o Node.js instalado.

## Passo a Passo

### 1. Iniciar o Servidor Backend

Abra um terminal na pasta `server`:

```bash
cd server
npm install  # Apenas na primeira vez
npm start
```

O servidor backend rodará na porta definida (geralmente 3000 ou 5000).

### 2. Iniciar o Frontend (Vite)

Abra um **novo** terminal na pasta raiz do projeto (`automation_marketplace`):

```bash
npm install  # Apenas na primeira vez
npm run dev
```

### 3. Acessar o Aplicativo

Após rodar `npm run dev`, o terminal mostrará um link, geralmente:
http://localhost:5173

Clique no link ou copie e cole no seu navegador. **Não abra o arquivo `index.html` diretamente**, pois isso causará erros de CORS.
