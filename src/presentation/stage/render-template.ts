import { chromium } from 'playwright-chromium'

import select from './utils/select'
import confirm from './utils/confirm'
import { render } from '../../utils/render'
import { Template } from '../../domain/Template'
import { TemplateService } from '../../services/TemplateService'

const WizardScene = require('telegraf/scenes/wizard')

type FinalState = {
  template: Template
  renderData: Record<string, string>
}

export function factory(templateService: TemplateService) {
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

      const templateOptions = templates.map(template => ({ name: template.name, value: template }))
      const message =
        'Please choose a template to render. You can use /cancel to abort, or /new to create a new template.'
      return select.promptForOption(message, templateOptions, ctx)
    },
    select.extractSelection('template', ({ value: template }) => {
      const fields = template.fields.join(', ')
      return `OK, you selected ${template.name}. Now, please, send me the following fields, separated by double commas (,,): ${fields}`
    }),
    async (ctx: any) => {
      const rawFields = ctx.message?.text

      if (!rawFields)
        return ctx.reply('Please, send me the field values separated by double commas (,,)')

      const values: string[] = rawFields.split(',,').map((field: string) => field.trim())

      const fields: string[] = ctx.wizard.state.template.fields

      const fieldPlusValues = fields.map((fieldName, index) => [fieldName, values[index]])

      const fieldLines = fieldPlusValues.map(([field, value]) => `${field}: ${value}`)

      ctx.wizard.state.renderData = Object.fromEntries(fieldPlusValues)

      const { template } = ctx.wizard.state

      const message = [
        "Wonderful\\! So, this is the data you've given me for this event:",
        '',
        `Template: ${template.name}`,
        ...fieldLines,
        '',
        'Is this correct?'
      ].join('\n')

      return confirm.promptConfirmation(message)(ctx)
    },
    confirm.onConfirmmed(async ctx => {
      await ctx.reply('Hold on as I generate your image.')
      await ctx.replyWithChatAction('upload_document')

      const state: FinalState = ctx.wizard.state

      const { template, renderData } = state

      let renderedTemplate: string

      try {
        renderedTemplate = await render(template, { ...renderData })
      } catch (err) {
        await ctx.reply(`Error while rendering template: ${err.message}`)
        return ctx.scene.leave()
      }

      try {
        const browser = await chromium.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage()
        await page.setContent(renderedTemplate)
        await page.setViewportSize(template.dimensions)
        const file = await page.screenshot({ type: 'png' })
        await browser.close()
        await ctx.replyWithDocument({ source: file, filename: `${template.name}.png` })
      } catch (err) {
        await ctx.reply(`Error generating image: ${err.message}`)
      }

      ctx.scene.leave()
    })
  )
}

export default { factory }
