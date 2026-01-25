import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Person, CreatePersonDto } from '@fun-budget/domain';

@Injectable()
export class PersonService {
  constructor(private prisma: PrismaService) {}

  async createPerson(data: CreatePersonDto): Promise<Person> {
    return this.prisma.person.create({
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }

  async getPeople(): Promise<Person[]> {
    return this.prisma.person.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getPersonById(id: string): Promise<Person> {
    const person = await this.prisma.person.findUnique({
      where: { id },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  async updatePerson(id: string, data: Partial<CreatePersonDto>): Promise<Person> {
    const person = await this.prisma.person.update({
      where: { id },
      data,
    });

    return person;
  }

  async deletePerson(id: string): Promise<void> {
    await this.prisma.person.delete({
      where: { id },
    });
  }
}