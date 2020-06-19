const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'root',
    password: 'Mysql',
    host: 'localhost',
    database: 'rnative_nerdflix',
    port: 3306

})

module.exports = conn