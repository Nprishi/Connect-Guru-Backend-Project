import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { ReviewKycDto, SubmitKycDto } from '../dto/submit-kyc.dto';
import { KycService } from '../services/kyc.service';

@Controller('kyc')
export class KycController {
  constructor(
    private readonly kycService: KycService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  submitKyc(
    @CurrentUser('sub') userId: string,
    @Body() submitKycDto: SubmitKycDto,
  ) {
    return this.kycService.submitKyc(userId, submitKycDto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadKycDocument(@UploadedFile() file: any) {
    const uploaded = await this.cloudinaryService.uploadFile(
      file,
      'connect-guru/kyc',
    );

    return { documentUrl: uploaded.url };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getKycForUser(@CurrentUser('sub') userId: string) {
    return this.kycService.getKycForUser(userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  getAllKyc() {
    return this.kycService.getAllKyc();
  }

  @Put(':kycId/review')
  @UseGuards(JwtAuthGuard)
  reviewKyc(@Param('kycId') kycId: string, @Body() reviewKycDto: ReviewKycDto) {
    return this.kycService.reviewKyc(kycId, reviewKycDto);
  }
}
