import { TelegrafContext } from 'telegraf/typings/context'
import { MessageEntity } from 'telegraf/typings/telegram-types'
import { TelegramFileService } from '../../../services/TelegramFileService'

const getTemplateFromText = (text: string, entities: MessageEntity[]) => {
  const templateEntity = entities.find(({ type }) => type === 'pre')

  if (!templateEntity || !text) {
    return null
  }

  return text.substr(templateEntity.offset, templateEntity.length)
}

export const getTemplateFromContext = async (
  ctx: TelegrafContext,
  telegramFileService?: TelegramFileService
) => {
  if (ctx.message?.text) {
    const template = getTemplateFromText(ctx.message.text, ctx.message.entities ?? [])
    return { template, origin: 'text' }
  }

  if (ctx.message?.document) {
    if (!telegramFileService) return null

    const template = await telegramFileService.download(ctx.message.document)
    return { template, origin: 'file' }
  }

  return null
}
