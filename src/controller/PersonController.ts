import { IncomingMessage, ServerResponse } from 'http';
import { PersonService } from '../service/PersonService.js';
import { Person } from '../model/Person.js';
import { HttpError } from '../errors/HttpError.js';
import { BusinessLogicError } from "../errors/BusinessLogicError.js";

export class PersonController {
    private static instance: PersonController;
    private personService: PersonService;

    private constructor() {
        this.personService = new PersonService();
    }

    public static getInstance(): PersonController {
        if (!PersonController.instance) {
            PersonController.instance = new PersonController();
        }
        return PersonController.instance;
    }

    public async getPersonByName(req: IncomingMessage, res: ServerResponse): Promise<void> {
        try {
            const requestUrl = new URL(req.url || '', `http://${req.headers.host}`);
            const name = requestUrl.searchParams.get('name');

            if (!name) {
                throw new BusinessLogicError('Os dados de busca devem conter alguma informação.');
            }
            const persons = await this.personService.getPersonByName(name);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(persons));
        } catch (error) {
            if (error instanceof HttpError) {
                res.statusCode = error.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: error.message }));
            }
            else {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: (error as Error).message }));
            }
        }
    }

    public async getPersonByCpf(_req: IncomingMessage, res: ServerResponse, cpf: string): Promise<void> {
        try {
            const person: Person = await this.personService.getPersonByCpf(cpf);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(person));
        } catch (error) {
            if (error instanceof HttpError) {
                res.statusCode = error.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: error.message }));
            }
            else {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: (error as Error).message }));
            }
        }
    }

    public async createPerson(req: IncomingMessage, res: ServerResponse): Promise<void> {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                if (req.headers['content-type'] !== 'application/json') {
                    res.writeHead(415, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Content-Type must be application/json' }));
                    return;
                }

                const parsedBody = JSON.parse(body);
                const personToCreate = { name: parsedBody.name, cpf: parsedBody.cpf } as Person;
                const createdPerson = await this.personService.createPerson(personToCreate);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario criado com sucesso', person: createdPerson }));

            } catch (error) {
                if (error instanceof HttpError) {
                    res.statusCode = error.status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: error.message }));
                }
                else {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ message: (error as Error).message }));
                }
            }
        });
    }
}
