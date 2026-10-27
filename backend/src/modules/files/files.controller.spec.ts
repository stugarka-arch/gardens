jest.mock('@nestjs/config', () => ({ ConfigService: class ConfigService {} }));
jest.mock('../auth/auth.guard', () => ({ AuthGuard: class AuthGuard {} }));

import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AuthGuard } from '../auth/auth.guard';
import { FilesController } from './files.controller';

describe('FilesController', () => {
  it('protects POST /files/upload with the existing session AuthGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      FilesController.prototype.upload,
    ) as unknown[];
    expect(guards).toContain(AuthGuard);
  });

  it('delegates an uploaded file to the service', async () => {
    const uploadImage = jest.fn().mockResolvedValue({
      secure_url:
        'https://res.cloudinary.com/example/image/upload/gardens/a.jpg',
    });
    const controller = new FilesController({ uploadImage } as never);
    const uploaded = { originalname: 'a.jpg' } as Express.Multer.File;
    await expect(controller.upload(uploaded)).resolves.toEqual(
      await uploadImage.mock.results[0]?.value,
    );
    expect(uploadImage).toHaveBeenCalledWith(uploaded);
  });
});
