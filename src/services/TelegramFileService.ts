import { Document } from 'telegraf/typings/telegram-types'

import { TelegramFileClient } from '../data/clients/TelegramFileClient'

export class TelegramFileService {
  constructor (
    private readonly client: TelegramFileClient
  ) { }

  async download (document: Document) {
    return this.client.download(document)
  }
}
