/*
const { createServer } = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(url);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

*/

/*----------------------------------------------------*/


/*
const { readFile, readFileSync } = require('fs'); 
const { url } = require('node:inspector');
const txt = readFileSync('./test.txt', 'utf8');
console.log(txt);
*/

/*
var http = require('http');
var url = require('url');
var date = require('./module');
var fs = require('fs');
*/

/* add text to file
fs.appendFile('test3.txt', 'test again', function(err){
    if(err) throw err;
    console.log('Saved!');
});
*/

/* replace file
fs.writeFile('test2.txt', 'test again', function(err){
    if(err) throw err;
    console.log('Saved!');
});
*/

/* delete file
fs.unlink('test2.txt', function(err){
    if(err) throw err;
    console.log('Saved!');
});
*/

/* rename file
fs.rename('test.txt', 'test2.txt', function(err){
    if(err) throw err;
    console.log('Saved!');
});
*/
/*
http.createServer(function (req, res){
    fs.readFile('index.html', function(err,data){
        res.writeHead(200, { 'content-type': 'text/html' });

        var q = url.parse(req.url, true).query;
        var txt = q.year + " " + q.month + " " + q.test;
        res.write(txt);
        res.write(data);
        
        return res.end();
    });
    
}).listen(8080);


console.log('http://localhost:8080/');
*/


var http = require('http');
var url = require('url');
var fs = require('fs');

http.createServer(function (req, res){
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;

    fs.readFile(filename, function(err,data){
        if (err){
            res.writeHead(404, { 'content-type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'content-type': 'text/html' });
        res.write(data);
        return res.end();
    });
    
}).listen(3306);

console.log('http://localhost:3306/');



/*
var mysql = require('mysql');

var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'volmed_db'
});

con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT * FROM patients", function (err, result) {
      if (err) throw err;
      console.log("Result: " + JSON.stringify(result));
    });
});

console.log('http://localhost:8080/');
*/