import { IsNotEmpty, IsString } from 'class-validator'

export class CreateBotDto {
  @IsString({ message: 'Токен должен быть строкой.' })
  @IsNotEmpty({ message: 'Токен обязателен для заполнения.' })
  token!: string
}
