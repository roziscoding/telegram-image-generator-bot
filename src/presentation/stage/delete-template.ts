import { Markup } from 'telegraf'

import confirm from './utils/confirm'
import { TemplateService } from '../../services/TemplateService'

const WizardScene = require('telegraf/scenes/wizard')
export function factory (templateService: TemplateService) {
  return new WizardScene(
    'delete-template',
    async (ctx: any) => {
      await ctx.replyWithChatAction('typing')

      const templates = await templateService.getByUserId(ctx.message.from.id)

      ctx.wizard.state.templates = templates

      if (!templates.length) {
        ctx.reply('You have no templates registered. To create a new one, use the /new command.')
        return ctx.scene.leave()
      }

      const templateButtons = templates.map(({ name }, index) => [ `${index}: ${name}` ])
      const markup = Markup
        .keyboard(templateButtons)
        .resize()
        .extra()

      ctx.reply('Please choose a template to proceed\\. You can use /cancel to abort, or /new to create a new template\\.', markup)
      return ctx.wizard.next()
    },
    async (ctx: any) => {
      const usage = () => ctx.reply('Please, use the buttons to reply to this, or /cancel to abort')

      const rawIndex = ctx.message.text.split(':')[ 0 ]
      if (!rawIndex || isNaN(rawIndex)) return usage()

      const index = parseInt(rawIndex, 10)

      const template = ctx.wizard.state.templates[ index ]

      if (!template) return usage()

      ctx.wizard.state.template = template
      return confirm.promptConfirmation(`OK, you selected ${template.name}\\. What would you like the event name to be?`)(ctx)
    },
    confirm.onConfirmmed(async (ctx: any) => {
      await ctx.replyWithChatAction('typing')

      console.log(ctx.wizard.state.template)
      await templateService.remove(ctx.wizard.state.template._id)

      await ctx.reply('Ok, template deleted!')
      return ctx.scene.leave()
    })
  )
}

export default { factory }
