const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Initialize S3 Client with AWS SDK v3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    httpOptions: {
        agent: false  // Disables proxy
    }
});

// Ensure bucket name is correctly fetched
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Multer storage using AWS SDK v3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set content type
        acl: 'public-read', // Allows public access to the uploaded files
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `questions/${Date.now()}-${file.originalname}`);
        }
    })
});

module.exports = upload;
