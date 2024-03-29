import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('file')
export class FileController {
  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename: string = path
            .parse(file.originalname)
            .name.replace(/\s/g, '');
          const extension: string = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  @UsePipes(
    new ParseFilePipe({
      validators: [new FileTypeValidator({ fileType: /(jpg|png|txt)$/ })],
    }),
  )
  async createProduct(@UploadedFile() file: Express.Multer.File) {
    try {
      const { filename, destination } = file;
      return { filename, destination };
    } catch (error) {
      console.error('Error al crear el archivo:', error);
      throw new Error('Ha ocurrido un error al crear el archivo');
    }
  }
}
