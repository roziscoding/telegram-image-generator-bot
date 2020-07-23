import { Stage, Markup } from 'telegraf'
import shareTemplate from './share-template'
import createTemplate from './create-template'
import renderTemplate from './render-template'
// import updateTemplate from './update-template'
import deleteTemplate from './delete-template'
import { TemplateService } from '../../services/TemplateService'
import { TelegramFileService } from '../../services/TelegramFileService'

export function factory (templateService: TemplateService, telegramFileService: TelegramFileService) {
  const stage = new Stage([
    createTemplate.factory(templateService, telegramFileService),
    renderTemplate.factory(templateService),
    // updateTemplate.factory(templateService),
    deleteTemplate.factory(templateService),
    shareTemplate.factory(templateService)
  ])

  stage.command('cancel', async (ctx) => {
    await ctx.reply('OK, nevermind then', Markup.removeKeyboard().extra())
    return ctx.scene.leave()
  })

  return stage.middleware()
}

export default { factory }
