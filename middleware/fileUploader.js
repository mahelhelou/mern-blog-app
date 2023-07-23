const path = require('path')
const multer = require('multer')

// Images storage
const imageFileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../uploads/images')) // @params: errorMessage, folder location
	},
	filename: (req, file, cb) => {
		if (!file) cb(null, false) // @param false: Don't write a name for the file (File not found)
		cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
	}
})

exports.photoUpload = multer({
	storage: imageFileStorage,
	fileFilter: (req, file, cb) => {
		// image/png to accept only PNG images
		if (!file.mimetype.startsWith('image')) {
			cb({ message: 'Unsupported file format!' }, false)
		}

		cb(null, true) // true: Upload the image
	},
	limits: { fileSize: 1024 * 1024 } // 1 MB
})
