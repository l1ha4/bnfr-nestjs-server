import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ChannelType, EmbedBuilder } from 'discord.js'
import { DiscordBotManager } from '@/app/manager/discord-bot.manager'
import { EmbedDto, SendMessageDto } from './dto/send-message.dto'

@Injectable()
export class AddMessageService {
  private readonly logger = new Logger(AddMessageService.name)

  constructor(private readonly botManager: DiscordBotManager) {}

  private buildEmbed(e: EmbedDto): EmbedBuilder {
    const embedBuilder = new EmbedBuilder()
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
    return embedBuilder
  }

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

    const hasListItems = dto.listItemsFormMessage?.length

    if (!message && !dto.embed && !hasListItems) {
      throw new BadRequestException(
        'Either message, embed, or listItemsFormMessage must be provided',
      )
    }

    if (hasListItems) {
      for (const item of dto.listItemsFormMessage!) {
        this.logger.log(
          `Sending list item | name=${item.name} type=${item.type} botId=${botId}`,
        )
        if (item.type === 'text') {
          await channel.send({ content: item.content as string })
        } else {
          const embedBuilder = this.buildEmbed(item.content as EmbedDto)
          await channel.send({ embeds: [embedBuilder] })
        }
      }
    } else {
      let embedBuilder: EmbedBuilder | undefined
      if (dto.embed) {
        embedBuilder = this.buildEmbed(dto.embed)
      }

      await channel.send({
        content: message,
        embeds: embedBuilder ? [embedBuilder] : [],
      })
    }

    this.logger.log(
      `Message sent | botId=${botId} serverId=${serverId} channelId=${channelId}`,
    )

    return { success: true }
  }
}
