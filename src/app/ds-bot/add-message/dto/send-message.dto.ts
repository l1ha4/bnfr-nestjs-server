import {
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class EmbedFieldDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  value!: string

  @IsOptional()
  inline?: boolean
}

export class EmbedDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(4096)
  description?: string

  @IsOptional()
  @IsUrl()
  url?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(16777215)
  color?: number

  @IsOptional()
  @IsString()
  footer?: string

  @IsOptional()
  @IsUrl()
  image?: string

  @IsOptional()
  @IsUrl()
  thumbnail?: string

  @IsOptional()
  @IsString()
  author?: string

  @IsOptional()
  @IsUrl()
  authorIconUrl?: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmbedFieldDto)
  fields?: EmbedFieldDto[]
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  botId!: string

  @IsString()
  @IsNotEmpty()
  serverId!: string

  @IsString()
  @IsNotEmpty()
  channelId!: string

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => EmbedDto)
  embed?: EmbedDto
}
