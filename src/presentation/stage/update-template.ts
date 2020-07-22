import { Markup, Extra } from 'telegraf'
import { MessageEntity } from 'telegraf/typings/telegram-types'

import { confirm } from './utils'
import { TemplateService } from '../../services/TemplateService'

const WizardScene = require('telegraf/scenes/wizard')
export function factory (templateService: TemplateService) {
  return new WizardScene(
    'update-template',
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

      ctx.reply('Please choose a template to proceed. You can use /cancel to abort, or /new to create a new template.', markup)
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
      await ctx.reply(`OK, you selected ${template.name}. What would you like the event name to be?`, Markup.removeKeyboard().extra())
      ctx.wizard.next()
    },
    async (ctx: any) => {
      const name = ctx.message.text

      if (!name) {
        return ctx.reply('It seems like that is not a name... Please, send the desired title, or use /cancel to give up on creating the template')
      }

      ctx.wizard.state.template.name = name

      await ctx.reply('Okay, now send me the template dimenions using the format <width>x<height>. For example: 2560x1920')
      ctx.wizard.next()
    },
    async (ctx: any) => {
      const dimensionsRegex = /\d+x\d+/
      const rawDimensions = ctx.message.text

      if (!rawDimensions || !dimensionsRegex.test(rawDimensions)) {
        return ctx.reply('Well... I didn\'t quite get that. Please, try again using the format <width>x<height> like 2560x1920')
      }

      const [ rawWidth, rawHeight ] = rawDimensions.split('x')
      const width = parseInt(rawWidth, 10)
      const height = parseInt(rawHeight, 10)

      ctx.wizard.state.template.dimensions = { width, height }
      await ctx.reply('Got it. Now, please, send the template as pre-formatted code block (surrounded with three backticks like so: ```template```)')
      await ctx.reply(`This is the current template:\n \`\`\`\n${ctx.wizard.state.template.template}\n\`\`\``, Extra.markdown(true))
      ctx.wizard.next()
    },
    async (ctx: any) => {
      const usage = () => ctx.reply('Let\'s try that again. You need to send your template as a pre-formatted code block, surrounded with three backticks like so: ```template```')

      const entities: MessageEntity[] = ctx.message.entities ?? []
      const templateEntity = entities.find(({ type }) => type === 'pre')
      const rawText: string | undefined = ctx.message.text

      if (!templateEntity || !rawText) {
        return usage()
      }

      const templateText = rawText.substr(templateEntity.offset, templateEntity.length)

      ctx.wizard.state.template.template = templateText

      const { name, dimensions, template } = ctx.wizard.state.template

      const text = [
        'Alreight, that\'s all I need from you\\. Let\'s review the data you just entered, to make sure it\'s correct\n',
        `**Name**: ${name}`,
        `**Width**: ${dimensions.width}`,
        `**Height**: ${dimensions.height}`,
        `**Template**: \n\`\`\`\n${template}\`\`\``,
        '',
        'Is this correct?'
      ].join('\n')

      return confirm.promptConfirmation(text)(ctx)
    },
    confirm.validateConfirm(async (ctx: any) => {
      await ctx.replyWithChatAction('typing')

      await templateService.update(ctx.wizard.state.template)

      await ctx.reply('Ok, template updated!')
      return ctx.scene.leave()
    })
  )
}

export default { factory }
