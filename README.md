# Процесс создания

## Установка и настройка докера и поднятия через него базы данных

## Установка первых зависимостей

- @nestjs/config
- class-transformer
- class-validator
- argon2
- @prisma/client
- cookie-parser
- connect-redis
- express-session
- ioredis
- @nestlab/google-recaptcha
- @nestjs-modules/mailer
- @react-email/components
- @react-email/html

- **@nestjs/config** — загрузка `.env` и централизованная конфигурация приложения.
- **class-transformer** — преобразование plain object в классы/DTO и обратно.
- **class-validator** — валидация DTO через декораторы (`@IsEmail()`, `@MinLength()` и т.д.).
- **argon2** — безопасное хэширование паролей.
- **@prisma/client** — клиент Prisma для работы с БД через типизированный API.
- **cookie-parser** — чтение и парсинг cookies в запросах Express/NestJS.
- **connect-redis** — хранение сессий Express в Redis.
- **express-session** — серверные сессии через cookie + session storage.
- **ioredis** — полноценный Redis клиент для Node.js.
- **@nestlab/google-recaptcha** — интеграция Google reCAPTCHA в NestJS.
- **@nestjs-modules/mailer** — отправка email писем из NestJS.
- **@react-email/components** — React-компоненты для верстки email шаблонов.
- **@react-email/html** — HTML-рендер email шаблонов из React.



## Overview

- **@trivago/prettier-plugin-sort-imports** — плагин для Prettier, автоматически сортирует import'ы.
- **@types/uuid** — TypeScript-типы для библиотеки `uuid` (часто уже не нужен в новых версиях).
- **@types/express-session** — типы TypeScript для `express-session`.
- **@types/cookie-parser** — типы TypeScript для `cookie-parser`.
- **@types/react** — базовые TypeScript-типы для React (`JSX`, hooks, компоненты).