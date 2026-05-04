import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ChannelType, EmbedBuilder } from 'discord.js'
import { DiscordBotManager } from '@/app/manager/discord-bot.manager'
import { SendMessageDto } from './dto/send-message.dto'

@Injectable()
export class AddMessageService {
  private readonly logger = new Logger(AddMessageService.name)

  constructor(private readonly botManager: DiscordBotManager) {}

  async sendMessage(dto: SendMessageDto): Promise<{ success: boolean }> {
    const { botId, serverId, channelId, message } = dto

    this.logger.log(
      `Sending message | botId=${botId} serverId=${serverId} channelId=${channelId}`,
    )

    const client = this.botManager.getClient(botId)

    if (!client) {
      this.logger.warn(`Bot not running | botId=${botId}`)
      throw new NotFoundException(`Bot ${botId} is not running`)
    }

    const channel = await client.channels.fetch(channelId).catch(() => null)

    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} not found`)
    }

    if (channel.type !== ChannelType.GuildText) {
      throw new BadRequestException(
        `Channel ${channelId} is not a text channel`,
      )
    }

    const guild = await client.guilds.fetch(serverId).catch(() => null)

    if (!guild) {
      throw new NotFoundException(`Server ${serverId} not found`)
    }

    if (!message && !dto.embed) {
      throw new BadRequestException('Either message or embed must be provided')
    }

    let embedBuilder: EmbedBuilder | undefined
    if (dto.embed) {
      const e = dto.embed
      embedBuilder = new EmbedBuilder()
      if (e.title) embedBuilder.setTitle(e.title)
      if (e.description) embedBuilder.setDescription(e.description)
      if (e.url) embedBuilder.setURL(e.url)
      if (e.color !== undefined) embedBuilder.setColor(e.color)
      if (e.footer) embedBuilder.setFooter({ text: e.footer })
      if (e.image) embedBuilder.setImage(e.image)
      if (e.thumbnail) embedBuilder.setThumbnail(e.thumbnail)
      if (e.author)
        embedBuilder.setAuthor({ name: e.author, iconURL: e.authorIconUrl })
      if (e.fields?.length) embedBuilder.addFields(e.fields)
    }

    await channel.send({
      content: message,
      embeds: embedBuilder ? [embedBuilder] : [],
    })

    this.logger.log(
      `Message sent | botId=${botId} serverId=${serverId} channelId=${channelId}`,
    )

    return { success: true }
  }
}
