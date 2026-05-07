import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common'
import ms, { StringValue } from 'ms'
import cookieParser from 'cookie-parser'
import { createClient } from 'redis'
import session from 'express-session'
import { NextFunction, Request, Response } from 'express'
import { RedisStore } from 'connect-redis'
import { parseBoolean } from './libs/common/utils/parse-boolean.utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('HTTP')

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
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (e) =>
            `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
        )
        logger.error(`Validation failed: ${messages.join(' | ')}`)
        return new BadRequestException(messages)
      },
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

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now()
    logger.log(`Incoming ${req.method} ${req.originalUrl}`)

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt
      logger.log(
        `Completed ${req.method} ${req.originalUrl} with status ${res.statusCode} in ${durationMs}ms`,
      )
    })

    next()
  })

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()
