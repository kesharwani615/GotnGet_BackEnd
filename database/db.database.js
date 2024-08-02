import mysql from 'mysql2';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig()

const connection = mysql.createConnection({
    port:process.env.PORT_DATABASE,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

export default connection;