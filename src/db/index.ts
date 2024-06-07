import pkg from 'pg'
import { config } from 'dotenv'

config()

const { Pool } = pkg

const pool = (() => {
  if (process.env.NODE_ENV === 'development') {
    return new Pool({})
  } else {
    return new Pool({
      ssl: {
        rejectUnauthorized: false
      }
    })
  }
})()

export default { query: (text: string, params: string[]) => pool.query(text, params) }
