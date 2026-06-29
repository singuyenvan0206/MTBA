import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';
import { CONFIG_DEFAULTS } from '../common/constants/config.constant';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.TOKEN_NOT_FOUND);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || CONFIG_DEFAULTS.JWT_SECRET);
      request.user = decoded; // { id: 1, role: Role.ADMIN, iat: ..., exp: ... }
      return true;
    } catch (e) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.TOKEN_INVALID_OR_EXPIRED);
    }
  }
}
