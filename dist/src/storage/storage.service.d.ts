import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class StorageService implements OnModuleInit {
    private configService;
    private supabase;
    private bucketName;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    uploadFile(file: Express.Multer.File): Promise<string>;
    uploadImage(image: {
        base64: string;
        isCover: boolean;
    }): Promise<string>;
    private findBase64InObject;
}
