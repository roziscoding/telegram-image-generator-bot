// import select from './utils/select'
// import confirm from './utils/confirm'

// import { TemplateService } from '../../services/TemplateService'
// import { getTemplateFromContext } from './utils/template'
// import { TelegramFileService } from '../../services/TelegramFileService'

// const WizardScene = require('telegraf/scenes/wizard')
// export function factory (templateService: TemplateService, telegramFileService: TelegramFileService) {
//   return new WizardScene(
//     'update-template',
//     async (ctx: any) => {
//       await ctx.replyWithChatAction('typing')

//       const templates = await templateService.getByUserId(ctx.message.from.id)

//       ctx.wizard.state.templates = templates

//       if (!templates.length) {
//         ctx.reply('You have no templates registered. To create a new one, use the /new command.')
//         return ctx.scene.leave()
//       }

//       const templateOptions = templates.map((template) => ({ name: template.name, value: template }))
//       const message = 'Please choose a template to proceed. You can use /cancel to abort, or /new to create a new template.'

//       return select.promptForOption(message, templateOptions, ctx)
//     },
//     select.extractSelection('template', (o) => `OK, you selected ${o.name}. What would you like the template name to be?`),
//     async (ctx: any) => {
//       const name = ctx.message.text

//       if (!name) {
//         return ctx.reply('It seems like that is not a name... Please, send the desired title, or use /cancel to give up on creating the template')
//       }

//       ctx.wizard.state.template.name = name

//       await ctx.reply('Okay, now send me the template dimenions using the format <width>x<height>. For example: 2560x1920')
//       ctx.wizard.next()
//     },
//     async (ctx: any) => {
//       const dimensionsRegex = /\d+x\d+/
//       const rawDimensions = ctx.message.text

//       if (!rawDimensions || !dimensionsRegex.test(rawDimensions)) {
//         return ctx.reply('Well... I didn\'t quite get that. Please, try again using the format <width>x<height> like 2560x1920')
//       }

//       const [ rawWidth, rawHeight ] = rawDimensions.split('x')
//       const width = parseInt(rawWidth, 10)
//       const height = parseInt(rawHeight, 10)

//       ctx.wizard.state.template.dimensions = { width, height }
//       await ctx.reply('Got it. Now, please, send the new template as pre-formatted code block (surrounded with three backticks like so: ```template```), or upload it as a UTF-8 text file')
//       ctx.wizard.next()
//     },
//     async (ctx: any) => {
//       const usage = () => ctx.reply('Let\'s try that again. You need to send your template as a pre-formatted code block, surrounded with three backticks like so: ```template```')

//       const template = await getTemplateFromContext(ctx, telegramFileService)

//       if (!template) return usage()

//       ctx.wizard.state.template.template = template.template

//       const { name, dimensions } = ctx.wizard.state.template

//       const text = [
//         'Alright, that\'s all I need from you\\. Let\'s review the data you just entered, to make sure it\'s correct\n',
//         `**Name**: ${name}`,
//         `**Width**: ${dimensions.width}`,
//         `**Height**: ${dimensions.height}`,
//         `**Template**: \n\`\`\`\n${template.origin === 'text' ? template.template : '<File>'}\`\`\``,
//         '',
//         'Is this correct?'
//       ].join('\n')

//       return confirm.promptConfirmation(text)(ctx)
//     },
//     confirm.onConfirmmed(async (ctx: any) => {
//       await ctx.replyWithChatAction('typing')

//       await templateService.update(ctx.wizard.state.template)

//       await ctx.reply('Ok, template updated!')
//       return ctx.scene.leave()
//     })
//   )
// }

// export default { factory }
