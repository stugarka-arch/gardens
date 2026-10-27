import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { extname } from 'node:path';
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_MIME_TYPES,
  FILE_MAX_SIZE,
} from './files.constants';

export type UploadedImage = {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
};

@Injectable()
export class FilesService {
  constructor(private readonly config: ConfigService) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadedImage> {
    this.validateFile(file);

    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'Завантаження зображень недоступне: Cloudinary не налаштовано.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'gardens', resource_type: 'image' },
          (error, response) => {
            if (error || !response) {
              reject(
                error instanceof Error
                  ? error
                  : new Error('Empty Cloudinary response'),
              );
            } else resolve(response);
          },
        );
        stream.end(file.buffer);
      });
      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch {
      throw new BadGatewayException(
        'Cloudinary тимчасово недоступний. Спробуйте пізніше.',
      );
    }
  }

  private validateFile(
    file: Express.Multer.File | undefined,
  ): asserts file is Express.Multer.File {
    if (!file)
      throw new BadRequestException('Надішліть одне зображення у полі file.');
    if (file.size > FILE_MAX_SIZE) {
      throw new PayloadTooLargeException(
        'Розмір зображення не може перевищувати 5 MB.',
      );
    }
    const extension = extname(file.originalname).toLowerCase();
    if (
      !ACCEPTED_IMAGE_MIME_TYPES.has(file.mimetype) ||
      !ACCEPTED_IMAGE_EXTENSIONS.has(extension)
    ) {
      throw new BadRequestException(
        'Дозволені лише JPEG, PNG, WebP та AVIF зображення.',
      );
    }
    if (!this.hasMatchingImageSignature(file.buffer, file.mimetype)) {
      throw new BadRequestException(
        'Вміст файлу не відповідає заявленому формату зображення.',
      );
    }
  }

  private hasMatchingImageSignature(buffer: Buffer, mimeType: string): boolean {
    if (mimeType === 'image/jpeg')
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    if (mimeType === 'image/png')
      return (
        buffer.length >= 8 &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      );
    if (mimeType === 'image/webp')
      return (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    if (mimeType === 'image/avif')
      return (
        buffer.length >= 12 &&
        buffer.subarray(4, 8).toString('ascii') === 'ftyp' &&
        ['avif', 'avis'].includes(buffer.subarray(8, 12).toString('ascii'))
      );
    return false;
  }
}
