import { MessageEntity } from 'telegraf/typings/telegram-types'
import { TemplateService } from '../../services/TemplateService'
import { Markup } from 'telegraf'

const WizardScene = require('telegraf/scenes/wizard')

const BUTTON_TEXTS = {
  confirm: {
    yes: 'Yes 👍',
    no: 'No 👎'
  }
}

export function factory (templateService: TemplateService) {
  return new WizardScene(
    'create-template',
    async (ctx: any) => {
      await ctx.reply('OK, a new template! Please, choose a name')
      ctx.wizard.next()
    },
    async (ctx: any) => {
      const name = ctx.message.text

      if (!name) {
        return ctx.reply('It seems like that is not a title... Please, send the desired title, or use /cancel to give up on creating the template')
      }

      ctx.wizard.state.name = name

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

      ctx.wizard.state.dimensions = { width, height }
      await ctx.reply('Got it. Now, please, send the template as pre-formatted code block (surrounded with three backticks like so: ```template```)')
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

      ctx.wizard.state.template = templateText

      const { name, dimensions, template } = ctx.wizard.state

      const text = [
        'Alreight, that\'s all I need from you\\. Let\'s review the data you just entered, to make sure it\'s correct\n',
        `**Name**: ${name}`,
        `**Width**: ${dimensions.width}`,
        `**Height**: ${dimensions.height}`,
        `**Template**: \n\`\`\`${template}\`\`\``,
        '',
        'Is this correct?'
      ].join('\n')

      await ctx.reply(text, Markup
        .keyboard([
          [ BUTTON_TEXTS.confirm.yes ],
          [ BUTTON_TEXTS.confirm.no ]
        ])
        .resize()
        .extra({ parse_mode: 'MarkdownV2' })
      )

      ctx.wizard.next()
    },
    async (ctx: any) => {
      if (!(Object.values(BUTTON_TEXTS.confirm).includes(ctx.message.text))) {
        return ctx.reply('Please use the buttons to reply.')
      }

      if (ctx.message.text === 'No 👎') {
        await ctx.reply('OK, nervermind then :)', Markup.removeKeyboard().extra())
        return ctx.scene.leave()
      }

      await ctx.reply('Ok, hold on, I\'m creating the template', Markup.removeKeyboard().extra())
      await ctx.replyWithChatAction('typing')

      const { name, dimensions, template } = ctx.wizard.state

      await templateService.create({ name, dimensions, template }, ctx.message.from.id)

      await ctx.reply('Ok, template created!')
      return ctx.scene.leave()
    }
  )
}

export default { factory }
