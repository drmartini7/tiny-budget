import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { BudgetService } from './budget.service';
import { RulesService } from './rules.service';
import { PersonService } from './person.service';
import { BudgetController } from './budget.controller';
import { RulesController } from './rules.controller';
import { PersonController } from './person.controller';

@Module({
  imports: [],
  controllers: [
    AppController, 
    BudgetController, 
    RulesController, 
    PersonController
  ],
  providers: [
    AppService, 
    PrismaService, 
    BudgetService, 
    RulesService, 
    PersonService
  ],
})
export class AppModule {}