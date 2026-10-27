import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { FILE_MAX_SIZE } from './files.constants';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: FILE_MAX_SIZE } }),
  )
  @ApiCookieAuth('gardens_session')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Upload one plant image to Cloudinary' })
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('Надішліть одне зображення у полі file.');
    return this.files.uploadImage(file);
  }
}
