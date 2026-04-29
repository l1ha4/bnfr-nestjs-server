import { PrismaModule } from '@/prisma/prisma.module'
import { UserModule } from '@/user/user.module'
import { DsBotController } from './ds-bot.controller'
import { DsBotService } from './ds-bot.service'
import { Module } from '@nestjs/common'
import { CryptoModule } from '@/libs/common/crypto/crypto.module'
import { DiscordBotManagerModule } from '../manager/discord-bot-manager.module'

@Module({
  imports: [PrismaModule, UserModule, CryptoModule, DiscordBotManagerModule],
  controllers: [DsBotController],
  providers: [DsBotService],
})
export class DsBotModule {}
