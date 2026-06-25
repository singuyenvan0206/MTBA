import { Injectable } from '@nestjs/common';

@Injectable()
export class PosService {
  // Trạm trung chuyển lưu trữ trên RAM
  private syncStore: Record<string, any> = {};

  syncState(sessionId: string, state: any) {
    this.syncStore[sessionId] = { ...this.syncStore[sessionId], ...state, timestamp: Date.now() };
    return { success: true };
  }

  getState(sessionId: string) {
    return this.syncStore[sessionId] || {};
  }
}
