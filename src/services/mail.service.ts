// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/configuration';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    // { infer: true } tells TypeScript to automatically figure out the type instead of you having to specify it manually.
    const mailConfig = this.configService.get('mail', { infer: true })!;
    
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const mailConfig = this.configService.get('mail', { infer: true })!;
    const resetLink = `http://yourapp.com/reset-password?token=${token}`;
    const mailOptions = {
      from: mailConfig.user,
      to: 'bhanukalakshitha22@gmail.com',
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}