import { DiscordBotManager } from '@/app/manager/discord-bot.manager'
import { PrismaService } from '@/prisma/prisma.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'

@Injectable()
export class DsBotServersService {
  private readonly logger = new Logger(DsBotServersService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly discordBotManager: DiscordBotManager,
  ) {}

  async getBotGuilds(botId: string, ownerId: string) {
    this.logger.log(`User ${ownerId} requested guild list for bot ${botId}`)

    const bot = await this.prisma.bot.findUnique({
      where: { id: botId },
    })

    if (!bot) {
      this.logger.warn(`Bot ${botId} not found (requested by user ${ownerId})`)
      throw new NotFoundException('Bot not found')
    }

    const guilds = await this.discordBotManager.getBotGuilds(botId)

    this.logger.log(
      `Fetched ${guilds.length} guilds for bot ${botId} (owner: ${ownerId})`,
    )

    return guilds
  }
}
