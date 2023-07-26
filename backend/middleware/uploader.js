const path = require('path')
const multer = require('multer')

const imageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../uploads/images')) // @params: errorMessage, folder location
	},
	filename: (req, file, cb) => {
		if (file) {
			cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
		} else {
			cb(null, false) // @param false: Don't write a name for the file (File not found)
		}
	}
})

exports.photoUpload = multer({
	storage: imageStorage,
	fileFilter: (req, file, cb) => {
		// image/png to accept only PNG images
		if (file.mimetype.startsWith('image')) {
			cb(null, true) // true: Upload the image
		} else {
			cb(new Error('Unsupported file format!'), false)
		}
	},
	limits: { fileSize: 1024 * 1024 } // 1 MB
})
