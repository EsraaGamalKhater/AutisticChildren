import { Router } from 'express'
const router = Router()
import { asyncHandler } from '../../utiles/errorhandaling.js'
import{isValid} from "../../middlewares/vaildation.js";
import { uploadcloud } from "../../Services/multer cloud.js";
import{editProfile,profilepic,updateprofilepic,changePassword,getuserById,deleteUser,logout} from "../User/Controller/User.controller.js"
import{changePasswordSchema} from "./User.validation.js"
router.patch("/editProfile/:id",asyncHandler(editProfile))
router.post("/profilepic/:_id",uploadcloud().single("image"),asyncHandler(profilepic))
router.post("/updateprofilepic/:_id",uploadcloud().single("image"),asyncHandler(updateprofilepic))
router.post("/changePassword/:id",isValid(changePasswordSchema),asyncHandler(changePassword))
router.get('/getuserById/:id',asyncHandler(getuserById))
router.delete("/deleteUser/:id",asyncHandler(deleteUser))
router.post("/logout",asyncHandler(logout))

export default router;