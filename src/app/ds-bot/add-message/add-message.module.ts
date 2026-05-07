import { Module } from '@nestjs/common'
import { AddMessageService } from './add-message.service'
import { AddMessageController } from './add-message.controller'
import { UserModule } from '@/user/user.module'

@Module({
  imports: [UserModule],
  controllers: [AddMessageController],
  providers: [AddMessageService],
})
export class AddMessageModule {}
