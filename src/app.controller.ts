import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Publico } from './common/decorators/publico.decorator';

/** Endpoint de salud (health check), sin versión para monitorización. */
@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class AppController {
  @Publico()
  @Get()
  @ApiOperation({ summary: 'Estado del servicio' })
  check() {
    return {
      status: 'ok',
      service: 'DailyFoodAPI',
      timestamp: new Date().toISOString(),
    };
  }
}
