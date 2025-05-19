const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Create S3 instance
const s3 = new AWS.S3();

// Configure multer for S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const folder = file.fieldname === 'video' ? 'videos' : 'thumbnails';
      cb(null, `${folder}/${fileName}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB file size limit
    files: 2 // Allow up to 2 files (video + thumbnail)
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    if (file.fieldname === 'video') {
      if (!file.originalname.match(/\.(mp4|webm|mov)$/)) {
        return cb(new Error('Only video files are allowed!'), false);
      }
    } else if (file.fieldname === 'thumbnail') {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
    }
    cb(null, true);
  }
});

// Utility function to delete file from S3
const deleteFile = async (key) => {
  try {
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

// Utility function to generate signed URL for private files
const getSignedUrl = async (key, expires = 3600) => {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: expires
    });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

module.exports = {
  upload,
  deleteFile,
  getSignedUrl
};