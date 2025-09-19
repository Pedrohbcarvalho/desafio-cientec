import { PrismaClient } from '@prisma/client';
import { Person } from "../model/Person.js";

export class PersonRepository {
    private static instance: PersonRepository;
    private prisma: PrismaClient;

    private constructor() {
        this.prisma = new PrismaClient();
    }

    public static getInstance(): PersonRepository {
        if (!PersonRepository.instance) {
            PersonRepository.instance = new PersonRepository();
        }
        return PersonRepository.instance;
    }

    public async findPersonByCpf(cpf: string): Promise<Person | null> {
        const personData = await this.prisma.person.findUnique({
            where: { cpf: cpf },
        });

        if (personData) {
            return { name: personData.name, cpf: personData.cpf } as Person;
        }

        return null;
    }

    public async findPersonByName(name: string): Promise<Person[]> {
        const peopleData = await this.prisma.person.findMany({
            where: {
                name: {
                    contains: name,
                },
            },
        });

        return peopleData;
    }

    public async savePerson(person: Person): Promise<Person> {
        await this.prisma.person.upsert({
            where: { cpf: person.cpf },
            update: { name: person.name },
            create: { cpf: person.cpf!, name: person.name! },
        });

        return { name: person.name, cpf: person.cpf } as Person;
    }
}
