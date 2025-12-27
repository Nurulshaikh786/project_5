const mysql = require("mysql");
const db_config = mysql.createPool({
    connectionLimit:100,
    acquireTimeout:30000,
    host: '127.0.0.1',
    user: 'root',
    password: "",
    database: 'messho',
    charset: 'utf8mb4'
})

db_config.on('error', (err) => {
    console.error('FATAL: MySQL Pool Error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.warn('→ Attempting auto-reconnect...');
    }
});

db_config.getConnection((err, connection) => {
    if (err) {
        console.error('FATAL: Cannot connect to MySQL:', err.message);
        console.error('Check: MySQL service, credentials, host, port, socket');
    } else {
        console.log('MySQL Pool Connected Successfully');
        connection.release();
    }
});
module.exports = db_config;
/*
const db_config = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'meesho'
    });

db_config.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log("Connected!");
    }
});
*/

// const db_config = mysql.createPool({
//     connectionLimit: 100,
//     acquireTimeout: 30000000, //30 secs
//     host     : 'localhost',
//     user     : 'root',
//     password : '',
//     database : 'meesho'
// });
// module.exports = db_config;