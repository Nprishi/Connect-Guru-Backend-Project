import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import 'multer';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current profile returned' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateProfileDto: Record<string, unknown>,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current profile returned' })
  async getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  async deleteAccount(@CurrentUser('sub') userId: string) {
    return this.usersService.deleteAccount(userId);
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiResponse({ status: 200, description: 'Settings returned' })
  async getSettings(@CurrentUser('sub') userId: string) {
    return this.usersService.getSettings(userId);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user settings' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(
    @CurrentUser('sub') userId: string,
    @Body() settings: Record<string, unknown>,
  ) {
    return this.usersService.updateSettings(userId, settings);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 201, description: 'Avatar uploaded' })
  async uploadAvatar(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: any,
  ) {
    const uploaded = await this.cloudinaryService.uploadFile(
      file,
      'connect-guru/avatars',
    );

    await this.usersService.updateAvatar(userId, uploaded.url);

    return { avatarUrl: uploaded.url };
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar removed' })
  async deleteAvatar(@CurrentUser('sub') userId: string) {
    return this.usersService.removeAvatar(userId);
  }
}
