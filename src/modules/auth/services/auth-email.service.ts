import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class AuthEmailService {
  private readonly logger = new Logger(AuthEmailService.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendVerificationOtp(email: string, otp: string) {
    const from = this.configService.get<string>('RESEND_FROM_EMAIL');

    try {
      const result = await this.resend.emails.send({
        from: from ?? 'onboarding@resend.dev',
        to: [email],
        subject: 'Connect Guru Email Verification',
        html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
      });

      this.logger.log(`Verification email sent to ${email}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }
}
