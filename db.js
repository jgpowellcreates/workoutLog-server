const {Sequelize} = require('sequelize'); //actually opening Sequelize
const db = new Sequelize(process.env.DB_CONNECTION_STRING);

module.exports = db;