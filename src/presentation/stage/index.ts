import { Stage, Markup } from 'telegraf'
import createTemplate from './create-template'
import renderTemplate from './render-template'
import updateTemplate from './update-template'
import deleteTemplate from './delete-template'
import { TemplateService } from '../../services/TemplateService'

export function factory (templateService: TemplateService) {
  const stage = new Stage([
    createTemplate.factory(templateService),
    renderTemplate.factory(templateService),
    updateTemplate.factory(templateService),
    deleteTemplate.factory(templateService)
  ])

  stage.command('cancel', async (ctx) => {
    await ctx.reply('OK, nevermind then', Markup.removeKeyboard().extra())
    return ctx.scene.leave()
  })

  return stage.middleware()
}

export default { factory }
