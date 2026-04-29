import { Module } from '@nestjs/common'
import { DsBotServersService } from './ds-bot-servers.service'
import { DsBotServersController } from './ds-bot-servers.controller'
import { UserModule } from '@/user/user.module'
import { DiscordBotManagerModule } from '@/app/manager/discord-bot-manager.module'

@Module({
  imports: [UserModule, DiscordBotManagerModule],
  controllers: [DsBotServersController],
  providers: [DsBotServersService],
})
export class DsBotServersModule {}
