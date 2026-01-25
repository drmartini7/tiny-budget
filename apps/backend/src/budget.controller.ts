import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { RulesService } from './rules.service';
import { 
  CreateBudgetDto, 
  CreateTransactionDto, 
  BudgetWithDetails, 
  Transaction,
  RuleExecutionResult 
} from '@fun-budget/domain';

@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly budgetService: BudgetService,
    private readonly rulesService: RulesService,
  ) {}

  @Post()
  async createBudget(@Body() data: CreateBudgetDto): Promise<BudgetWithDetails> {
    const budget = await this.budgetService.createBudget(data);
    return this.budgetService.getBudgetById(budget.id);
  }

  @Get()
  async getAllBudgets(@Query('includeDisabled') includeDisabled?: string): Promise<BudgetWithDetails[]> {
    return this.budgetService.getAllBudgets(includeDisabled === 'true');
  }

  @Get('owner/:ownerId')
  async getBudgetsByOwner(
    @Param('ownerId') ownerId: string,
    @Query('includeDisabled') includeDisabled?: string
  ): Promise<BudgetWithDetails[]> {
    return this.budgetService.getBudgetsByOwner(ownerId, includeDisabled === 'true');
  }

  @Get(':id')
  async getBudget(@Param('id') id: string): Promise<BudgetWithDetails> {
    return this.budgetService.getBudgetById(id);
  }

  @Post(':id/transactions')
  async createTransaction(
    @Param('id') budgetId: string,
    @Body() data: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.budgetService.createTransaction({
      ...data,
      budgetId,
    });
  }

  @Get(':id/transactions')
  async getTransactions(@Param('id') budgetId: string): Promise<Transaction[]> {
    return this.budgetService.getTransactions(budgetId);
  }

  @Post(':id/execute-rules')
  async executeRules(@Param('id') budgetId: string): Promise<RuleExecutionResult[]> {
    return this.rulesService.executeRulesForBudget(budgetId);
  }

  @Post(':id/rollover')
  async rolloverPeriod(@Param('id') budgetId: string): Promise<void> {
    return this.budgetService.rolloverPeriod(budgetId);
  }

  @Put(':id/enabled')
  async setBudgetEnabled(
    @Param('id') id: string,
    @Body() body: { enabled: boolean }
  ): Promise<BudgetWithDetails> {
    const budget = await this.budgetService.setBudgetEnabled(id, body.enabled);
    return this.budgetService.getBudgetById(budget.id);
  }
}
