declare const _default: {
    schema: string;
    out: string;
    dialect: "postgresql";
    dbCredentials: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
        ssl: {
            rejectUnauthorized: false;
        };
    };
};
export default _default;
