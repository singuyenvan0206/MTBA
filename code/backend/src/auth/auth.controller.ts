import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { emailOrPhone: string; password: string }) {
    return this.authService.login(body.emailOrPhone, body.password);
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
}
