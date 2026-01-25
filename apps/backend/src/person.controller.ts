import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto, Person } from '@fun-budget/domain';

@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  async createPerson(@Body() data: CreatePersonDto): Promise<Person> {
    return this.personService.createPerson(data);
  }

  @Get()
  async getPeople(): Promise<Person[]> {
    return this.personService.getPeople();
  }

  @Get(':id')
  async getPerson(@Param('id') id: string): Promise<Person> {
    return this.personService.getPersonById(id);
  }

  @Put(':id')
  async updatePerson(
    @Param('id') id: string,
    @Body() data: Partial<CreatePersonDto>,
  ): Promise<Person> {
    return this.personService.updatePerson(id, data);
  }

  @Delete(':id')
  async deletePerson(@Param('id') id: string): Promise<void> {
    return this.personService.deletePerson(id);
  }
}