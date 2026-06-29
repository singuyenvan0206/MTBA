import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { role_role_name } from '@prisma/client';
import { Role } from '../common/enums/role.enum';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';
import { SUCCESS_MESSAGES } from '../common/constants/success-messages.constant';
import { CONFIG_DEFAULTS } from '../common/constants/config.constant';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';

const otpStore = new Map<string, any>();
const resetPasswordStore = new Map<string, any>();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async login(emailOrPhone: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone },
        ],
      },
      include: { userrole: { include: { role: true } } },
    });

    const pepper = process.env.PASSWORD_PEPPER || CONFIG_DEFAULTS.PASSWORD_PEPPER;
    const isPasswordValid = user ? await bcrypt.compare(pass + pepper, user.password) : false;
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const role = user.userrole.some((ur: any) => ur.role.role_name === 'ROLE_ADMIN')
      ? 'admin'
      : 'user';


    const jwt = require('jsonwebtoken');
    const payload = { id: user.id, role: role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || CONFIG_DEFAULTS.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || CONFIG_DEFAULTS.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return {
      id: user.id,
      fullName: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: role,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token: string) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || CONFIG_DEFAULTS.JWT_REFRESH_SECRET);
      const payload = { id: decoded.id, role: decoded.role };
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET || CONFIG_DEFAULTS.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || CONFIG_DEFAULTS.JWT_REFRESH_SECRET, { expiresIn: '7d' });
      return { accessToken, refreshToken };
    } catch (e) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.REFRESH_TOKEN_INVALID);
    }
  }

  async register(data: any) {
    const { fullName, email, phone, password } = data;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.EMAIL_OR_PHONE_EXISTS);
    }

    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts.length > 1 ? nameParts[0] : fullName;
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const pepper = process.env.PASSWORD_PEPPER || CONFIG_DEFAULTS.PASSWORD_PEPPER;
    const hashedPassword = await bcrypt.hash(password + pepper, 10);
    const newUser = await this.prisma.user.create({
      data: { first_name, last_name, email, phone, password: hashedPassword },
    });

    let dbRole = await this.prisma.role.findUnique({
      where: { role_name: role_role_name.ROLE_USER },
    });
    if (!dbRole) {
      dbRole = await this.prisma.role.create({ data: { role_name: role_role_name.ROLE_USER } });
    }

    await this.prisma.userrole.create({
      data: { user_id: newUser.id, role_id: dbRole.id },
    });

    return newUser;
  }

  async sendEmailOtp(data: any) {
    const { fullName, email, phone, password } = data;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.EMAIL_OR_PHONE_EXISTS_ALT);
    }

    const otp = generateOTP();

    const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || CONFIG_DEFAULTS.OTP_EXPIRES_MINUTES, 10);

    try {
      await getTransporter().sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Mã xác thực Đăng ký tài khoản (OTP)',
        html: `<h3>Xin chào ${fullName},</h3>
               <p>Mã xác thực (OTP) của bạn là: <b style="font-size:24px; color:red;">${otp}</b></p>
               <p>Mã này có hiệu lực trong ${expiresMinutes} phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>`,
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(ERROR_MESSAGES.AUTH.MAIL_SEND_ERROR);
    }

    otpStore.set(email, {
      userData: { fullName, email, phone, password },
      otp,
      expiresAt: Date.now() + expiresMinutes * 60 * 1000,
    });

    return { message: SUCCESS_MESSAGES.AUTH.OTP_SENT };
  }

  async verifyEmailOtp(body: any) {
    const { email, otp } = body;
    const record = otpStore.get(email);

    if (!record) throw new BadRequestException(ERROR_MESSAGES.AUTH.OTP_NOT_FOUND_OR_EXPIRED);
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      throw new BadRequestException(ERROR_MESSAGES.AUTH.OTP_EXPIRED);
    }
    if (record.otp !== otp) throw new BadRequestException(ERROR_MESSAGES.AUTH.OTP_INVALID);

    const user = await this.register(record.userData);
    otpStore.delete(email);
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.EMAIL_NOT_FOUND);
    }

    const otp = generateOTP();
    const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES || CONFIG_DEFAULTS.OTP_EXPIRES_MINUTES, 10);

    try {
      await getTransporter().sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Mã khôi phục mật khẩu (OTP)',
        html: `<h3>Xin chào ${user.first_name} ${user.last_name},</h3>
               <p>Bạn đã yêu cầu khôi phục mật khẩu. Mã xác thực (OTP) của bạn là: <b style="font-size:24px; color:red;">${otp}</b></p>
               <p>Mã này có hiệu lực trong ${expiresMinutes} phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>`,
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException(ERROR_MESSAGES.AUTH.PASSWORD_RESET_MAIL_ERROR);
    }

    resetPasswordStore.set(email, {
      otp,
      expiresAt: Date.now() + expiresMinutes * 60 * 1000,
    });

    return { message: SUCCESS_MESSAGES.AUTH.PASSWORD_RESET_OTP_SENT };
  }

  async resetPassword(body: any) {
    const { email, otp, newPassword } = body;

    const record = resetPasswordStore.get(email);
    if (!record) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.PASSWORD_RESET_NOT_FOUND_OR_EXPIRED);
    }

    if (Date.now() > record.expiresAt) {
      resetPasswordStore.delete(email);
      throw new BadRequestException(ERROR_MESSAGES.AUTH.PASSWORD_RESET_OTP_EXPIRED);
    }

    if (record.otp !== otp) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.OTP_INVALID);
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.USER_NOT_FOUND);
    }

    const pepper = process.env.PASSWORD_PEPPER || CONFIG_DEFAULTS.PASSWORD_PEPPER;
    const isSameAsOld = await bcrypt.compare(newPassword + pepper, user.password);
    if (isSameAsOld) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.PASSWORD_SAME_AS_OLD);
    }

    const hashedPassword = await bcrypt.hash(newPassword + pepper, 10);

    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    resetPasswordStore.delete(email);

    return { message: SUCCESS_MESSAGES.AUTH.PASSWORD_CHANGED };
  }
}
