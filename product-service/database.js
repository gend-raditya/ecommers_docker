const {Sequelize} = require('sequelize');

// Inisialisasi koneksi database
const sequelize = new Sequelize(
    process.env.DB_NAME || 'product_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root', 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port : 3306,
        logging: false,
    }
);

// Fungsi untuk menguji koneksi database
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

module.exports = sequelize;