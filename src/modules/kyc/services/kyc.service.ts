import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { ReviewKycDto, SubmitKycDto } from '../dto/submit-kyc.dto';
import { Kyc, KycDocument, KycStatus } from '../schema/kyc.schema';

@Injectable()
export class KycService {
  constructor(
    @InjectModel(Kyc.name) private readonly kycModel: Model<KycDocument>,
    private readonly usersService: UsersService,
  ) {}

  async submitKyc(userId: string, dto: SubmitKycDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const existing = await this.kycModel.findOne({ userId });

    if (existing) {
      return this.kycModel.findOneAndUpdate(
        { userId },
        { $set: dto },
        { new: true },
      );
    }

    return this.kycModel.create({ userId, ...dto, status: KycStatus.PENDING });
  }

  async getKycForUser(userId: string) {
    return this.kycModel.findOne({ userId }).exec();
  }

  async getAllKyc() {
    return this.kycModel.find().exec();
  }

  async reviewKyc(kycId: string, dto: ReviewKycDto) {
    const kyc = await this.kycModel.findById(kycId);

    if (!kyc) {
      throw new NotFoundException('KYC record not found.');
    }

    kyc.status = dto.status as KycStatus;
    kyc.adminNote = dto.adminNote ?? null;
    return kyc.save();
  }
}
