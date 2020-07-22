import ejs from 'ejs'
import { Markup } from 'telegraf'
import { chromium } from 'playwright'

import { confirm } from './utils'
import { TemplateService } from '../../services/TemplateService'
import { Template } from '../../domain/Template'

const WizardScene = require('telegraf/scenes/wizard')

type FinalState = {
  template: Template
  topic: string
  date: string
  location: string
}

export function factory (templateService: TemplateService) {
  return new WizardScene(
    'render-template',
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

      ctx.reply('Done. Please choose a template to proceed. You can use /cancel to abort, or /new to create a new template.', markup)
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
      await ctx.reply(`OK, you selected ${template.name}. Now, please, give me the event topic.`, Markup.removeKeyboard().extra())
      ctx.wizard.next()
    },
    async (ctx: any) => {
      if (!ctx.message.text) return ctx.reply('Hm... That doesn\'t seem like an event topic. Let\'s try that againg, shall we?')

      ctx.wizard.state.topic = ctx.message.text

      await ctx.reply('Nice! What about the date? (This will be rendered exactly as you type it)')
      ctx.wizard.next()
    },
    async (ctx: any) => {
      if (!ctx.message.text) return ctx.reply('I don\'t think I got that right. Please, send me the event date.')

      ctx.wizard.state.date = ctx.message.text

      await ctx.reply('Great! Now, what about the location?')
      ctx.wizard.next()
    },
    async (ctx: any) => {
      if (!ctx.message.text) return ctx.reply('That\'s not a valid location...')

      ctx.wizard.state.location = ctx.message.text

      const { template, topic, date, location } = ctx.wizard.state

      const text = [
        'Wonderful\\! So, this is the data you\'ve given me for this event:',
        '',
        `Template: ${template.name}`,
        `Topic: ${topic}`,
        `Date: ${date}`,
        `Location: ${location}`,
        '',
        'Is this correct?'
      ].join('\n')

      return confirm.promptConfirmation(text)(ctx)
    },
    confirm.validateConfirm(async (ctx) => {
      await ctx.reply('Hold on as I generate your image.')
      await ctx.replyWithChatAction('upload_photo')

      const state: FinalState = ctx.wizard.state

      const { template, topic, date, location } = state

      const result = ejs.render(template.template, { topic, date, location })

      const browser = await chromium.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      })

      const page = await browser.newPage()
      await page.setContent(result)
      await page.setViewportSize(template.dimensions)
      const file = await page.screenshot({ type: 'png' })
      await browser.close()

      await ctx.replyWithPhoto({ source: file })

      ctx.scene.leave()
    })
  )
}

export default { factory }
