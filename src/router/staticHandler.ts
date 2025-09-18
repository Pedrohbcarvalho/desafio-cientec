import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { IncomingMessage, ServerResponse } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..', 'view');

const mimeTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

export async function serveStaticFile(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = req.url === '/' ? '/html/index.html' : req.url;
    const filePath = path.join(publicPath, url ?? "");

    const isSafePath = path.resolve(filePath).startsWith(path.resolve(publicPath));
    if (!isSafePath) {
        return false;
    }

    try {
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        const fileContent = await fs.readFile(filePath);

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.end(fileContent);
        return true;
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return false;
        } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('Erro interno do servidor ao ler o arquivo.');
            return true;
        }
    }
}
