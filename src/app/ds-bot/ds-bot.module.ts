import { Module } from '@nestjs/common'
import { DsBotService } from './ds-bot.service'

@Module({
  providers: [DsBotService],
})
export class DsBotModule {}
