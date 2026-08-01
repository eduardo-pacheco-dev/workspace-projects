import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createCreditCardSchema,
  updateCreditCardSchema,
} from './schemas/finance.schemas';
import {
  CreditCardsService,
  CreditCardQuery,
} from './credit-cards.service';

@Controller('finance/cards')
export class CreditCardsController {
  constructor(private readonly cardsService: CreditCardsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createCreditCardSchema))
    dto: Parameters<CreditCardsService['create']>[0],
  ) {
    return this.cardsService.create(dto);
  }

  @Get()
  findAll(@Query() query: CreditCardQuery) {
    return this.cardsService.findAll(query);
  }

  @Get('all')
  findAllCards() {
    return this.cardsService.findAllCards();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.cardsService.findById(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCreditCardSchema))
    dto: Parameters<CreditCardsService['update']>[1],
  ) {
    return this.cardsService.update(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.cardsService.delete(Number(id));
  }
}
