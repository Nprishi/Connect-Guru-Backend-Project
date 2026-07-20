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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentStatus } from '../schema/payment.schema';
import { PaymentsService } from '../services/payments.service';

@ApiTags('Payments')
@ApiBearerAuth('JWT')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a payment record' })
  @ApiBody({
    schema: {
      example: {
        teacherId: '64df2a9f0db4ae12b7f0f123',
        packageId: '64df2a9f0db4ae12b7f0f456',
        amount: 8500,
        transactionId: 'txn_123456789',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Payment created' })
  createPayment(
    @CurrentUser('sub') studentId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(studentId, createPaymentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'Payments returned' })
  getPaymentsForUser(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getPaymentsForUser(userId);
  }

  @Put(':paymentId/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update payment status' })
  @ApiBody({
    schema: {
      example: {
        status: 'completed',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  updatePaymentStatus(
    @Param('paymentId') paymentId: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentsService.updatePaymentStatus(paymentId, status);
  }
}
