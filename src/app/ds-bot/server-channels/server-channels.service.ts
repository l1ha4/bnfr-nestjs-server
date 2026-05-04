import { DiscordBotManager } from '@/app/manager/discord-bot.manager'
import { PrismaService } from '@/prisma/prisma.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'

@Injectable()
export class ServerChannelsService {
  private readonly logger = new Logger(ServerChannelsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly discordBotManager: DiscordBotManager,
  ) {}

  async getServerTextChannels(
    botId: string,
    serverId: string,
    ownerId: string,
  ) {
    this.logger.log(
      `User ${ownerId} requested text channels for server ${serverId} and bot ${botId}`,
    )

    try {
      const bot = await this.prisma.bot.findUnique({
        where: { id: botId },
      })

      if (!bot) {
        this.logger.warn(`Bot ${botId} not found (requested by user ${ownerId})`)
        throw new NotFoundException('Bot not found')
      }

      const channels = await this.discordBotManager.getGuildTextChannels(
        botId,
        serverId,
      )

      this.logger.log(
        `Fetched ${channels.length} text channels for server ${serverId} and bot ${botId} (owner: ${ownerId})`,
      )

      return channels
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(
        `Failed to get text channels for server ${serverId} and bot ${botId} (owner: ${ownerId}): ${message}`,
      )
      throw error
    }
  }
}
