import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { Client, GatewayIntentBits, Message } from 'discord.js'

@Injectable()
export class DsBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DsBotService.name)
  private client: Client | null = null

  async onModuleInit(): Promise<void> {
    const token = process.env.DISCORD_BOT_SECRET_TOKEN

    if (!token) {
      throw new Error('DISCORD_BOT_SECRET_TOKEN is not set')
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    })

    this.registerEvents()

    await this.client.login(token)
  }

  async onModuleDestroy(): Promise<void> {
    this.client?.destroy()
    this.client = null
  }

  private registerEvents(): void {
    if (!this.client) return

    this.client.once('clientReady', () => {
      this.logger.log(`Bot started: ${this.client?.user?.tag}`)
    })
  }

  public getClient(): Client {
    if (!this.client) {
      throw new Error('Discord client is not initialized')
    }

    return this.client
  }
}
