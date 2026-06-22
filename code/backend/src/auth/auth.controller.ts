import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { emailOrPhone: string; password: string }) {
    return this.authService.login(body.emailOrPhone, body.password);
  }

  @Post('refresh-token')
  refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new Error('Refresh token is required');
    }
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('firebase-success')
  firebaseSuccess(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('send-email-otp')
  sendEmailOtp(@Body() body: any) {
    return this.authService.sendEmailOtp(body);
  }

  @Post('verify-email-otp')
  verifyEmailOtp(@Body() body: any) {
    return this.authService.verifyEmailOtp(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }
}
