import select from './utils/select'
import confirm from './utils/confirm'
import { Template } from '../../domain/Template'
import { TemplateService } from '../../services/TemplateService'
import { User } from 'telegraf/typings/telegram-types'

const WizardScene = require('telegraf/scenes/wizard')

export function factory (templateService: TemplateService) {
  return new WizardScene(
    'share-template',
    async (ctx: any) => {
      await ctx.replyWithChatAction('typing')

      const templates = await templateService.getByUserId(ctx.message.from.id)

      ctx.wizard.state.templates = templates

      if (!templates.length) {
        ctx.reply('You have no templates registered. To create a new one, use the /new command.')
        return ctx.scene.leave()
      }

      const templateOptions = templates.map((template) => ({ name: template.name, value: template }))
      const message = 'Please choose a template to share. You can use /cancel to abort, or /new to create a new template.'
      return select.promptForOption(message, templateOptions, ctx)
    },
    select.extractSelection('template', ({ value: template }) => `OK, you selected ${template.name}. Now, please, forward me a message from the person you want to share the template with`),
    async (ctx: any) => {
      const newOwner = ctx.message?.forward_from

      if (!newOwner) return ctx.reply('Hm... That didn\'t work. Please, try again.')

      if (newOwner.is_bot) return ctx.reply('I\'m sorry, but you can\'t share a template with a chatbot. Please, choose a regular user')

      ctx.wizard.state.newOwner = newOwner

      const { state: { template } } = ctx.wizard

      const message = `Are you sure you want to share ${template.name} with ${newOwner.first_name}?`

      return confirm.promptConfirmation(message)(ctx)
    },
    confirm.onConfirmmed(async (ctx) => {
      ctx.replyWithChatAction('typing')
      const template: Template = ctx.wizard.state.template
      const newOwner: User = ctx.wizard.state.newOwner

      template.owners.push(newOwner.id)

      await templateService.update(template)

      await ctx.reply('Done. Template shared :D')
      return ctx.scene.leave()
    })
  )
}

export default { factory }
