import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- CÁC ENDPOINT TEST MIDDLEWARE ---
  @Get('test-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Chỉ admin mới được vào
  testAdmin() {
    return { message: 'Chúc mừng! Bạn đã lọt qua vòng bảo vệ với tư cách là ADMIN.' };
  }

  @Get('test-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin') // Ai đăng nhập (user hoặc admin) cũng được vào
  testUser() {
    return { message: 'Thành công! Bạn đã gọi được API với tư cách là USER (Khách hàng).' };
  }
  // ------------------------------------

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
