import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceEntry } from './finance-entry.entity';
import { SpendingLimit } from './spending-limit.entity';
import { FinanceService } from './finance.service';
import { FinanceLimitsService } from './finance-limits.service';
import { FinanceReportsService } from './finance-reports.service';
import { FinanceController } from './finance.controller';
import { FinanceLimitsController } from './finance-limits.controller';
import { FinanceReportsController } from './finance-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceEntry, SpendingLimit])],
  providers: [FinanceService, FinanceLimitsService, FinanceReportsService],
  controllers: [FinanceController, FinanceLimitsController, FinanceReportsController],
  exports: [FinanceService, FinanceLimitsService, FinanceReportsService],
})
export class FinanceModule {}
