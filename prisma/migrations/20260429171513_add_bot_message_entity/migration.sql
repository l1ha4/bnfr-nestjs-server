-- CreateEnum
CREATE TYPE "BotMessageStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "BotMessage" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT,
    "content" TEXT NOT NULL,
    "externalMessageId" TEXT NOT NULL,
    "status" "BotMessageStatus" NOT NULL DEFAULT 'SENT',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BotMessage" ADD CONSTRAINT "BotMessage_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
