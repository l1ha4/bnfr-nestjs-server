import { DiscordBotManagerModule } from '@/app/manager/discord-bot-manager.module'
import { UserModule } from '@/user/user.module'
import { Module } from '@nestjs/common'
import { ServerChannelsController } from './server-channels.controller'
import { ServerChannelsService } from './server-channels.service'

@Module({
  imports: [UserModule, DiscordBotManagerModule],
  controllers: [ServerChannelsController],
  providers: [ServerChannelsService],
})
export class ServerChannelsModule {}
