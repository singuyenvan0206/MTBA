import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PosService } from './pos.service';
import { CONFIG_DEFAULTS } from '../common/constants/config.constant';

@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  /** Staff ghi state mới */
  @Post('sync')
  syncState(@Query('session') sessionId: string, @Body() state: any) {
    return this.posService.syncState(sessionId || CONFIG_DEFAULTS.POS_DEFAULT_SESSION_ID, state);
  }

  /** Customer polling để lấy state mới nhất */
  @Get('sync')
  getState(@Query('session') sessionId: string) {
    return this.posService.getState(sessionId || CONFIG_DEFAULTS.POS_DEFAULT_SESSION_ID);
  }
}
