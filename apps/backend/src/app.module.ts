import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { BudgetService } from './budget.service';
import { RulesService } from './rules.service';
import { PersonService } from './person.service';
import { PayeesService } from './payees.service';
import { BudgetController } from './budget.controller';
import { RulesController } from './rules.controller';
import { PersonController } from './person.controller';
import { PayeesController } from './payees.controller';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController, 
    BudgetController, 
    RulesController, 
    PersonController,
    PayeesController,
    AccountsController
  ],
  providers: [
    AppService, 
    PrismaService, 
    BudgetService, 
    RulesService, 
    PersonService,
    PayeesService,
    AccountsService,
    TasksService
  ],
})
export class AppModule {}