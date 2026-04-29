import { Global, Module } from '@nestjs/common'
import { DiscordBotManager } from './discord-bot.manager'

@Global()
@Module({
  providers: [DiscordBotManager],
  exports: [DiscordBotManager],
})
export class DiscordBotManagerModule {}
