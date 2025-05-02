"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.bucketName = 'media';
        this.logger = new common_1.Logger(StorageService_1.name);
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_KEY');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials are not configured');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async onModuleInit() {
        try {
            const { data: buckets, error } = await this.supabase.storage.listBuckets();
            if (error) {
                this.logger.error(`Error listing buckets: ${error.message}`);
                return;
            }
            const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
            if (bucketExists) {
                this.logger.log(`Using existing bucket: "${this.bucketName}"`);
            }
            else {
                this.logger.warn(`Bucket "${this.bucketName}" does not exist. Please create it in the Supabase dashboard.`);
                this.logger.warn('Go to https://app.supabase.com > Storage > New Bucket');
                this.logger.warn(`Set the bucket name to "${this.bucketName}" and enable public access`);
            }
        }
        catch (error) {
            this.logger.error('Error checking buckets:', error);
        }
    }
    async uploadFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('File type not allowed. Only PNG, JPEG, and SVG files are accepted.');
        }
        try {
            const timestamp = new Date().getTime();
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = fileName;
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });
            if (error) {
                if (error.message.includes('row-level security') || error.message.includes('RLS')) {
                    throw new common_1.BadRequestException('Permission denied to upload files. Please check Supabase bucket RLS policies or create the bucket.');
                }
                throw new Error(`Failed to upload file: ${error.message}`);
            }
            const { data: urlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);
            return urlData.publicUrl;
        }
        catch (error) {
            this.logger.error('Error uploading file:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
    async uploadImage(image) {
        try {
            if (!image) {
                throw new common_1.BadRequestException('Image data is required');
            }
            this.logger.debug(`Input image type: ${typeof image}, isCover: ${image.isCover}`);
            this.logger.debug(`Base64 type: ${typeof image.base64}`);
            let actualBase64 = '';
            if (typeof image.base64 === 'string') {
                const rawInput = image.base64.trim();
                if (rawInput.includes('base64:') && rawInput.includes('isCover:')) {
                    this.logger.debug('Detected object literal string notation');
                    const match = rawInput.match(/base64:\s*['"]([^'"]+)['"]/);
                    if (match && match[1]) {
                        actualBase64 = match[1];
                        this.logger.debug('Extracted base64 data from object notation');
                    }
                }
                else if (rawInput.startsWith('data:')) {
                    actualBase64 = rawInput;
                }
                else {
                    actualBase64 = rawInput;
                }
            }
            else if (Array.isArray(image.base64) && image.base64.length > 0) {
                this.logger.debug('Image base64 is an array');
                const firstItem = image.base64[0];
                if (typeof firstItem === 'string') {
                    actualBase64 = firstItem;
                }
                else if (firstItem && typeof firstItem.base64 === 'string') {
                    actualBase64 = firstItem.base64;
                    this.logger.debug('Found base64 property in first array item');
                }
                else {
                    this.logger.debug('First item structure:', JSON.stringify(firstItem));
                    throw new common_1.BadRequestException('Unsupported array format for base64 image');
                }
            }
            else if (image.base64 && typeof image.base64 === 'object' && 'base64' in image.base64) {
                this.logger.debug('Image base64 is an object with base64 property');
                if (typeof image.base64.base64 === 'string') {
                    actualBase64 = image.base64.base64;
                }
                else {
                    this.logger.debug('Object structure:', JSON.stringify(image.base64));
                    throw new common_1.BadRequestException('Unsupported object format for base64 image');
                }
            }
            else {
                try {
                    this.logger.debug('Attempting to handle complex structure');
                    if (typeof image.base64 === 'object' && image.base64 !== null) {
                        this.logger.debug('Object structure:', JSON.stringify(image.base64).substring(0, 100));
                        const base64Value = this.findBase64InObject(image.base64);
                        if (base64Value) {
                            actualBase64 = base64Value;
                            this.logger.debug('Found base64 data in complex structure');
                        }
                    }
                }
                catch (err) {
                    this.logger.error('Error parsing complex structure:', err);
                }
                if (!actualBase64) {
                    throw new common_1.BadRequestException('Unsupported format for base64 image');
                }
            }
            if (!actualBase64) {
                throw new common_1.BadRequestException('Could not extract base64 data');
            }
            let contentType = 'image/jpeg';
            let base64Data = actualBase64;
            if (actualBase64.startsWith('data:')) {
                const parts = actualBase64.split(';base64,');
                if (parts.length === 2) {
                    contentType = parts[0].replace('data:', '');
                    base64Data = parts[1];
                }
            }
            let buffer;
            try {
                buffer = Buffer.from(base64Data, 'base64');
                if (buffer.length === 0) {
                    throw new Error('Empty buffer created from base64 data');
                }
            }
            catch (error) {
                this.logger.error('Failed to create buffer:', error);
                throw new common_1.BadRequestException('Invalid base64 data: ' + error.message);
            }
            const timestamp = new Date().getTime();
            const fileExt = contentType.split('/')[1] || 'jpg';
            const folderPath = image.isCover ? 'covers/' : 'images/';
            const fileName = `${folderPath}${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(fileName, buffer, {
                contentType,
                upsert: false
            });
            if (error) {
                this.logger.error('Supabase upload error:', error);
                if (error.message.includes('row-level security') || error.message.includes('RLS')) {
                    throw new common_1.BadRequestException('Permission denied to upload images. Please check Supabase bucket RLS policies or create the bucket.');
                }
                throw new Error(`Failed to upload image: ${error.message}`);
            }
            const { data: urlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(fileName);
            return urlData.publicUrl;
        }
        catch (error) {
            this.logger.error('Error uploading image:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to upload image: ${error.message}`);
        }
    }
    findBase64InObject(obj) {
        if (!obj)
            return null;
        if (typeof obj.base64 === 'string' && obj.base64.length > 0) {
            return obj.base64;
        }
        if (Array.isArray(obj)) {
            for (const item of obj) {
                const result = this.findBase64InObject(item);
                if (result)
                    return result;
            }
        }
        if (typeof obj === 'object') {
            for (const key in obj) {
                if (key === 'base64' && typeof obj[key] === 'string' && obj[key].length > 0) {
                    return obj[key];
                }
                if (typeof obj[key] === 'object') {
                    const result = this.findBase64InObject(obj[key]);
                    if (result)
                        return result;
                }
            }
        }
        return null;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map