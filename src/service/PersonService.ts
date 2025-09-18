import { ConflictError } from "../errors/ConflictError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { BusinessLogicError } from "../errors/BusinessLogicError.js";
import { Person } from "../model/Person.js";
import { PersonRepository } from "../repository/PersonRepository.js";
import { cpf } from 'cpf-cnpj-validator';

export class PersonService {

    private personRepository: PersonRepository;

    public constructor() {
        this.personRepository = PersonRepository.getInstance();
    }

    public async getPersonByName(name: string): Promise<Person[]> {
        if (name.trim().length === 0)
            throw new BusinessLogicError('Os dados de busca devem conter alguma informação.');

        const personCollection = await this.personRepository.findPersonByName(name);
        if (personCollection.length === 0)
            throw new NotFoundError('Não foi possível encontrar pessoas com esse nome.');

        return personCollection;
    }

    public async getPersonByCpf(cpfParam: string): Promise<Person> {
        if (cpfParam.trim().length === 0)
            throw new BusinessLogicError('Os dados de busca devem conter alguma informação.');

        if (!cpf.isValid(cpfParam))
            throw new BusinessLogicError('O CPF informado não é válido.');

        const person = await this.personRepository.findPersonByCpf(cpfParam);
        if (!person)
            throw new NotFoundError('Não foi possível encontrar pessoas com esse cpf.');

        return person;
    }

    public createPerson(person: Person): void {
        const name = person.name;
        const cpf = person.cpf;

        if (name.trim().length === 0 || cpf.trim().length === 0) {
            throw new BusinessLogicError('Os dados de inserção devem conter alguma informação.');
        }

        const searchResult = this.personRepository.findPersonByCpf(cpf);
        if (searchResult !== null) {
            throw new ConflictError('O CPF informado já está registrado, não foi possível fazer o cadastro.');
        }

        this.personRepository.savePerson(person);
    }
}
