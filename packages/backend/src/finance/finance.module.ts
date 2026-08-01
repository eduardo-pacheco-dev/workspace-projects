import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceEntry } from './finance-entry.entity';
import { SpendingLimit } from './spending-limit.entity';
import { BankAccount } from './bank-account.entity';
import { FinanceService } from './finance.service';
import { FinanceLimitsService } from './finance-limits.service';
import { FinanceReportsService } from './finance-reports.service';
import { BankAccountsService } from './bank-accounts.service';
import { FinanceController } from './finance.controller';
import { FinanceLimitsController } from './finance-limits.controller';
import { FinanceReportsController } from './finance-reports.controller';
import { BankAccountsController } from './bank-accounts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceEntry, SpendingLimit, BankAccount])],
  providers: [FinanceService, FinanceLimitsService, FinanceReportsService, BankAccountsService],
  controllers: [
    FinanceController,
    FinanceLimitsController,
    FinanceReportsController,
    BankAccountsController,
  ],
  exports: [FinanceService, FinanceLimitsService, FinanceReportsService, BankAccountsService],
})
export class FinanceModule {}
