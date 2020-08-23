import { Markup } from 'telegraf'

import select from './utils/select'
import confirm from './utils/confirm'
import * as renderUtils from '../../utils/render'
import { getTemplateFromContext } from './utils/template'
import { TemplateService } from '../../services/TemplateService'
import { TelegramFileService } from '../../services/TelegramFileService'

const WizardScene = require('telegraf/scenes/wizard')

export function factory(
  templateService: TemplateService,
  telegramFileService: TelegramFileService
) {
  return new WizardScene(
    'create-template',
    async (ctx: any) => {
      await ctx.reply('OK, a new template! Please, choose a name')
      ctx.wizard.next()
    },
    async (ctx: any) => {
      const name = ctx.message.text

      if (!name) {
        return ctx.reply(
          'It seems like that is not a title... Please, send the desired title, or use /cancel to give up on creating the template'
        )
      }

      ctx.wizard.state.name = name

      await ctx.reply(
        'Okay, now send me the template dimenions using the format <width>x<height>. For example: 2560x1920'
      )
      ctx.wizard.next()
    },
    async (ctx: any) => {
      const dimensionsRegex = /\d+x\d+/
      const rawDimensions = ctx.message.text

      if (!rawDimensions || !dimensionsRegex.test(rawDimensions)) {
        return ctx.reply(
          "Well... I didn't quite get that. Please, try again using the format <width>x<height> like 2560x1920"
        )
      }

      const [rawWidth, rawHeight] = rawDimensions.split('x')
      const width = parseInt(rawWidth, 10)
      const height = parseInt(rawHeight, 10)
      ctx.wizard.state.dimensions = { width, height }
      return select.promptForOption('Choose a templating engine', renderUtils.ENGINE_OPTIONS, ctx)
    },
    select.extractSelection(
      'engine',
      option =>
        `Ok, ${option.name} it is, then! Now, please, send the template as a file or a pre-formatted code block (surrounded with three backticks like so: \`\`\`template\`\`\`)`
    ),
    async (ctx: any) => {
      const usage = () =>
        ctx.reply(
          "Let's try that again. You need to send your template as a pre-formatted code block or upload it as a file"
        )

      const template = await getTemplateFromContext(ctx, telegramFileService)

      if (!template) return usage()

      ctx.wizard.state.template = template
      await ctx.reply(
        'Got it! Now, please send me the names of the fields your template uses, separated by commas.'
      )
      ctx.wizard.next()
    },
    async (ctx: any) => {
      if (!ctx.message?.text)
        return ctx.reply('Please, send me a text message with the field names separated by comas')

      const fields = ctx.message.text.split(',').map((s: string) => s.trim())

      ctx.wizard.state.fields = fields
      const { name, dimensions, template, engine } = ctx.wizard.state

      const text = [
        "Alreight, that's all I need from you. Let's review the data you just entered, to make sure it's correct\n",
        `**Name**: ${name}`,
        `**Width**: ${dimensions.width}`,
        `**Height**: ${dimensions.height}`,
        `**Fields**: ${fields.join(', ')}`,
        `**Template**: \n\`\`\`${template.origin === 'text' ? template.template : '<File>'}\`\`\``,
        `**Templating Engine**: ${engine}`,
        '',
        'Is this correct?'
      ].join('\n')

      return confirm.promptConfirmation(text)(ctx)
    },
    confirm.onConfirmmed(async (ctx: any) => {
      await ctx.reply("Ok, hold on, I'm creating the template", Markup.removeKeyboard().extra())
      await ctx.replyWithChatAction('typing')

      const {
        name,
        dimensions,
        template: { template },
        fields,
        engine
      } = ctx.wizard.state

      await templateService.create(
        { name, dimensions, template, fields, engine },
        ctx.message.from.id
      )

      await ctx.reply('Ok, template created!')
      return ctx.scene.leave()
    })
  )
}

export default { factory }
