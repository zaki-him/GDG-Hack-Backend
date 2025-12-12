import express from 'express'
import router from './src/routes/router.js'
import dotenv from "dotenv"
import cors from 'cors'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/v1', router)

app.listen(3000, () => {
  console.log('server is running')
})