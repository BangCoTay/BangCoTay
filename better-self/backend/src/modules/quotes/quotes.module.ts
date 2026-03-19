import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { QuoteGeneratorService } from './quote-generator.service';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, QuoteGeneratorService],
  exports: [QuotesService, QuoteGeneratorService],
})
export class QuotesModule {}
