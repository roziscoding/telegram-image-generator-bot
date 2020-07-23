import { TelegrafContext } from 'telegraf/typings/context'

export function factory () {
  return {
    name: 'repo',
    help: 'Returns the link to the GitHub repository',
    run: async ({ reply }: TelegrafContext) => reply('Here\'s my GitHub repo: https://github.com/roziscoding/telegram-image-generator-bot')
  }
}

export default { factory }
