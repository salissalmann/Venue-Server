import { UserRole } from '../enums/roles.enum';
export declare class SignUpDto {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    country_code: string;
    phone_no: string;
    image?: string;
    city?: string;
    state?: string;
    country?: string;
    role?: UserRole[];
}
