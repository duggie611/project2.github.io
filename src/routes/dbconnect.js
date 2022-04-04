const mysql = require('mysql');
const dbconnection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'project2'
  });
  // connect to database
    dbconnection.connect(function(error){
    if(error) throw error;
    else console.log("Connected to the database successfully!");
  })
module.exports = dbconnection;