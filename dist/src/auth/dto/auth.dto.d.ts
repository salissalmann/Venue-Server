export declare class LoginDto {
    email: string;
    password: string;
}
export declare class SignUpDto extends LoginDto {
    fullName?: string;
}
