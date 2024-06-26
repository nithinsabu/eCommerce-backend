const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { uploadDummyProducts, fetchProducts, editProduct, uploadImage, fetchReviews } = require('./../controllers/productControllers')
const uploadDir = path.join(__dirname,'..','uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const router = express.Router()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, req.dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  });
const createUploadDir = (req, res, next) => {
  if (req.query['id']){
    req.dir = path.join(uploadDir, req.query['id'])
  }else{
    req.dir = uploadDir
  }
  next()
}
const upload = multer({storage: storage });

router.post('/uploaddummyproducts', uploadDummyProducts)
router.get('/fetchproducts', fetchProducts)
router.post('/editproduct', editProduct)
router.post('/uploadimages', createUploadDir, upload.array('image', 5), uploadImage);
router.get('/fetchreviews', fetchReviews)
module.exports = router