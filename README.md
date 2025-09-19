# Desafio Cientec

> Projeto feito para resolver o desafio

## Tecnologias Utilizadas

- **Frontend:** HTML/CSS e JavaScript
- **Backend:** Node.js com TypeScript
- **Banco de Dados:** SQLite

## Instalação e uso

Siga os passos abaixo para instalar e rodar o projeto localmente.

1. **Instale as ferramentas abaixo**
   - [Git](https://git-scm.com)
    - [Node.js](https://nodejs.org/en/download/archive/v22.19.0) (versão 22.19.0)

2. **Clone o repositório:**
   ```sh
   git clone https://github.com/Pedrohbcarvalho/desafio-cientec.git  
    ```
3.  **Navegue até o diretório do projeto:**
    ```sh
    cd desafio-cientec
    ```
4.  **Instale as dependências:**
    ```sh
    npm install
    ```
5.  **Configure as variáveis de ambiente:**
      - Crie um arquivo `.env` na raiz do projeto.
      - No arquivo, defina a DATABASE_URL como mostrado abaixo, ou no arquivo .env.example.
        ```
        DATABASE_URL="file:./prisma/desafioCientec.db"
        ```
6.  **Faça o build do projeto**
    ```sh
    npm run build
    ```
7.  **Rode o projeto**
    ```sh
    npm run start:prod
    ```
8.  **Por fim, acesse o site em seu navegador usando o endereço abaixo**
    - http://localhost:3000

## Layout do projeto

```
├─ prisma/          Arquivos de configuração e migração do banco de dados
│  └─ migrations/   Histórico de migrações do banco de dados
└─ src/             Código-fonte da aplicação
   ├─ controller/   Controlador (camada de entrada da API)
   ├─ errors/       Erros customizados para tratamento de exceção
   ├─ model/        Modelos (representação dos modelos de negócio)
   ├─ repository/   Repositório (camada de acesso a dados)
   ├─ router/       Definição das rotas da API e de como lidar com arquivos estáticos
   ├─ service/      Serviços (camada de regras de negócio)
   └─ view/         Lida com os arquivos de apresentação do site 
      ├─ scripts/   Script necessário para o dinamismo da tela
      └─ styles/    Estilização da página
```    

## Autor

<table>
    <tr>
        <td align="center">
            <a href="https://github.com/Pedrohbcarvalho">
                <img
                    src="https://avatars.githubusercontent.com/u/115186336?v=4"
                    width="100px;"
                    alt="Profile Image Pedro Henrique"
                />
                </br>
                <sub>
                    <b>Pedro Henrique</b>
                </sub>
            </a>
        </td>
        <td align="center">
            <p>Pedro Henrique –
                <a href="mailto:pedrohbc1504@gmail.com">
                    pedrohbc1504@gmail.com
                </a>
            </p>
        </td>
    </tr>

