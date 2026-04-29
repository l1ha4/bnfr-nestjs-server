import { Authorization } from '@/auth/decorators/auth.decorators'
import { Authorized } from '@/auth/decorators/authorized.decorators'
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { CreateBotDto } from './dto/create-bot.dto'
import { DsBotService } from './ds-bot.service'

@Controller('ds-bots')
export class DsBotController {
  constructor(private readonly botService: DsBotService) {}

  @Authorization()
  @Post('add')
  create(@Authorized('id') userId: string, @Body() dto: CreateBotDto) {
    return this.botService.create({
      token: dto.token,
      ownerId: userId,
    })
  }

  @Authorization()
  @Get('all')
  findAll(@Authorized('id') userId: string) {
    return this.botService.findAllByOwner(userId)
  }

  @Authorization()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.botService.findById(id)
  }

  @Authorization()
  @Delete('delete/:id')
  remove(@Authorized('id') userId: string, @Param('id') id: string) {
    return this.botService.remove(id, userId)
  }
}
