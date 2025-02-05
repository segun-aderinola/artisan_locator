import { Sequelize } from 'sequelize';

// Set up environment variables or default values for PostgreSQL connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',    // e.g. localhost or your DB server IP
  port: Number(process.env.DB_PORT) || 5432,   // default PostgreSQL port
  username: process.env.DB_USERNAME || '', // DB username
  password: process.env.DB_PASSWORD || '', // DB password
  database: process.env.DB_NAME || '',     // DB name
  logging: false, // You can enable logging here if needed
});

export default sequelize;
