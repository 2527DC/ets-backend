import express from 'express'
import { createProductAdmin } from './admin.controller.js'


const router= express.Router()



router.post("/create",createProductAdmin)



export default router