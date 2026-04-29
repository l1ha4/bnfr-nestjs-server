import { DsBotModule } from './ds-bot.module'
import { DsBotMessageModule } from './message/ds-bot-message.module'
import { DsBotServersModule } from './servers/ds-bot-servers.module'

export { DsBotModule, DsBotMessageModule, DsBotServersModule } 

export const DS_BOT_MODULES = [DsBotModule, DsBotMessageModule, DsBotServersModule]
