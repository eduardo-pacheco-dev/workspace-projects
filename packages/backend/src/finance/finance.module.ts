import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceEntry } from './finance-entry.entity';
import { SpendingLimit } from './spending-limit.entity';
import { BankAccount } from './bank-account.entity';
import { CreditCard } from './credit-card.entity';
import { Category } from './category.entity';
import { FinanceService } from './finance.service';
import { FinanceLimitsService } from './finance-limits.service';
import { FinanceReportsService } from './finance-reports.service';
import { BankAccountsService } from './bank-accounts.service';
import { CreditCardsService } from './credit-cards.service';
import { FinanceCategoriesService } from './finance-categories.service';
import { FinanceController } from './finance.controller';
import { FinanceLimitsController } from './finance-limits.controller';
import { FinanceReportsController } from './finance-reports.controller';
import { BankAccountsController } from './bank-accounts.controller';
import { CreditCardsController } from './credit-cards.controller';
import { FinanceCategoriesController } from './finance-categories.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinanceEntry,
      SpendingLimit,
      BankAccount,
      CreditCard,
      Category,
    ]),
  ],
  providers: [
    FinanceService,
    FinanceLimitsService,
    FinanceReportsService,
    BankAccountsService,
    CreditCardsService,
    FinanceCategoriesService,
  ],
  controllers: [
    FinanceController,
    FinanceLimitsController,
    FinanceReportsController,
    BankAccountsController,
    CreditCardsController,
    FinanceCategoriesController,
  ],
  exports: [
    FinanceService,
    FinanceLimitsService,
    FinanceReportsService,
    BankAccountsService,
    CreditCardsService,
    FinanceCategoriesService,
  ],
})
export class FinanceModule {}
