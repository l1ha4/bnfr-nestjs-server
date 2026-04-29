import { PrismaService } from '@/prisma/prisma.service'
import { TokenCryptoService } from '@/libs/common/crypto/token-crypto.service'
import { DiscordBotManager } from '@/app/manager/discord-bot.manager'
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { Client, GatewayIntentBits } from 'discord.js'
import { BotStatus } from 'generated__/enums'

@Injectable()
export class DsBotService implements OnModuleInit {
  private readonly logger = new Logger(DsBotService.name)
  private readonly publicBotSelect = {
    id: true,
    name: true,
    avatar: true,
    banner: true,
    status: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenCryptoService: TokenCryptoService,
    private readonly discordBotManager: DiscordBotManager,
  ) {}

  async onModuleInit(): Promise<void> {
    const bots = await this.prisma.bot.findMany()

    if (!bots.length) {
      this.logger.log('База данных ботов пуста, запускать ничего')
      return
    }

    for (const bot of bots) {
      try {
        const token = this.getRuntimeToken(bot.id, bot.token)
        await this.startBot(bot.id, token)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.error(`Не удалось запустить бота ${bot.name}: ${message}`)
      }
    }
  }

  async findAllByOwner(ownerId: string) {
    return this.prisma.bot.findMany({
      where: { ownerId },
      select: this.publicBotSelect,
    })
  }

  async findById(id: string) {
    return this.prisma.bot.findUnique({
      where: { id },
      select: this.publicBotSelect,
    })
  }

  async startBot(botId: string, token: string) {
    try {
      if (this.discordBotManager.isRunning(botId)) {
        this.logger.log(`Бот ${botId} уже запущен`)
        return this.discordBotManager.getClient(botId)
      }

      const client = await this.discordBotManager.startBot(botId, token)
      await this.prisma.bot.update({
        where: { id: botId },
        data: { status: BotStatus.ACTIVE },
      })
      this.logger.log(`Бот ${botId} успешно запущен`)

      return client
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await this.prisma.bot
        .update({
          where: { id: botId },
          data: { status: BotStatus.ERROR },
        })
        .catch(() => null)
      this.logger.error(`Ошибка запуска бота ${botId}: ${message}`)
      throw error
    }
  }

  async stopBot(botId: string) {
    try {
      const client = this.discordBotManager.getClient(botId)

      if (!client) {
        this.logger.warn(`Бот ${botId} не запущен, останавливать нечего`)
        return
      }

      await this.discordBotManager.stopBot(botId)
      await this.prisma.bot.update({
        where: { id: botId },
        data: { status: BotStatus.STOPPED },
      })
      this.logger.log(`Бот ${botId} успешно остановлен`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`Ошибка остановки бота ${botId}: ${message}`)
      throw error
    }
  }

  async create(data: { token: string; ownerId: string }) {
    const profile = await this.fetchBotProfile(data.token)
    const encryptedToken = this.tokenCryptoService.encrypt(data.token)

    const createdBot = await this.prisma.bot.create({
      data: {
        name: profile.name,
        avatar: profile.avatar,
        banner: profile.banner,
        token: encryptedToken,
        ownerId: data.ownerId,
      },
      select: this.publicBotSelect,
    })

    this.startBot(createdBot.id, data.token).catch((error) => {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(
        `Не удалось запустить бота ${createdBot.id} после создания: ${message}`,
      )
    })

    return createdBot
  }

  async remove(botId: string, ownerId: string) {
    const bot = await this.prisma.bot.findUnique({
      where: { id: botId },
      select: { id: true, name: true, ownerId: true },
    })

    if (!bot) {
      throw new NotFoundException('Бот не найден')
    }

    if (bot.ownerId !== ownerId) {
      throw new ForbiddenException('Нельзя удалить чужого бота')
    }

    await this.stopBot(botId).catch(() => null)

    const deletedBot = await this.prisma.bot.delete({
      where: { id: botId },
      select: this.publicBotSelect,
    })

    this.logger.log(`Бот ${bot.name} (${botId}) успешно удален`)

    return deletedBot
  }

  private getRuntimeToken(botId: string, storedToken: string): string {
    try {
      return this.tokenCryptoService.decrypt(storedToken)
    } catch {
      this.logger.warn(
        `Не удалось расшифровать токен бота ${botId}, используется исходное значение`,
      )
      return storedToken
    }
  }

  private async fetchBotProfile(token: string): Promise<{
    name: string
    avatar: string | null
    banner: string | null
  }> {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds],
    })

    try {
      await client.login(token)

      const me = await client.user?.fetch(true)
      if (!me) {
        throw new Error('Не удалось получить профиль бота из Discord')
      }

      return {
        name: me.username,
        avatar: me.displayAvatarURL({ size: 1024 }),
        banner: me.bannerURL({ size: 1024 }) ?? null,
      }
    } finally {
      client.destroy()
    }
  }
}
