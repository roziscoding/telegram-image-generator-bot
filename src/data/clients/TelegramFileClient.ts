import axios from 'axios'
import { Telegram } from 'telegraf'
import { Document } from 'telegraf/typings/telegram-types'

export class TelegramFileClient {
  private readonly telegram: Telegram

  constructor (
    private readonly token: string
  ) {
    this.telegram = new Telegram(token)
  }

  async download (document: Document) {
    const { file_path: filePath } = await this.telegram.getFile(document.file_id)

    const fileUrl = `https://api.telegram.org/file/bot${this.token}/${filePath}`
    const config = { responseType: 'arraybuffer' as const }

    return axios.get<Buffer>(fileUrl, config)
      .then(({ data }) => data.toString('utf8'))
  }
}
