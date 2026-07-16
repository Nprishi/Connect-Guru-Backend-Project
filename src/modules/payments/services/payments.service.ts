import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Payment, PaymentDocument, PaymentStatus } from '../schema/payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createPayment(studentId: string, dto: CreatePaymentDto) {
    const student = await this.usersService.findById(studentId);

    if (!student) {
      throw new UnauthorizedException('Student not found.');
    }

    return this.paymentModel.create({
      studentId,
      teacherId: dto.teacherId,
      packageId: dto.packageId,
      amount: dto.amount,
      transactionId: dto.transactionId ?? null,
      status: PaymentStatus.PENDING,
    });
  }

  async getPaymentsForUser(userId: string) {
    return this.paymentModel
      .find({ $or: [{ studentId: userId }, { teacherId: userId }] })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    const payment = await this.paymentModel.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    payment.status = status;
    return payment.save();
  }
}
