import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [FileController],
  providers: [FileService, JwtService],
})
export class FileModule {}
