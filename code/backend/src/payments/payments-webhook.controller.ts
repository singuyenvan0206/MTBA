import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments-webhook')
export class PaymentsWebhookController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Headers('authorization') authHeader: string,
    @Body() payload: any,
  ) {
    return this.service.handleSePayWebhook(payload, authHeader);
  }
}
