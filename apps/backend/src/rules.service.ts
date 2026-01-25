import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { 
  Rule, 
  CreateRuleDto, 
  TransactionType, 
  PeriodType,
  RuleExecutionResult
} from '@fun-budget/domain';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  private toDomainRule(r: any): Rule {
    return {
      id: r.id,
      budgetId: r.budgetId,
      amount: r.amount,
      frequency: r.frequency as any,
      executionDay: r.executionDay,
      startDate: r.startDate,
      endDate: r.endDate ?? undefined,
      description: r.description,
      lastExecutedAt: r.lastExecutedAt ?? undefined,
    };
  }

  async createRule(data: CreateRuleDto): Promise<Rule> {
    const rule = await this.prisma.rule.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    return this.toDomainRule(rule);
  }

  async getRulesByBudget(budgetId: string): Promise<Rule[]> {
    const rules = await this.prisma.rule.findMany({
      where: { budgetId },
    });
    return rules.map((r) => this.toDomainRule(r));
  }

  async getAllRules(includeDisabled = false): Promise<Rule[]> {
    const rules = await this.prisma.rule.findMany({
      where: includeDisabled ? {} : { budget: { enabled: true } },
      include: { budget: true },
    });
    return rules.map((r) => this.toDomainRule(r));
  }

  async executeRulesForBudget(budgetId: string): Promise<RuleExecutionResult[]> {
    const budget = await this.prisma.budget.findUnique({ where: { id: budgetId } });
    if (!budget || !budget.enabled) {
      return [];
    }
    const rules = await this.getRulesByBudget(budgetId);
    const results: RuleExecutionResult[] = [];

    for (const rule of rules) {
      const result = await this.executeRule(rule);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  async executeRule(rule: Rule): Promise<RuleExecutionResult | null> {
    const budget = await this.prisma.budget.findUnique({ where: { id: rule.budgetId } });
    if (!budget || !budget.enabled) {
      return null;
    }
    const now = new Date();
    
    // Check if rule should be executed today
    if (!this.shouldExecuteRule(rule, now)) {
      return null;
    }

    // Get current period for the budget
    const currentPeriod = await this.getCurrentPeriod(rule.budgetId);
    if (!currentPeriod) {
      return null;
    }

    // Check if this rule has already been executed for this period (idempotency)
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        budgetId: rule.budgetId,
        periodId: currentPeriod.id,
        sourceRuleId: rule.id,
        type: TransactionType.RECURRING_RULE,
      },
    });

    if (existingTransaction) {
      return null; // Already executed for this period
    }

    // Create the transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        budgetId: rule.budgetId,
        periodId: currentPeriod.id,
        amount: rule.amount,
        date: now,
        description: rule.description,
        type: TransactionType.RECURRING_RULE,
        sourceRuleId: rule.id,
      },
    });

    // Update rule's last executed time
    await this.prisma.rule.update({
      where: { id: rule.id },
      data: { lastExecutedAt: now },
    });

    return {
      ruleId: rule.id,
      periodId: currentPeriod.id,
      transactionId: transaction.id,
      amount: rule.amount,
      executedAt: now,
    };
  }

  private shouldExecuteRule(rule: Rule, date: Date): boolean {
    // Check if rule is active (within start/end date range)
    if (date < rule.startDate) {
      return false;
    }

    if (rule.endDate && date > rule.endDate) {
      return false;
    }

    // Check if today is the execution day for this rule
    switch (rule.frequency) {
      case PeriodType.DAILY:
        return true; // Execute every day
      
      case PeriodType.MONTHLY:
        return date.getDate() === rule.executionDay;
      
      case PeriodType.YEARLY:
        return date.getMonth() + 1 === Math.floor(rule.executionDay / 100) && 
               date.getDate() === (rule.executionDay % 100);
      
      default:
        return false;
    }
  }

  private async getCurrentPeriod(budgetId: string) {
    return this.prisma.budgetPeriod.findFirst({
      where: {
        budgetId,
        status: 'OPEN',
      },
    });
  }

  async deleteRule(id: string): Promise<void> {
    await this.prisma.rule.delete({
      where: { id },
    });
  }
}
