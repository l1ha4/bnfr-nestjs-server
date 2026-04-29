import { Authorization } from '@/auth/decorators/auth.decorators'
import { Authorized } from '@/auth/decorators/authorized.decorators'
import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { SendMessageDto } from './dto/send-message.dto'
import { DsBotMessageService } from './ds-bot-message.service'

@Controller('ds-bot-messages')
export class DsBotMessageController {
  constructor(private readonly botMessageService: DsBotMessageService) {}

  @Authorization()
  @Post('send')
  send(@Authorized('id') userId: string, @Body() dto: SendMessageDto) {
    return this.botMessageService.send(userId, dto)
  }

  @Authorization()
  @Get(':botId/all')
  findAllByBot(
    @Authorized('id') userId: string,
    @Param('botId') botId: string,
  ) {
    return this.botMessageService.findAllByBot(userId, botId)
  }
}
