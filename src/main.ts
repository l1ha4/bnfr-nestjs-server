import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import ms, { StringValue } from 'ms'
import cookieParser from 'cookie-parser'
import { createClient } from 'redis'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import { parseBoolean } from './libs/common/utils/parse-boolean.utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = app.get(ConfigService)
  const isProduction = config.get<string>('NODE_ENV') === 'production'

  if (isProduction) {
    // Required behind reverse proxy (nginx/cloudflare) for secure cookies.
    app.getHttpAdapter().getInstance().set('trust proxy', 1)
  }

  const sessionDomain = config.getOrThrow<string>('SESSION_DOMAIN')
  const sessionSecure = parseBoolean(
    config.getOrThrow<string>('SESSION_SECURE'),
  )
  const cookieDomain =
    sessionDomain === 'localhost' || sessionDomain === '127.0.0.1'
      ? undefined
      : sessionDomain

  const corsOrigins = config
    .getOrThrow<string>('ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const redis = createClient({ url: config.getOrThrow<string>('REDIS_URL') })
  await redis.connect()

  app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')))

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        domain: cookieDomain,
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: sessionSecure,
        sameSite: sessionSecure ? 'none' : 'lax',
      },
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
    }),
  )

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()
