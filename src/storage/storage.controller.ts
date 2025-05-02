import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileUploadResponse } from './interfaces/file-upload.interface';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    // @Body() uploadFileDto: UploadFileDto
  ): Promise<FileUploadResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    const url = await this.storageService.uploadFile(file);
    return { 
      success: true,
      url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype 
    };
  }
} 