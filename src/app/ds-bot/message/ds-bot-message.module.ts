import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { CryptoModule } from '@/libs/common/crypto/crypto.module'
import { UserModule } from '@/user/user.module'
import { DsBotMessageController } from './ds-bot-message.controller'
import { DsBotMessageService } from './ds-bot-message.service'

@Module({
  imports: [PrismaModule, CryptoModule, UserModule],
  controllers: [DsBotMessageController],
  providers: [DsBotMessageService],
})
export class DsBotMessageModule {}
