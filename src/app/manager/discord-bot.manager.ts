// discord-bot.manager.ts
import { Injectable } from '@nestjs/common'
import { Client, GatewayIntentBits } from 'discord.js'

@Injectable()
export class DiscordBotManager {
  private clients = new Map<string, Client>()

  async startBot(botId: string, token: string) {
    if (this.clients.has(botId)) {
      return this.clients.get(botId)
    }

    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    })

    await client.login(token)

    this.clients.set(botId, client)

    return client
  }

  async stopBot(botId: string) {
    const client = this.clients.get(botId)

    if (!client) return

    client.destroy()
    this.clients.delete(botId)
  }

  getClient(botId: string) {
    return this.clients.get(botId)
  }

  isRunning(botId: string) {
    return this.clients.has(botId)
  }

  async getBotGuilds(botId: string) {
    const client = this.clients.get(botId)

    if (!client) {
      throw new Error('Bot is not running')
    }

    const oauthGuilds = await client.guilds.fetch()

    const guilds = await Promise.all(
      oauthGuilds.map((g) =>
        client.guilds.fetch({ guild: g.id, withCounts: true }),
      ),
    )

    return guilds.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      approximateMemberCount: guild.approximateMemberCount,
    }))
  }
}
