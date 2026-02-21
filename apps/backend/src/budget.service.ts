import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { 
  Budget, 
  BudgetPeriod, 
  Transaction, 
  TransactionType, 
  OverflowPolicy,
  BalanceCalculation,
  BudgetWithDetails,
  CreateBudgetDto,
  CreateTransactionDto,
  UpdateBudgetDto,
  TransferFundsDto,
  PeriodType
} from '@fun-budget/domain';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, addMonths, addDays } from 'date-fns';

import { RulesService } from './rules.service';
import { PayeesService } from './payees.service';

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private rulesService: RulesService,
    private payeesService: PayeesService
  ) {}

  private toDomainBudget(b: any): Budget {
    return {
      id: b.id,
      name: b.name,
      ownerId: b.ownerId,
      currency: b.currency,
      periodType: b.periodType as any,
      overflowPolicy: b.overflowPolicy as any,
      overflowLimit: b.overflowLimit ?? undefined,
      startDate: b.startDate,
      enabled: b.enabled ?? true,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }

  private toDomainPeriod(p: any): BudgetPeriod {
    return {
      id: p.id,
      budgetId: p.budgetId,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status as 'OPEN' | 'CLOSED',
    };
  }

  private toDomainTransaction(t: any): Transaction {
    return {
      id: t.id,
      budgetId: t.budgetId,
      periodId: t.periodId ?? undefined,
      amount: t.amount,
      date: t.date,
      description: t.description,
      merchant: t.merchant ?? undefined,
      payeeId: t.payeeId ?? undefined,
      type: t.type as any,
      sourceRuleId: t.sourceRuleId ?? undefined,
      createdAt: t.createdAt,
    };
  }

  private toDomainPerson(p: any) {
    return {
      id: p.id,
      name: p.name,
      email: p.email ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async createBudget(data: CreateBudgetDto): Promise<Budget> {
    const budget = await this.prisma.budget.create({
      data: {
        name: data.name,
        ownerId: data.ownerId,
        currency: data.currency,
        periodType: data.periodType as string,
        overflowPolicy: data.overflowPolicy as string,
        overflowLimit: data.overflowPolicy === 'LIMITED' ? data.overflowLimit : undefined,
        startDate: new Date(data.startDate),
        enabled: data.enabled ?? true,
      },
    });

    // Create the first period for this budget
    const period = await this.createCurrentPeriod(budget.id);

    if (data.initialValue && data.initialValue > 0) {
      await this.prisma.transaction.create({
        data: {
          budgetId: budget.id,
          periodId: period.id,
          amount: data.initialValue,
          date: period.startDate,
          description: 'Initial budget value',
          type: 'INCOME',
        },
      });
    }

    if (data.autoAddInPeriod && data.autoAddAmount && data.autoAddAmount > 0) {
      let executionDay = 1;
      const start = period.startDate;
      if (budget.periodType === 'MONTHLY') {
        executionDay = start.getDate();
      } else if (budget.periodType === 'YEARLY') {
        executionDay = start.getDate();
      }
      await this.prisma.rule.create({
        data: {
          budgetId: budget.id,
          amount: data.autoAddAmount,
          frequency: budget.periodType,
          executionDay,
          startDate: start,
          description: 'Auto add in period',
        },
      });
    }

    return this.toDomainBudget(budget);
  }

  async updateBudget(id: string, data: UpdateBudgetDto): Promise<Budget> {
    const b = await this.prisma.budget.update({
      where: { id },
      data: {
        name: data.name,
        ownerId: data.ownerId,
        currency: data.currency,
        periodType: data.periodType as string,
        overflowPolicy: data.overflowPolicy as string,
        overflowLimit: data.overflowPolicy === 'LIMITED' ? data.overflowLimit : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        enabled: data.enabled,
      },
    });
    return this.toDomainBudget(b);
  }

  async transferFunds(data: TransferFundsDto): Promise<void> {
    const fromBudget = await this.prisma.budget.findUnique({ where: { id: data.fromBudgetId } });
    const toBudget = await this.prisma.budget.findUnique({ where: { id: data.toBudgetId } });

    if (!fromBudget || !toBudget) {
      throw new NotFoundException('Source or target budget not found');
    }

    const fromPeriod = await this.getCurrentPeriod(data.fromBudgetId);
    const toPeriod = await this.getCurrentPeriod(data.toBudgetId);

    await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          budgetId: data.fromBudgetId,
          periodId: fromPeriod?.id,
          amount: -data.amount,
          date: new Date(data.date || new Date()),
          description: data.description || `Transfer to ${toBudget.name}`,
          type: TransactionType.EXPENSE,
        },
      }),
      this.prisma.transaction.create({
        data: {
          budgetId: data.toBudgetId,
          periodId: toPeriod?.id,
          amount: data.amount,
          date: new Date(data.date || new Date()),
          description: data.description || `Transfer from ${fromBudget.name}`,
          type: TransactionType.INCOME,
        },
      }),
    ]);
  }

  async getBudgetsByOwner(ownerId: string, includeDisabled = false): Promise<BudgetWithDetails[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { ownerId, ...(includeDisabled ? {} : { enabled: true }) },
      include: {
        owner: true,
        periods: {
          where: { status: 'OPEN' },
          take: 1,
        },
      },
    });

    return Promise.all(
      budgets.map(async (b) => {
        const owner = this.toDomainPerson(b.owner);
        const currentPeriod = b.periods[0] ? this.toDomainPeriod(b.periods[0]) : undefined;
        const base = this.toDomainBudget(b);
        return {
          ...base,
          owner,
          currentPeriod,
          currentBalance: await this.calculateCurrentBalance(b.id),
        };
      })
    );
  }

  async getAllBudgets(includeDisabled = false): Promise<BudgetWithDetails[]> {
    const budgets = await this.prisma.budget.findMany({
      where: includeDisabled ? {} : { enabled: true },
      include: {
        owner: true,
        periods: {
          where: { status: 'OPEN' },
          take: 1,
        },
      },
    });
    return Promise.all(
      budgets.map(async (b) => {
        const owner = this.toDomainPerson(b.owner);
        const currentPeriod = b.periods[0] ? this.toDomainPeriod(b.periods[0]) : undefined;
        const base = this.toDomainBudget(b);
        return {
          ...base,
          owner,
          currentPeriod,
          currentBalance: await this.calculateCurrentBalance(b.id),
        };
      })
    );
  }

  async setBudgetEnabled(id: string, enabled: boolean): Promise<Budget> {
    const b = await this.prisma.budget.update({
      where: { id },
      data: { enabled },
    });
    return this.toDomainBudget(b);
  }

  async getBudgetById(id: string): Promise<BudgetWithDetails> {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        owner: true,
        periods: {
          where: { status: 'OPEN' },
          take: 1,
        },
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const owner = this.toDomainPerson(budget.owner);
    const currentPeriod = budget.periods[0] ? this.toDomainPeriod(budget.periods[0]) : undefined;
    const base = this.toDomainBudget(budget);
    return {
      ...base,
      owner,
      currentPeriod,
      currentBalance: await this.calculateCurrentBalance(budget.id),
    };
  }

  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: data.budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Get current period for this budget
    const currentPeriod = await this.getCurrentPeriod(data.budgetId);
    
    // Handle Payee
    let payeeId = undefined;
    if (data.payeeName) {
      const payee = await this.payeesService.findOrCreatePayee(data.payeeName);
      payeeId = payee.id;
    }

    if (data.installments && data.installments > 1) {
      const amountPerInstallment = data.amount / data.installments;
      const transactions = [];
      const baseDate = new Date(data.date);

      for (let i = 0; i < data.installments; i++) {
        const date = addMonths(baseDate, i);
        let periodId = undefined;
        
        // Only assign period if it falls within the current open period
        if (currentPeriod && isWithinInterval(date, { start: currentPeriod.startDate, end: currentPeriod.endDate })) {
          periodId = currentPeriod.id;
        }

        transactions.push(
          this.prisma.transaction.create({
            data: {
              budgetId: data.budgetId,
              periodId,
              amount: amountPerInstallment,
              date,
              description: `${data.description} (${i + 1}/${data.installments})`,
              type: data.type,
              merchant: data.merchant, // Kept for backward compat or if passed explicitly
              payeeId,
            },
          })
        );
      }

      const results = await this.prisma.$transaction(transactions);
      return this.toDomainTransaction(results[0]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { installments, payeeName, ...transactionData } = data;

    const t = await this.prisma.transaction.create({
      data: {
        ...transactionData,
        periodId: currentPeriod?.id,
        date: new Date(data.date),
        payeeId,
      },
    });
    return this.toDomainTransaction(t);
  }

  async deleteTransaction(budgetId: string, transactionId: string): Promise<void> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, budgetId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { id: transactionId },
    });
  }

  async getTransactions(
    budgetId: string, 
    options: { 
      startDate?: Date; 
      endDate?: Date; 
      search?: string; 
      pastOnly?: boolean; 
      limit?: number;
    } = {}
  ): Promise<Transaction[]> {
    const { startDate, endDate, search, pastOnly, limit = 100 } = options;
    const where: any = { budgetId };

    if (startDate || endDate || pastOnly) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      
      let end = endDate;
      if (pastOnly) {
        const now = new Date();
        if (!end || end > now) {
          end = now;
        }
      }

      if (end) {
        where.date.lte = end;
      }
    }

    if (search) {
      where.description = {
        contains: search,
      };
    }

    const list = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        payee: true,
      },
    });
    return list.map((t) => ({
      ...this.toDomainTransaction(t),
      payee: t.payee ? this.payeesService.toDomainPayee(t.payee) : undefined,
    }));
  }

  async calculateCurrentBalance(budgetId: string): Promise<number> {
    const transactions = await this.prisma.transaction.findMany({
      where: { 
        budgetId,
        date: { lte: new Date() } 
      },
    });

    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  async calculateBalanceForPeriod(budgetId: string, periodId: string): Promise<BalanceCalculation> {
    const period = await this.prisma.budgetPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException('Period not found');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        budgetId,
        periodId,
      },
    });

    const calculation: BalanceCalculation = {
      openingBalance: 0,
      carryover: 0,
      recurringAdditions: 0,
      manualAdditions: 0,
      expenses: 0,
      currentBalance: 0,
    };

    transactions.forEach(transaction => {
      switch (transaction.type) {
        case TransactionType.CARRYOVER:
          calculation.carryover += transaction.amount;
          break;
        case TransactionType.RECURRING_RULE:
          calculation.recurringAdditions += transaction.amount;
          break;
        case TransactionType.INCOME:
          calculation.manualAdditions += transaction.amount;
          break;
        case TransactionType.EXPENSE:
          calculation.expenses += Math.abs(transaction.amount);
          break;
      }
    });

    calculation.currentBalance = calculation.openingBalance + 
      calculation.carryover + 
      calculation.recurringAdditions + 
      calculation.manualAdditions - 
      calculation.expenses;

    return calculation;
  }

  async getCurrentPeriod(budgetId: string): Promise<BudgetPeriod | null> {
    const period = await this.prisma.budgetPeriod.findFirst({
      where: {
        budgetId,
        status: 'OPEN',
      },
    });

    if (!period) {
      return this.createCurrentPeriod(budgetId);
    }

    return this.toDomainPeriod(period);
  }

  private async createCurrentPeriod(budgetId: string, startDateOverride?: Date): Promise<BudgetPeriod> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const now = startDateOverride || new Date();
    let startDate: Date;
    let endDate: Date;

    switch (budget.periodType) {
      case 'DAILY':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'MONTHLY':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'YEARLY':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        throw new Error(`Invalid period type: ${budget.periodType}`);
    }

    // Check if a period already exists for this timeframe
    const existingPeriod = await this.prisma.budgetPeriod.findFirst({
      where: {
        budgetId,
        startDate,
        endDate,
      },
    });

    if (existingPeriod) {
      // If it exists and is closed, we might be reopening it or creating a duplicate (which is not allowed)
      // If it exists and is open, just return it
      if (existingPeriod.status === 'OPEN') {
        return this.toDomainPeriod(existingPeriod);
      }
      
      // If closed, and we are trying to create "current" period, it means we are in a time where the period is closed.
      // But usually this method is called to create the *next* period or the *first* period.
      // If we are rolling over, we want the *next* period.
      // If we are just getting current, and it's closed, maybe we should return null or create the next one?
      // For now, if we are here, let's assume we need to find the NEXT available slot if we can't create this one.
      // But wait, unique constraint failed means we tried to create a period that already exists.
      
      // If we are rolling over, we should calculate the start date based on the END date of the previous period + 1 day/ms.
      
      // If the found period is CLOSED, and we were asked to create one (implicitly for 'now'),
      // it means the 'current' real-time period is already closed.
      // We should probably find the *next* open period or create one in the future?
      // But simpler for now: if we find a closed period that matches our desired start/end dates,
      // we can't create a duplicate. We must throw or return the existing closed one (but caller expects open).
      
      // However, for rollover, we are passing a specific start date (tomorrow).
      // If THAT exists and is closed, we are in trouble (double rollover?).
      // If it exists and is OPEN, we just return it.
      
      if (existingPeriod.status === 'CLOSED') {
         // This is the tricky part. If we are trying to create a period for "Feb 2026" and it's already closed,
         // we can't just return it if the caller expects a new open period.
         // But we also can't create a second "Feb 2026".
         // Let's assume for now we just return it and let the caller handle it?
         // Or throw?
         // For rollover, if the next period is already closed, maybe we should move to the one after that?
         // That seems like a recursive edge case.
         // Let's just return it for now to avoid the unique constraint error.
         return this.toDomainPeriod(existingPeriod);
      }
    }

    const p = await this.prisma.budgetPeriod.create({
      data: {
        budgetId,
        startDate,
        endDate,
        status: 'OPEN',
      },
    });
    return this.toDomainPeriod(p);
  }

  async rolloverPeriod(budgetId: string): Promise<void> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const currentPeriod = await this.getCurrentPeriod(budgetId);
    if (!currentPeriod) {
      throw new NotFoundException('No current period found');
    }

    // Calculate closing balance
    const balanceCalc = await this.calculateBalanceForPeriod(budgetId, currentPeriod.id);
    const closingBalance = balanceCalc.currentBalance;

    // Close current period
    await this.prisma.budgetPeriod.update({
      where: { id: currentPeriod.id },
      data: { status: 'CLOSED' },
    });

    // Determine start date for the new period
    // It should be the next day after the current period ends
    const nextPeriodStartDate = addDays(currentPeriod.endDate, 1);

    // Create new period
    const newPeriod = await this.createCurrentPeriod(budgetId, nextPeriodStartDate);

    // Handle overflow based on policy
    let carryoverAmount = 0;
    
    switch (budget.overflowPolicy) {
      case OverflowPolicy.NONE:
        carryoverAmount = 0;
        break;
      case OverflowPolicy.LIMITED:
        carryoverAmount = Math.min(closingBalance, budget.overflowLimit || 0);
        break;
      case OverflowPolicy.UNLIMITED:
        carryoverAmount = closingBalance;
        break;
    }

    // Create carryover transaction if there's amount to carry over
    if (carryoverAmount > 0) {
      await this.prisma.transaction.create({
        data: {
          budgetId,
          periodId: newPeriod.id,
          amount: carryoverAmount,
          date: newPeriod.startDate,
          description: 'Carryover from previous period',
          type: TransactionType.CARRYOVER,
        },
      });
    }
    
    // Execute rules that should run on reset
    await this.rulesService.executeRulesOnPeriodReset(budgetId, newPeriod.id);
  }
}
