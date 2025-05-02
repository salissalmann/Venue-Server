import { StorageService } from './storage.service';
import { FileUploadResponse } from './interfaces/file-upload.interface';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadFile(file: Express.Multer.File): Promise<FileUploadResponse>;
}
