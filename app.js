const fs = require('fs');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 3000;

/*sql*/
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "volmed_db"
});
con.connect(err => {
  if (err) throw err;
  console.log("Connected!");
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))

const routes = { 
    search: '/search', 
    register: '/register' 
}

app.get("/", (req, res) =>{
  res.render('index')
})

app.post('/search', (req, res) =>{
  const id = req.body.id;
  const query = 'SELECT * FROM patients WHERE id = ?';

  con.query(query, [id], (err,results)=>{
    if (err) throw err;
    if (results.length>0) {
      res.render('search', {
        data: results[0]
      })
    }
    else{
      res.send('No results');
    }
  })
})

app.use(express.static('public'));




/*
app.use(express.static(__dirname+'/public'));
*/
/*
app.use((req, res) =>{
  res.status(404);
  res.send('<h1>Not found</h1>')
})
*/
/*
app.get('/', function(req, res){
  res.sendFile(__dirname+'/public/index');
})



app.post(routes.search, (req, res) => {
  console.log(
    `id: ${req.body.id}`,
  );
  res.send(
    `id: ${req.body.id}`,
  );
});

*/
/*
app.get('/', function(req, res) {
    const searchTerm = req.query.term;
    if (!searchTerm) {
        return res.status(400)
            .json(
                {
                    error: 'Search term is required'
                }
            );
    }

    const query = `
    SELECT * FROM patients
    WHERE id = ?
    `;

    // Use '%' to perform a partial match
    //const searchValue = `%${searchTerm}%`;
    const searchValue = searchTerm;

    con.query(query, [searchValue, searchValue],
        function(err, results) {
            if (err) {
                console
                    .error('Error executing search query:', err);
                return res.status(500)
                    .json(
                        {
                            error: 'Internal server error'
                        });
            }

            res.json(results[0].lastName);
            console.log(results[0].lastName);
        });
});
*/

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));