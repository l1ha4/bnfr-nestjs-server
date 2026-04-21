import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/generated__/client'
import { PrismaPg } from '@prisma/adapter-pg'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_URL })
    super({ adapter })
  }

  public async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  public async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
