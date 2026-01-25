import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto, Rule } from '@fun-budget/domain';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  async createRule(@Body() data: CreateRuleDto): Promise<Rule> {
    return this.rulesService.createRule(data);
  }

  @Get()
  async getAllRules(@Query('includeDisabled') includeDisabled?: string): Promise<Rule[]> {
    return this.rulesService.getAllRules(includeDisabled === 'true');
  }

  @Get('budget/:budgetId')
  async getRulesByBudget(@Param('budgetId') budgetId: string): Promise<Rule[]> {
    return this.rulesService.getRulesByBudget(budgetId);
  }

  @Delete(':id')
  async deleteRule(@Param('id') id: string): Promise<void> {
    return this.rulesService.deleteRule(id);
  }
}
