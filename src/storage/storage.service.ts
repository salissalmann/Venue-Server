import { Injectable, OnModuleInit, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService implements OnModuleInit {
  private supabase;
  private bucketName = 'media';
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async onModuleInit() {
    // Check if bucket exists
    try {
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        this.logger.error(`Error listing buckets: ${error.message}`);
        return;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
      
      if (bucketExists) {
        this.logger.log(`Using existing bucket: "${this.bucketName}"`);
      } else {
        this.logger.warn(`Bucket "${this.bucketName}" does not exist. Please create it in the Supabase dashboard.`);
        this.logger.warn('Go to https://app.supabase.com > Storage > New Bucket');
        this.logger.warn(`Set the bucket name to "${this.bucketName}" and enable public access`);
      }
    } catch (error) {
      this.logger.error('Error checking buckets:', error);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file type
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed. Only PNG, JPEG, and SVG files are accepted.');
    }

    try {
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Prepare file path (with optional folder)
      const filePath = fileName;
      
      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });
      
      if (error) {
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          throw new BadRequestException(
            'Permission denied to upload files. Please check Supabase bucket RLS policies or create the bucket.'
          );
        }
        throw new Error(`Failed to upload file: ${error.message}`);
      }
      
      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadImage(image: {base64: string, isCover: boolean}): Promise<string> {
    try {
      if (image.base64.includes('https://')) {
        this.logger.debug('Image is already a link');
        return image.base64;
      }

      if (!image) {
        throw new BadRequestException('Image data is required');
      }
      
      this.logger.debug(`Input image type: ${typeof image}, isCover: ${image.isCover}`);
      this.logger.debug(`Base64 type: ${typeof image.base64}`);
      
      // Handle the complex nested array structure used by the client
      let actualBase64: string = '';
      
      if (typeof image.base64 === 'string') {
        const rawInput = image.base64.trim();
        
        // Check if it looks like an object/array literal notation
        if (rawInput.includes('base64:') && rawInput.includes('isCover:')) {
          this.logger.debug('Detected object literal string notation');
          // Extract the actual base64 part using regex
          const match = rawInput.match(/base64:\s*['"]([^'"]+)['"]/);
          if (match && match[1]) {
            actualBase64 = match[1];
            this.logger.debug('Extracted base64 data from object notation');
          }
        } else if (rawInput.startsWith('data:')) {
          // It's already a data URL
          actualBase64 = rawInput;
        } else {
          // Assume it's just base64 data
          actualBase64 = rawInput;
        }
      } else if (Array.isArray(image.base64) && (image.base64 as any[]).length > 0) {
        // Handle case where it's an array - use first element
        this.logger.debug('Image base64 is an array');
        const firstItem = (image.base64 as any[])[0];
        
        if (typeof firstItem === 'string') {
          actualBase64 = firstItem;
        } else if (firstItem && typeof firstItem.base64 === 'string') {
          // Handle case where it's like [{ base64: '...', isCover: true }]
          actualBase64 = firstItem.base64;
          this.logger.debug('Found base64 property in first array item');
        } else {
          this.logger.debug('First item structure:', JSON.stringify(firstItem));
          throw new BadRequestException('Unsupported array format for base64 image');
        }
      } else if (image.base64 && typeof image.base64 === 'object' && 'base64' in (image.base64 as any)) {
        // Handle case where it's like { base64: { base64: '...', isCover: true } }
        this.logger.debug('Image base64 is an object with base64 property');
        if (typeof (image.base64 as any).base64 === 'string') {
          actualBase64 = (image.base64 as any).base64;
        } else {
          this.logger.debug('Object structure:', JSON.stringify(image.base64));
          throw new BadRequestException('Unsupported object format for base64 image');
        }
      } else {
        // Try one more level of nesting for arrays
        try {
          this.logger.debug('Attempting to handle complex structure');
          // Try to extract from formats like [[{base64: '...'}]] or similar
          if (typeof image.base64 === 'object' && image.base64 !== null) {
            this.logger.debug('Object structure:', JSON.stringify(image.base64).substring(0, 100));
            
            // Find the actual base64 data by searching the object recursively
            const base64Value = this.findBase64InObject(image.base64);
            if (base64Value) {
              actualBase64 = base64Value;
              this.logger.debug('Found base64 data in complex structure');
            }
          }
        } catch (err) {
          this.logger.error('Error parsing complex structure:', err);
        }
        
        if (!actualBase64) {
          throw new BadRequestException('Unsupported format for base64 image');
        }
      }
      
      if (!actualBase64) {
        throw new BadRequestException('Could not extract base64 data');
      }
      
      // Now process the data URL or base64 string
      let contentType = 'image/jpeg'; // Default
      let base64Data = actualBase64;
      
      // If it's a data URL, extract the content type and data
      if (actualBase64.startsWith('data:')) {
        const parts = actualBase64.split(';base64,');
        if (parts.length === 2) {
          contentType = parts[0].replace('data:', '');
          base64Data = parts[1];
        }
      }
      
      // Create buffer from base64 data
      let buffer: Buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
        if (buffer.length === 0) {
          throw new Error('Empty buffer created from base64 data');
        }
      } catch (error) {
        this.logger.error('Failed to create buffer:', error);
        throw new BadRequestException('Invalid base64 data: ' + error.message);
      }
      
      // Generate filename and upload
      const timestamp = new Date().getTime();
      const fileExt = contentType.split('/')[1] || 'jpg';
      const folderPath = image.isCover ? 'covers/' : 'images/';
      const fileName = `${folderPath}${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload to Supabase
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, buffer, {
          contentType,
          upsert: false
        });
      
      if (error) {
        this.logger.error('Supabase upload error:', error);
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          throw new BadRequestException(
            'Permission denied to upload images. Please check Supabase bucket RLS policies or create the bucket.'
          );
        }
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      
      // Return the public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (error) {
      this.logger.error('Error uploading image:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }
  
  // Helper method to search for base64 data in complex nested objects
  private findBase64InObject(obj: any): string | null {
    if (!obj) return null;
    
    // Direct property check
    if (typeof obj.base64 === 'string' && obj.base64.length > 0) {
      return obj.base64;
    }
    
    // Array check
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = this.findBase64InObject(item);
        if (result) return result;
      }
    }
    
    // Object check
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (key === 'base64' && typeof obj[key] === 'string' && obj[key].length > 0) {
          return obj[key];
        }
        if (typeof obj[key] === 'object') {
          const result = this.findBase64InObject(obj[key]);
          if (result) return result;
        }
      }
    }
    
    return null;
  }
} 