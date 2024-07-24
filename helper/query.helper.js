import util from 'util';
import db from '../database/db.database.js'


// Promisify db.query
const query = util.promisify(db.query).bind(db);


export default query;