
import { Router } from 'express'
const router = Router()
import * as ac from './auth.controller.js'
import { asyncHandler } from '../../utiles/errorhandaling.js'
import { isValid } from "../../middlewares/vaildation.js";
import {signUpSchema ,logInSchema, forgetCodeSchema,resetPasswordSchema} from "./user.validation.js";

router.post('/',isValid(signUpSchema) ,asyncHandler(ac.signUp))
router.get('/confirm/:token',asyncHandler(ac.confirmEmail))
router.post('/login',isValid(logInSchema) , asyncHandler(ac.logIn))
router.post('/forget',isValid(forgetCodeSchema) ,asyncHandler(ac.forgetPassword))
router.post('/reset',isValid(resetPasswordSchema) ,asyncHandler(ac.resetPassword))



export default router


