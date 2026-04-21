import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { RegisterDto } from './dto/register.dto'
import { UserService } from '@/user/user.service'
import { AuthMethod } from 'generated__/enums'
import { User } from 'generated__/browser'
import { Request } from 'express'
import { LoginDto } from './dto/login.dto'
import { Response } from 'express'
import { verify } from 'argon2'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  public constructor(private readonly userService: UserService, private readonly configService: ConfigService) {}

  public async register(req: Request, dto: RegisterDto) {
    const isExists = await this.userService.findByEmail(dto.email)

    if (isExists) {
      throw new Error('Пользователь с таким email уже существует.')
    }

    const newUser = await this.userService.create({
      displayName: dto.name,
      email: dto.email,
      password: dto.password,
      picture: '',
      method: AuthMethod.CREDENTIALS,
      isVerified: false,
    })

    return this.saveSession(req, newUser)
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email)

    if (!user || !user.password) {
      throw new NotFoundException('Пользователь с таким email не найден.')
    }

    const isValidPassword = await verify(user.password, dto.password)

    if (!isValidPassword) {
      throw new UnauthorizedException('Неверный пароль.')
    }

    return this.saveSession(req, user)
  }

  public async logout(req: Request, res: Response):Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException('Ошибка при уничтожении сессии.'),
          )
        }
        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
        resolve()
      })
    })
  }

  private async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id

      this.logger.log(
        `Сохранение сессии для пользователя: ${user.id} (${user.email})`,
      )

      req.session.save((err) => {
        if (err) {
          this.logger.error(
            `Ошибка сохранения сессии для пользователя: ${user.id}`,
            err,
          )
          return reject(
            new InternalServerErrorException(
              'Ошибка при сохранении сессии. Возможжно неверные параметры',
            ),
          )
        }

        this.logger.log(
          `Сессия успешно сохранена в Redis. Session ID: ${req.session.id}`,
        )
        resolve({ user })
      })
    })
  }
}
