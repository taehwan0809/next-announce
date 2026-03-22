import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function buildPresentationAudioKey(fileName: string) {
  return `presentations/${Date.now()}-${fileName}`;
}

export function buildS3FileUrl(key: string) {
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = buildPresentationAudioKey(fileName);

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return buildS3FileUrl(key);
}

export async function createPresignedUploadUrl(
  fileName: string,
  contentType: string
) {
  const key = buildPresentationAudioKey(fileName);
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 5,
  });

  return {
    uploadUrl,
    key,
    fileUrl: buildS3FileUrl(key),
  };
}

export async function getFileFromS3(
  key: string,
  fileName = 'recording.webm',
  contentType = 'audio/webm'
) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error('S3 file body is empty.');
  }

  const byteArray = await response.Body.transformToByteArray();
  const fileBuffer = Buffer.from(byteArray);

  return new File([fileBuffer], fileName, {
    type: response.ContentType || contentType,
  });
}

export function getS3KeyFromUrl(fileUrl: string): string | null {
  try {
    const parsedUrl = new URL(fileUrl);
    const key = parsedUrl.pathname.replace(/^\/+/, '');

    return key || null;
  } catch {
    return null;
  }
}

export async function deleteFromS3(fileUrl: string) {
  const key = getS3KeyFromUrl(fileUrl);

  if (!key) {
    throw new Error('Invalid S3 file URL.');
  }

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  await s3Client.send(command);
}
