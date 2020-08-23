import { Markup } from 'telegraf'

const BUTTON_TEXTS = {
  confirm: {
    yes: 'Yes 👍',
    no: 'No 👎'
  }
}

const promptConfirmation = (message: string) => async (ctx: any) =>
  ctx
    .reply(
      message.replace(/\./g, '\\.').replace(/-/g, '\\-'),
      Markup.keyboard([[BUTTON_TEXTS.confirm.yes], [BUTTON_TEXTS.confirm.no]])
        .resize()
        .extra({ parse_mode: 'MarkdownV2' })
    )
    .then(() => ctx.wizard.next())

const basicDenyAction = async (ctx: any) => {
  await ctx.reply('OK, nervermind then :)', Markup.removeKeyboard().extra())
  return ctx.scene.leave()
}

const basicConfirmAction = async (ctx: any) => {
  await ctx.reply('Thanks for the confirmation.', Markup.removeKeyboard().extra())
}

const validateConfirm = (
  onConfirm = (ctx: any) => ctx.wizard.next(),
  onDeny = basicDenyAction
) => async (ctx: any) => {
  if (!Object.values(BUTTON_TEXTS.confirm).includes(ctx.message.text)) {
    return ctx.reply('Please use the buttons to reply.')
  }

  if (ctx.message.text === 'No 👎') {
    return onDeny(ctx)
  }

  await basicConfirmAction(ctx)
  return onConfirm(ctx)
}

export default {
  promptConfirmation,
  onConfirmmed: validateConfirm,
  basicDenyAction
}
