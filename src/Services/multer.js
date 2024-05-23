import multer from 'multer'
export const allowedExtensions = {
    image: ['image/png', 'image/jpeg', 'image/gif'],
    Files: ['application/pdf', 'application/javascript'],
    Videos: ['video/mp4'],
  }

export const multerCloudFunction = (allowedExtensionsArr) => {
  if (!allowedExtensionsArr) {
    allowedExtensionsArr = allowedExtensions.image
  } 
  // Storage
  const storage = multer.diskStorage({})

  //File Filter 
  const fileFilter = function (req, file, cb) {
    if (allowedExtensionsArr.includes(file.mimetype)) {
      return cb(null, true)
    }
    cb(new Error('invalid extension', { cause: 400 }), false)
  } 

  const fileUpload = multer({
    fileFilter,
    storage,
  })
  return fileUpload
}

