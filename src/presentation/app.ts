import { Telegraf, session } from 'telegraf'
import { createConnection } from '@nindoo/mongodb-data-layer'
import { TemplateRepository } from '../data/repositories/TemplateRepository'

import stage from './stage'
import { getCommands } from './commands'
import { AppConfig } from '../config'
import { TemplateService } from '../services/TemplateService'
import { BotCommand } from 'telegraf/typings/telegram-types'
import { TelegramFileClient } from '../data/clients/TelegramFileClient'
import { TelegramFileService } from '../services/TelegramFileService'

export async function factory (config: AppConfig) {
  const connection = await createConnection(config.database)

  const templateRepository = new TemplateRepository(connection)
  const telegramFileClient = new TelegramFileClient(config.telegram.token)

  const templateService = new TemplateService(templateRepository)
  const telegramFileService = new TelegramFileService(telegramFileClient)

  const bot = new Telegraf(config.telegram.token, {
    telegram: {
      webhookReply: false
    }
  })

  bot.use(session())
  bot.use(stage.factory(templateService, telegramFileService) as any)

  const commands = getCommands(templateService)

  for (const command of commands) {
    bot.command(command.name, command.run)
  }

  const myCommands: BotCommand[] = commands.filter(command => !!command.help)
    .map(command => ({ command: command.name, description: command.help || '' }))

  await bot.telegram.setMyCommands(myCommands)

  console.log(`Commands loaded: ${commands.map(({ name }) => name).join(', ')}`)

  return bot
}

export default { factory }
