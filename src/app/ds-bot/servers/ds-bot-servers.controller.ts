import { Controller, Get, Param } from '@nestjs/common'
import { DsBotServersService } from './ds-bot-servers.service'
import { Authorization } from '@/auth/decorators/auth.decorators'
import { Authorized } from '@/auth/decorators/authorized.decorators'

@Controller('ds-bot/servers')
export class DsBotServersController {
  constructor(private readonly dsBotServersService: DsBotServersService) {}

  @Authorization()
  @Get(':botId')
  async getBotGuilds(
    @Param('botId') botId: string,
    @Authorized('id') userId: string,
  ) {
    return this.dsBotServersService.getBotGuilds(botId, userId)
  }
}
