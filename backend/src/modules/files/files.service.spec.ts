jest.mock('@nestjs/config', () => ({ ConfigService: class ConfigService {} }));
jest.mock('cloudinary', () => ({
  v2: { config: jest.fn(), uploader: { upload_stream: jest.fn() } },
}));

import {
  BadGatewayException,
  BadRequestException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { FilesService } from './files.service';

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
const file = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File => ({
  fieldname: 'file',
  originalname: 'garden.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: jpeg.length,
  destination: '',
  filename: '',
  path: '',
  stream: null as never,
  buffer: jpeg,
  ...overrides,
});

describe('FilesService', () => {
  const config = { get: jest.fn() } as unknown as ConfigService;
  let service: FilesService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new FilesService(config);
  });

  it('rejects a file whose magic bytes do not match the declared image type', async () => {
    await expect(
      service.uploadImage(file({ buffer: Buffer.from('not-an-image') })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a file larger than 5 MB', async () => {
    await expect(
      service.uploadImage(file({ size: 5 * 1024 * 1024 + 1 })),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  it('reports missing Cloudinary credentials without attempting upload', async () => {
    (config.get as jest.Mock).mockReturnValue(undefined);
    await expect(service.uploadImage(file())).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  it('maps a Cloudinary failure to a safe gateway error', async () => {
    (config.get as jest.Mock).mockImplementation(() => 'configured');
    const uploadStream = cloudinary.uploader
      .upload_stream as unknown as jest.Mock;
    uploadStream.mockImplementation(() => ({
      end: () => {
        throw new Error('secret provider detail');
      },
    }));
    await expect(service.uploadImage(file())).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
