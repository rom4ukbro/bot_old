const { Sequelize, DataTypes, Model } = require('sequelize');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });

const host = process.env.DB_HOST,
  port = process.env.DB_PORT,
  user = process.env.DB_USER,
  password = process.env.DB_PWD;

const conn = mysql.createConnection({
  host,
  port,
  user,
  password,
});

conn.query('CREATE DATABASE IF NOT EXISTS schedule_bot', (err, results) => {
  if (err) console.log(err);
});

conn.destroy();

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
    throw new Error('');
  }
})();

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
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

User.sync();

module.exports = { User };
