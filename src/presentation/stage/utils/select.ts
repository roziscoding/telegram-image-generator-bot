import { Markup } from 'telegraf'

type Option = {
  name: string
  value: any
}

export const promptForOption = async (message: string, options: Option[], ctx: any) => {
  const keyboardButtons = options.map(({ name }, index) => [`${index}: ${name}`])

  const markup = Markup.keyboard(keyboardButtons).resize().extra()

  await ctx.reply(message, markup)

  ctx.wizard.state.select = { options }
  return ctx.wizard.next()
}

export const extractSelection = (
  field: string,
  confirmMessage: (option: Option) => string
) => async (ctx: any) => {
  const {
    select: { options }
  } = ctx.wizard.state

  const usage = () => ctx.reply('Please, use the buttons to reply to this, or /cancel to abort')

  const rawIndex = ctx.message?.text?.split(':')[0]
  if (!rawIndex || isNaN(rawIndex)) return usage()

  const index = parseInt(rawIndex, 10)

  const option = options[index]

  if (!option) return usage()

  ctx.wizard.state[field] = option.value
  await ctx.reply(confirmMessage(option), Markup.removeKeyboard().extra())
  ctx.wizard.next()
}

export default {
  promptForOption,
  extractSelection
}
