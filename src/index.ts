import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hostname = 'localhost';
const port = 3000;

// Defina os caminhos base para cada tipo de conteúdo
const htmlPath = path.join(__dirname, 'view', 'html');
const stylesPath = path.join(__dirname, 'view', 'styles');

// Mapeamento de tipos de conteúdo (MIME Types)
const mimeTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
    let filePath = '';
    const url = req.url || '';

    // Roteamento baseado na URL da requisição
    if (url === '/') {
        // Se for a URL raiz, serve o index.html
        filePath = path.join(htmlPath, 'index.html');
    } else if (url.startsWith('/styles/')) {
        // Se a URL começar com /styles/, serve o arquivo da pasta de estilos
        filePath = path.join(stylesPath, url.substring('/styles/'.length));
    } else {
        // Para outras requisições, como imagens ou scripts
        // será retornado 404 para simplificar
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Página ou arquivo não encontrado');
        return;
    }

    // Pega a extensão do arquivo e o tipo de conteúdo correspondente
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end('404: Arquivo não encontrado');
            } else {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end('Erro interno do servidor');
            }
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.end(data);
        }
    });
});

server.listen(port, hostname, () => {
    console.log(`Servidor rodando em http://${hostname}:${port}/`);
});
