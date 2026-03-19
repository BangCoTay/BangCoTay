import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout')
  async createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    return this.paymentsService.createCheckout(user.id, createCheckoutDto);
  }

  @Get('portal')
  async getPortal(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.getPortal(user.id);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!request.rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    return this.paymentsService.handleWebhook(signature, request.rawBody);
  }
}
