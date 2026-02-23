import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { BudgetService } from './budget.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly budgetService: BudgetService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily_rollover',
  })
  async handleDailyRollover() {
    this.logger.debug('Running daily rollover check...');

    const now = new Date();
    // Find all budgets with an OPEN period that has ended before today
    // Note: We use 'lt' (less than) now. Since 'now' is midnight (start of day), 
    // any period ending yesterday or earlier will be picked up.
    // However, if endDate is set to end of day (e.g. 23:59:59), we need to be careful.
    // The budget service sets endDate to endOfDay.
    // So if today is Feb 1st 00:00:00.
    // Jan 31st period ends Jan 31st 23:59:59.999.
    // Jan 31st 23:59:59 < Feb 1st 00:00:00 is TRUE.
    // So this logic is correct.

    const budgetsToRollover = await this.prisma.budgetPeriod.findMany({
      where: {
        status: 'OPEN',
        endDate: {
          lt: now,
        },
      },
      include: {
        budget: true,
      },
    });

    if (budgetsToRollover.length > 0) {
      this.logger.log(`Found ${budgetsToRollover.length} budgets to rollover.`);
    }

    for (const period of budgetsToRollover) {
      // Skip if budget is disabled, though maybe we should still close the period? 
      // Assuming we only process enabled budgets for now to avoid side effects.
      if (!period.budget.enabled) continue;
      
      try {
        this.logger.log(`Rolling over budget ${period.budget.name} (${period.budgetId})`);
        await this.budgetService.rolloverPeriod(period.budgetId);
      } catch (error) {
        this.logger.error(`Failed to rollover budget ${period.budgetId}: ${error.message}`);
      }
    }
  }
}
