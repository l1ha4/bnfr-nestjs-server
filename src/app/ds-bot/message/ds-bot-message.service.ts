import { TokenCryptoService } from '@/libs/common/crypto/token-crypto.service'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Client, GatewayIntentBits } from 'discord.js'
import { BotMessageStatus } from 'generated__/enums'
import { SendMessageDto } from './dto/send-message.dto'

@Injectable()
export class DsBotMessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenCryptoService: TokenCryptoService,
  ) {}

  private readonly messageSelect = {
    id: true,
    botId: true,
    channelId: true,
    guildId: true,
    content: true,
    externalMessageId: true,
    status: true,
    errorMessage: true,
    createdAt: true,
    updatedAt: true,
  }

  async send(ownerId: string, dto: SendMessageDto) {
    const bot = await this.prisma.bot.findUnique({
      where: { id: dto.botId },
      select: { id: true, ownerId: true, token: true },
    })

    if (!bot) {
      throw new NotFoundException('Бот не найден')
    }

    if (bot.ownerId !== ownerId) {
      throw new ForbiddenException('Нельзя отправлять сообщения чужим ботом')
    }

    const runtimeToken = this.getRuntimeToken(bot.id, bot.token)
    const client = new Client({
      intents: [GatewayIntentBits.Guilds],
    })

    try {
      await client.login(runtimeToken)

      const channel = await client.channels.fetch(dto.channelId)
      if (!channel || !channel.isTextBased() || !('send' in channel)) {
        throw new BadRequestException(
          'Указанный канал не поддерживает отправку сообщений',
        )
      }

      const sent = await channel.send(dto.content)

      return this.prisma.botMessage.create({
        data: {
          botId: bot.id,
          channelId: dto.channelId,
          guildId:
            dto.guildId ??
            ('guildId' in channel ? (channel.guildId ?? null) : null),
          content: dto.content,
          externalMessageId: sent.id,
          status: BotMessageStatus.SENT,
        },
        select: this.messageSelect,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка'

      await this.prisma.botMessage.create({
        data: {
          botId: bot.id,
          channelId: dto.channelId,
          guildId: dto.guildId ?? null,
          content: dto.content,
          externalMessageId: 'FAILED',
          status: BotMessageStatus.FAILED,
          errorMessage: message,
        },
      })

      throw new BadRequestException(
        `Не удалось отправить сообщение: ${message}`,
      )
    } finally {
      client.destroy()
    }
  }

  async findAllByBot(ownerId: string, botId: string) {
    const bot = await this.prisma.bot.findUnique({
      where: { id: botId },
      select: { id: true, ownerId: true },
    })

    if (!bot) {
      throw new NotFoundException('Бот не найден')
    }

    if (bot.ownerId !== ownerId) {
      throw new ForbiddenException('Нельзя просматривать сообщения чужого бота')
    }

    return this.prisma.botMessage.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
      select: this.messageSelect,
    })
  }

  private getRuntimeToken(botId: string, storedToken: string): string {
    try {
      return this.tokenCryptoService.decrypt(storedToken)
    } catch {
      return storedToken
    }
  }
}
