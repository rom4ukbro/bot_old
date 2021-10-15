const { Sequelize, DataTypes, Model } = require('sequelize');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });

const host = process.env.DB_HOST,
  port = process.env.DB_PORT,
  user = process.env.DB_USER,
  password = process.env.DB_PWD;

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
});

pool.query('CREATE DATABASE IF NOT EXISTS schedule_bot', (err, results) => {
  if (err) console.log(err);
});
pool.query(
  'CREATE TABLE IF NOT EXISTS `schedule_bot`.`users` ( `id` INT NOT NULL , `firstName` VARCHAR(50) NOT NULL , `lastName` VARCHAR(50) NULL , `userName` VARCHAR(32) NULL )',
  (err, results) => {
    if (err) console.log(err);
  },
);

const sequelize = new Sequelize('schedule_bot', user, password, {
  host,
  port,
  dialect: 'mysql',
});
(async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.log('='.repeat(50));
    console.log('DB created. Start again\n');
    console.log('='.repeat(50));
    throw new Error(error.message);
  }
})();
const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    lastName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    userName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  },
  {
    timestamps: false,
    tableName: 'users',
  },
);

module.exports = { User };
