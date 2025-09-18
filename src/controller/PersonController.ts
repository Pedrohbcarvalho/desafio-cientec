import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';

interface Person {
    cpf: string;
    name: string;
    id: number;
}

const mockDatabase: Person[] = [
    { cpf: '12345678901', name: 'Alice', id: 1 },
    { cpf: '98765432109', name: 'Bob', id: 2 },
    { cpf: '11122233344', name: 'Alice', id: 3 },
    { cpf: '55566677788', name: 'Carlos', id: 4 },
];

export class PersonController {
    private static instance: PersonController;

    private constructor() { }

    public static getInstance(): PersonController {
        if (!PersonController.instance) {
            PersonController.instance = new PersonController();
        }
        return PersonController.instance;
    }

    public getPersonByName(req: IncomingMessage, res: ServerResponse): void {
        const parsedUrl = parse(req.url || '', true);
        const nameQuery = parsedUrl.query.name as string;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        const unexpectedParams = Object.keys(parsedUrl.query).filter(key => key !== 'name');

        if (unexpectedParams.length > 0) {
            res.end(JSON.stringify([]));
            return;
        }

        if (nameQuery) {
            const filteredUsers = mockDatabase.filter(user => user.name.toLowerCase() === nameQuery.toLowerCase());
            res.end(JSON.stringify(filteredUsers));
        } else {
            res.end(JSON.stringify(mockDatabase));
        }
    }

    public getPersonByCpf(req: IncomingMessage, res: ServerResponse, cpf: string): void {
        const user = mockDatabase.find(user => user.cpf === cpf);

        if (user) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(user));
        } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'User not found' }));
        }
    }

    public createPerson(req: IncomingMessage, res: ServerResponse): void {
        let body = '';
        req.on('data', (chunk: any) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const newUser = JSON.parse(body);
                console.log('Novo usuário criado:', newUser);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'User created successfully', user: newUser }));
            } catch (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Invalid JSON');
            }
        });
    }
}
