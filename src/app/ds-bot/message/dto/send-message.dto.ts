import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class SendMessageDto {
  @IsString({ message: 'ID бота должен быть строкой.' })
  @IsNotEmpty({ message: 'ID бота обязателен для заполнения.' })
  botId!: string

  @IsString({ message: 'ID канала должен быть строкой.' })
  @IsNotEmpty({ message: 'ID канала обязателен для заполнения.' })
  channelId!: string

  @IsString({ message: 'ID сервера должен быть строкой.' })
  @IsOptional()
  guildId?: string

  @IsString({ message: 'Текст сообщения должен быть строкой.' })
  @IsNotEmpty({ message: 'Текст сообщения обязателен для заполнения.' })
  @MaxLength(2000, { message: 'Максимальная длина сообщения 2000 символов.' })
  content!: string
}
