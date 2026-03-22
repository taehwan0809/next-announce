import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
});

// 파일 key 생성
export function buildPresentationAudioKey(fileName: string) {
  return `presentations/${Date.now()}-${fileName}`;
}

// ❗ 이제 URL 저장 안함 (보안)
export function buildS3FileUrl(key: string) {
  return key;
}

// 직접 업로드 (서버 업로드용)
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

  return key; 
}

// presigned 업로드 URL 생성
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
    expiresIn: 60 * 3, // 🔒 3분
  });

  return {
    uploadUrl,
    key,
  };
}

// presigned 다운로드 URL 생성 (추가)
export async function createPresignedDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 60 * 5,
  });
}

// S3에서 파일 가져오기
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

// URL → key 변환 (이제 거의 안 씀, 그래도 유지)
export function getS3KeyFromUrl(fileUrl: string): string | null {
  try {
    const parsedUrl = new URL(fileUrl);
    const key = parsedUrl.pathname.replace(/^\/+/, '');
    return key || null;
  } catch {
    return null;
  }
}

// 삭제
export async function deleteFromS3(keyOrUrl: string) {
  const key =
    keyOrUrl.startsWith('http')
      ? getS3KeyFromUrl(keyOrUrl)
      : keyOrUrl;

  if (!key) {
    throw new Error('Invalid S3 key.');
  }

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  await s3Client.send(command);
}