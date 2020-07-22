import { config } from './config'
import server from './presentation/server'

server.start(config)
  .then(() => console.log('Server listening'))
  .catch(err => {
    console.error('===== Fatal Error =====')
    console.error(err)
    process.exit(1)
  })
