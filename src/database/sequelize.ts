import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  models: [__dirname + '/models'], // Automatically load models
  logging: false,
});

export default sequelize;
