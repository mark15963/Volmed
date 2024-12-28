/*
<?php
    $host = "localhost"; //host name
    $dbname = "volmed_db";
    $dbuname = "root"; //username to db
    $dbpassword = ""; // pass to db
    

    $conn = mysqli_connect($host, $dbuname, $dbpassword, $dbname);

    if(!$conn){
        die("Connection Failed!") ;
    }

    try{
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $dbuname, $dbpassword); //PDO - php data objects
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
*/

/*
const { createServer } = require('http');
const { url } = require('node:inspector');
var fs = require('fs');

const hostname = '127.0.0.1';
const port = 3306;

const server = createServer((req, res) => {
  fs.readFile('../index.html', function(err,data){
    res.writeHead(200, { 'content-type': 'text/html' });
  
    var q = url.parse(req.url, true).query;
    var txt = q.year + " " + q.month + " " + q.test;
    res.write(txt);
    res.write(data);
    
    return res.end();
  });
});



server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/



const fs = require('fs');
const http = require('http');
const express = require('express');


const mysql = require('mysql');
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "volmed_db"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("SELECT lastName FROM patients", function (err, result) {
    if (err) throw err;
    var JSON_string = JSON.stringify(result[1]);
    console.log("Result: " + JSON_string);
  });
});


const app = express();
const port = 3000;

app.use(express.static(__dirname+'/public'));

/*
http.createServer(function (req, res) {
  fs.readFile('../index.html', function(err, data) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.write(data);
    res.end();
  });
}).listen(3000);
*/

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
})
app.listen(port, () => console.log('Port: ' + port));

console.log('http://localhost:3000/');