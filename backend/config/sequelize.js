const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Accept AWS self-signed cert
      },
    },
  }
);

// Function to authenticate and sync models
async function initializePostgres() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established.');
    await sequelize.sync({ alter: true }); // auto-sync models
    console.log('✅ Sequelize models synchronized.');
  } catch (err) {
    console.error('❌ Unable to connect to PostgreSQL:', err);
    throw err;
  }
}

module.exports = {
  sequelize,
  initializePostgres,
};
