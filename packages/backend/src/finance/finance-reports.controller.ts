import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { FinanceReportsService } from './finance-reports.service';

@Controller('finance/reports')
export class FinanceReportsController {
  constructor(private readonly financeReportsService: FinanceReportsService) {}

  @Get('summary')
  async summary(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.financeReportsService.summary(month, year);
  }

  @Get('by-category')
  async byCategory(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.financeReportsService.byCategory(month, year);
  }

  @Get('limits')
  async limits(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.financeReportsService.limits(month, year);
  }
}
