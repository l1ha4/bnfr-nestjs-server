import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { IS_DEV_ENV } from './libs/common/utils/is-dev.utils'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'

import { ProviderModule } from './auth/provider/provider.module'
import { DS_BOT_MODULES } from './app/ds-bot'


@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !IS_DEV_ENV,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ...DS_BOT_MODULES,
    ProviderModule,
  ],
})
export class AppModule {}
