import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Create transporter (works even without SMTP config for development)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendAppointmentConfirmation(
    email: string,
    firstName: string,
    serviceName: string,
    startTime: Date,
    endTime: Date,
  ) {
    const subject = 'Appointment Confirmation';
    const html = this.getConfirmationTemplate(
      firstName,
      serviceName,
      startTime,
      endTime,
    );

    return this.sendEmail(email, subject, html);
  }

  async sendAppointmentCancellation(
    email: string,
    firstName: string,
    serviceName: string,
    startTime: Date,
  ) {
    const subject = 'Appointment Cancelled';
    const html = this.getCancellationTemplate(firstName, serviceName, startTime);

    return this.sendEmail(email, subject, html);
  }

  async sendAppointmentReminder(
    email: string,
    firstName: string,
    serviceName: string,
    startTime: Date,
  ) {
    const subject = 'Appointment Reminder';
    const html = this.getReminderTemplate(firstName, serviceName, startTime);

    return this.sendEmail(email, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const fromEmail =
      this.configService.get('EMAIL_FROM') || 'noreply@bookingsystem.com';

    // If SMTP is not configured, just log the email (for development)
    if (!this.configService.get('SMTP_USER') || !this.configService.get('SMTP_PASS')) {
      this.logger.log(`Email would be sent to ${to}: ${subject}`);
      this.logger.debug(`Email content: ${html}`);
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private getConfirmationTemplate(
    firstName: string,
    serviceName: string,
    startTime: Date,
    endTime: Date,
  ): string {
    const formattedDate = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedStartTime = startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const formattedEndTime = endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Your appointment has been confirmed. We look forward to seeing you!</p>
              
              <div class="info-box">
                <strong>Service:</strong> ${serviceName}<br>
                <strong>Date:</strong> ${formattedDate}<br>
                <strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime}
              </div>
              
              <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
              
              <p>Best regards,<br>Booking System Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getCancellationTemplate(
    firstName: string,
    serviceName: string,
    startTime: Date,
  ): string {
    const formattedDate = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc2626; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Your appointment has been cancelled.</p>
              
              <div class="info-box">
                <strong>Service:</strong> ${serviceName}<br>
                <strong>Date:</strong> ${formattedDate}<br>
                <strong>Time:</strong> ${formattedTime}
              </div>
              
              <p>If you would like to book a new appointment, please visit our booking system.</p>
              
              <p>Best regards,<br>Booking System Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getReminderTemplate(
    firstName: string,
    serviceName: string,
    startTime: Date,
  ): string {
    const formattedDate = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>This is a friendly reminder about your upcoming appointment.</p>
              
              <div class="info-box">
                <strong>Service:</strong> ${serviceName}<br>
                <strong>Date:</strong> ${formattedDate}<br>
                <strong>Time:</strong> ${formattedTime}
              </div>
              
              <p>We look forward to seeing you!</p>
              
              <p>Best regards,<br>Booking System Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
