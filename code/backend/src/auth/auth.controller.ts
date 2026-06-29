import { Controller, Post, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '../common/enums/role.enum';
import { SUCCESS_MESSAGES } from '../common/constants/success-messages.constant';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- CÁC ENDPOINT TEST MIDDLEWARE ---
  @Get('test-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Chỉ admin mới được vào
  testAdmin() {
    return { message: SUCCESS_MESSAGES.AUTH.TEST_ADMIN };
  }

  @Get('test-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN) // Ai đăng nhập (user hoặc admin) cũng được vào
  testUser() {
    return { message: SUCCESS_MESSAGES.AUTH.TEST_USER };
  }
  // ------------------------------------

  @Post('login')
  login(@Body() body: { emailOrPhone: string; password: string }) {
    return this.authService.login(body.emailOrPhone, body.password);
  }

  @Post('refresh-token')
  refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.REFRESH_TOKEN_REQUIRED);
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
