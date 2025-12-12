import express from 'express'
import router from './src/routes/router.js'
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(express.json())

app.use('/api/v1', router)

app.listen(3000, () => {
  console.log('server is running')
})