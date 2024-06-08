import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { config } from 'dotenv'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import AuthRoutes from '@routes/auth'

config()

const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = ['http://localhost:3000']
app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
)
app.use(morgan('dev'))
app.set('trust proxy', 1)
app.use(compression())
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.get('/ping', (_, res) => {
  res.json({ message: 'pong' })
})
app.use('/api/auth', AuthRoutes)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
