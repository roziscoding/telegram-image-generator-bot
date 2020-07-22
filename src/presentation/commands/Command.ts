import { TelegrafContext } from 'telegraf/typings/context'

// Command
export type Command = {
  name: string
  run: <TContext extends TelegrafContext>(ctx: TContext) => any
  help?: string
}
