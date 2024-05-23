import  express  from "express";
const router =express.Router()
import { auth} from "../../middlewares/auth.js";
import { asyncHandler } from '../../utiles/errorhandaling.js'
import {getTodos,addBlog,deleteBlog,updateBlog,getBlogById} from "./controller/blog.controller.js";
import{isValid} from "../../middlewares/vaildation.js";
import{addBlogSchema} from "./validator.js";
import { allowedExtensions, multerCloudFunction } from "../../Services/multer.js";
import{endpoints}from "./blog.endppints.js";

router.get('/getTodos', asyncHandler(getTodos));
router.post("/add",auth(endpoints.create),multerCloudFunction(allowedExtensions.image).single("image"),isValid(addBlogSchema),asyncHandler(addBlog))
router.post("/updateBlog/:id",auth(endpoints.update),multerCloudFunction(allowedExtensions.image).single("image"),asyncHandler(updateBlog))
router.delete("/deleteBlog/:id",auth(endpoints.delete),asyncHandler(deleteBlog))
router.get('/createdBy/:userId', asyncHandler(getBlogById));


export default router;