/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentStatus } from '../schema/payment.schema';
import { PaymentsService } from '../services/payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createPayment(
    @CurrentUser('sub') studentId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(studentId, createPaymentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getPaymentsForUser(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getPaymentsForUser(userId);
  }

  @Put(':paymentId/status')
  @UseGuards(JwtAuthGuard)
  updatePaymentStatus(
    @Param('paymentId') paymentId: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentsService.updatePaymentStatus(paymentId, status);
  }
}
