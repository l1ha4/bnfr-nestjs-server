import { PrismaService } from '@/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { AuthMethod } from 'generated__/enums'

interface CreateUserDto {
  email: string
  password: string
  displayName: string
  picture: string
  method: AuthMethod
  isVerified: boolean
}

@Injectable()
export class UserService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        accounts: true,
      },
    })
    if (!user) {
      throw new Error(`User with id ${id} not found`)
    }

    return user
  }

  public async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        accounts: true,
      },
    })

    return user
  }

  public async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password ? await hash(dto.password) : '',
        displayName: dto.displayName,
        picture: dto.picture,
        method: dto.method,
        isVerified: dto.isVerified,
      },
      include: {
        accounts: true,
      },
    })

    return user
  }
}
