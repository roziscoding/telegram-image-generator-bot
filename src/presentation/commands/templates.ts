import { TemplateService } from '../../services/TemplateService'
import { TelegrafContext } from 'telegraf/typings/context'

export function factory (templateService: TemplateService) {
  return {
    name: 'templates',
    help: 'Lists all your templates',
    run: async (ctx: TelegrafContext) => {
      const id = ctx.message?.from?.id

      if (!id) return

      const templates = await templateService.getByUserId(id)

      if (!templates.length) return ctx.reply('You currently have no templates. To create a new one, use the /new command')

      const templateLines = templates.map(({ name, dimensions, fields }) => [
        `Name: ${name}`,
        `Dimensions: ${dimensions.width}x${dimensions.height}`,
        `Fields: ${fields.join(', ')}`,
        '-------'
      ].join('\n'))

      const message = [
        'These are your current templates:',
        '',
        ...templateLines
      ].join('\n')

      return ctx.reply(message)
    }
  }
}

export default { factory }
