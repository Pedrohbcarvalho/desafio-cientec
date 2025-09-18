import { Person } from "../model/Person.js";

export class PersonRepository {
    private static instance: PersonRepository;

    public static getInstance(): PersonRepository {
        if (!PersonRepository.instance) {
            PersonRepository.instance = new PersonRepository();
        }
        return PersonRepository.instance;
    }

    public findPersonByCpf(cpf: string): Person {

    }

    public findPersonByName(name: string): Person[] {

    }

    public savePerson(person: Person): void {

    }
}
