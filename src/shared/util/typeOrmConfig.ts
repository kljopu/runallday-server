import path from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

let host = 'localhost';

export const typeormConfig: PostgresConnectionOptions = {
  type: 'postgres',
  port: 5432,
  username: 'testuser',
  password: 'testpasswd',
  database: 'runallday',
  synchronize: true,
  entities: [`${path.join(__dirname, '..', '..', '**')}/*.model.[tj]s`],
  host: 'localhost',
};
