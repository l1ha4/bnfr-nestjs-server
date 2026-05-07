import { Body, Controller, Logger, Post } from '@nestjs/common'
import { AddMessageService } from './add-message.service'
import { SendMessageDto } from './dto/send-message.dto'
import { Authorization } from '@/auth/decorators/auth.decorators'

@Controller('ds-bots/send-message')
export class AddMessageController {
  private readonly logger = new Logger(AddMessageController.name)

  constructor(private readonly addMessageService: AddMessageService) {}

  @Authorization()
  @Post()
  async sendMessage(@Body() dto: SendMessageDto) {
    this.logger.log(
      `POST /ds-bots/send-message | botId=${dto.botId} serverId=${dto.serverId} channelId=${dto.channelId}`,
    )
    const result = await this.addMessageService.sendMessage(dto)
    this.logger.log(`POST /ds-bots/send-message | status=201`)
    return result
  }
}
