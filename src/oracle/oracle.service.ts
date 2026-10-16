import { Injectable } from '@nestjs/common';

export type OracleInfo = {
  status: 'integrated' | 'not_configured';
  product: 'Oracle Database';
  connect_string: string | null;
};

@Injectable()
export class OracleService {
  info(): OracleInfo {
    const user = process.env.ORACLE_USER;
    const password = process.env.ORACLE_PASSWORD;
    const connect_string = process.env.ORACLE_CONNECT_STRING;
    const integrated = Boolean(user && password && connect_string);

    return {
      status: integrated ? 'integrated' : 'not_configured',
      product: 'Oracle Database',
      connect_string: integrated ? (connect_string ?? null) : null,
    };
  }
}
