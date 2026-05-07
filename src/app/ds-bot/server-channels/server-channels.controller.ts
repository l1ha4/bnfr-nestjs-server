import { Authorization } from '@/auth/decorators/auth.decorators'
import { Authorized } from '@/auth/decorators/authorized.decorators'
import { Controller, Get, Logger, Param } from '@nestjs/common'
import { ServerChannelsService } from './server-channels.service'

@Controller('ds-bot/server-channels')
export class ServerChannelsController {
  private readonly logger = new Logger(ServerChannelsController.name)

  constructor(private readonly serverChannelsService: ServerChannelsService) {}

  @Authorization()
  @Get(':botId/:serverId')
  async getServerTextChannels(
    @Param('botId') botId: string,
    @Param('serverId') serverId: string,
    @Authorized('id') userId: string,
  ) {
    this.logger.log(
      `HTTP GET /ds-bot/server-channels/${botId}/${serverId} requested by user ${userId}`,
    )

    return this.serverChannelsService.getServerTextChannels(
      botId,
      serverId,
      userId,
    )
  }
}
