import ngrok from 'ngrok'

import app from './app'
import { AppConfig } from '../config'

async function getWebhookUrl(config: AppConfig) {
  if (config.server.webhookUrl) {
    return `${config.server.webhookUrl}/${config.telegram.token}`
  }

  const ngrokUrl = await ngrok.connect({ addr: config.server.port })
  return `${ngrokUrl}/${config.telegram.token}`
}

export async function start(config: AppConfig) {
  const bot = await app.factory(config)

  const webhookUrl = await getWebhookUrl(config)

  await bot.telegram.setWebhook(webhookUrl)

  return bot.startWebhook(`/${config.telegram.token}`, null, config.server.port)
}

export default { start }
