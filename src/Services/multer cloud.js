import multer ,{diskStorage} from "multer";
 export const uploadcloud=()=>{
    const storage=diskStorage({}) //save file in folder "temp"
    const multerUpload=multer({storage})
    return multerUpload
}
