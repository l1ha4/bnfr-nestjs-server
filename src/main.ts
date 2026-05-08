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
  // RFC 6265: Domain attribute must be a registered hostname, not an IP address.
  // Browsers silently reject Set-Cookie with Domain=<ip>. Always set undefined for IPs.
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(sessionDomain)
  const cookieDomain =
    sessionDomain === 'localhost' ||
    sessionDomain === '127.0.0.1' ||
    isIpAddress
      ? undefined
      : sessionDomain

  const corsOrigins = config
    .getOrThrow<string>('ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const redis = createClient({ url: config.getOrThrow<string>('REDIS_URL') })
  await redis.connect()

  // CORS must be registered first — before session and cookieParser.
  // Preflight OPTIONS requests must receive CORS headers before any other
  // middleware can short-circuit the request and send a response without them.
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    // NOTE: 'Set-Cookie' is a forbidden response header; browsers block JS
    // access to it regardless of exposedHeaders. Do not list it here.
  })

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
        // IP addresses are not valid Domain attribute values per RFC 6265.
        // Browsers silently reject Set-Cookie when Domain is an IP.
        // Only set domain for real hostnames; leave undefined for IPs and localhost.
        domain: cookieDomain,
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: sessionSecure,
        // SameSite=None requires Secure=true (HTTPS).
        // SameSite=Lax blocks cookies on cross-site fetch requests (e.g. localhost → remote IP).
        // For cross-origin HTTP dev, use a Vite proxy instead of direct cross-origin calls.
        sameSite: sessionSecure ? 'none' : 'lax',
      },
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
    }),
  )

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
