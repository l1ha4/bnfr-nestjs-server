import { DsBotModule } from './ds-bot.module'

import { DsBotServersModule } from './servers/ds-bot-servers.module'
import { ServerChannelsModule } from './server-channels/server-channels.module'
import { AddMessageModule } from './add-message/add-message.module'

export { DsBotModule, DsBotServersModule, ServerChannelsModule }

export const DS_BOT_MODULES = [
	DsBotModule,
	DsBotServersModule,
	ServerChannelsModule,
	AddMessageModule,
]
