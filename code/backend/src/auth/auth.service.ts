import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';

const otpStore = new Map<string, any>();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    const pepper = process.env.PASSWORD_PEPPER || '';
    const isPasswordValid = user ? await bcrypt.compare(pass + pepper, user.password) : false;
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    const role = user.userrole.some((ur: any) => ur.role.role_name === 'ROLE_ADMIN')
      ? 'admin'
      : 'user';

    return {
      id: user.id,
      fullName: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: role,
    };
  }

  async register(data: any) {
    const { fullName, email, phone, password } = data;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      throw new BadRequestException('Email hoặc SĐT đã được sử dụng!');
    }

    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts.length > 1 ? nameParts[0] : fullName;
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const pepper = process.env.PASSWORD_PEPPER || '';
    const hashedPassword = await bcrypt.hash(password + pepper, 10);
    const newUser = await this.prisma.user.create({
      data: { first_name, last_name, email, phone, password: hashedPassword },
    });

    let dbRole = await this.prisma.role.findUnique({
      where: { role_name: 'ROLE_USER' },
    });
    if (!dbRole) {
      dbRole = await this.prisma.role.create({ data: { role_name: 'ROLE_USER' } });
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
      throw new BadRequestException('Email hoặc Số điện thoại đã được sử dụng!');
    }

    const otp = generateOTP();

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Mã xác thực Đăng ký tài khoản (OTP)',
        html: `<h3>Xin chào ${fullName},</h3>
               <p>Mã xác thực (OTP) của bạn là: <b style="font-size:24px; color:red;">${otp}</b></p>
               <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>`,
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Lỗi khi gửi mail.');
    }

    otpStore.set(email, {
      userData: { fullName, email, phone, password },
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return { message: 'Đã gửi OTP qua Email' };
  }

  async verifyEmailOtp(body: any) {
    const { email, otp } = body;
    const record = otpStore.get(email);

    if (!record) throw new BadRequestException('OTP không tồn tại hoặc đã hết hạn!');
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      throw new BadRequestException('Mã OTP đã hết hạn!');
    }
    if (record.otp !== otp) throw new BadRequestException('Mã OTP không chính xác!');

    const user = await this.register(record.userData);
    otpStore.delete(email);
    return user;
  }
}
