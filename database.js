import { Sequelize, DataTypes } from 'sequelize';

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'InspirationalQuotesLibrary',
  username: 'postgres',
  password: 'pswd@123',
  dialect: 'postgres',
};

// Create a Sequelize instance
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false, 
  }
);

// Test the database connection
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testDatabaseConnection();

