import env from 'sugar-env'
import { IMongoParams } from '@nindoo/mongodb-data-layer'

export type AppConfig = {
  telegram: {
    token: string
  }
  server: {
    port: number
    webhookUrl?: string
  }
  database: IMongoParams
}

export const config: AppConfig = {
  telegram: {
    token: env.get('TELEGRAM_TOKEN', '')
  },
  database: {
    uri: env.get('DATABASE_URI', ''),
    dbName: env.get('DATABASE_NAME', 'image-generator-bot')
  },
  server: {
    port: env.get.int([ 'PORT', 'SERVER_PORT' ], 3000),
    webhookUrl: env.get('TELEGRAM_WEBHOOK_URL', undefined)
  }
}
