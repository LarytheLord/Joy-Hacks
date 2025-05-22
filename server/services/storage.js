import AWS from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();
const bucket = process.env.AWS_BUCKET_NAME;

// Upload file to S3
export const uploadToS3 = async (fileBuffer, folder) => {
  const fileName = `${folder}/${uuidv4()}`;
  
  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: fileBuffer,
    ContentType: 'video/mp4',
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw new Error(`Error uploading to S3: ${error.message}`);
  }
};

// Generate thumbnail from video
export const generateThumbnail = async (videoBuffer) => {
  return new Promise((resolve, reject) => {
    const thumbnailFileName = `thumbnails/${uuidv4()}.jpg`;
    
    ffmpeg()
      .input(videoBuffer)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: thumbnailFileName,
        folder: '/tmp',
        size: '320x240'
      })
      .on('end', async () => {
        try {
          const thumbnailBuffer = await fs.promises.readFile(`/tmp/${thumbnailFileName}`);
          
          const params = {
            Bucket: bucket,
            Key: thumbnailFileName,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read'
          };

          const result = await s3.upload(params).promise();
          await fs.promises.unlink(`/tmp/${thumbnailFileName}`);
          resolve(result.Location);
        } catch (error) {
          reject(new Error(`Error generating thumbnail: ${error.message}`));
        }
      })
      .on('error', (error) => {
        reject(new Error(`Error generating thumbnail: ${error.message}`));
      });
  });
};

// Delete file from S3
export const deleteFromS3 = async (fileUrl) => {
  const key = fileUrl.split('/').slice(-2).join('/');
  
  const params = {
    Bucket: bucket,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    throw new Error(`Error deleting from S3: ${error.message}`);
  }
}; 