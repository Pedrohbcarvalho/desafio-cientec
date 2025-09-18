import http from 'http';
import { handleRequest, get, post } from './router/router.js';
import { serveStaticFile } from './router/staticHandler.js';
import { PersonController } from './controller/PersonController.js';
import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';

const hostname = 'localhost';
const port = 3000;

const personController = PersonController.getInstance();

get('/person', personController.getPersonByName.bind(personController));
get('/person/:cpf', (req, res) => {
    const cpf = (req as any).params.cpf;
    personController.getPersonByCpf(req, res, cpf);
});

post('/person', personController.createPerson.bind(personController));

const server = http.createServer(async (req, res) => {
    const served = await serveStaticFile(req, res);

    if (!served) {
        handleRequest(req, res);
    }
});

server.listen(port, hostname, () => {
    console.log(`Servidor rodando em http://${hostname}:${port}/`);
});
