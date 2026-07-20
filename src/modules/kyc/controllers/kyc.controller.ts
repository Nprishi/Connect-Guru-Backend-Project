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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { ReviewKycDto, SubmitKycDto } from '../dto/submit-kyc.dto';
import { KycService } from '../services/kyc.service';

@ApiTags('KYC')
@ApiBearerAuth('JWT')
@Controller('kyc')
export class KycController {
  constructor(
    private readonly kycService: KycService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit KYC information' })
  @ApiBody({
    schema: {
      example: {
        documentType: 'citizenship',
        documentUrl: 'https://res.cloudinary.com/demo/kyc/citizenship.jpg',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'KYC submitted' })
  submitKyc(
    @CurrentUser('sub') userId: string,
    @Body() submitKycDto: SubmitKycDto,
  ) {
    return this.kycService.submitKyc(userId, submitKycDto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a KYC document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  async uploadKycDocument(@UploadedFile() file: any) {
    const uploaded = await this.cloudinaryService.uploadFile(
      file,
      'connect-guru/kyc',
    );

    return { documentUrl: uploaded.url };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user KYC record' })
  @ApiResponse({ status: 200, description: 'KYC record returned' })
  getKycForUser(@CurrentUser('sub') userId: string) {
    return this.kycService.getKycForUser(userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all KYC records for admin' })
  @ApiResponse({ status: 200, description: 'KYC list returned' })
  getAllKyc() {
    return this.kycService.getAllKyc();
  }

  @Put(':kycId/review')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Review a KYC submission' })
  @ApiBody({
    schema: {
      example: {
        status: 'approved',
        adminNote: 'Verified successfully',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'KYC reviewed' })
  reviewKyc(@Param('kycId') kycId: string, @Body() reviewKycDto: ReviewKycDto) {
    return this.kycService.reviewKyc(kycId, reviewKycDto);
  }
}
