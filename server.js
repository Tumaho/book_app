'use strict';

require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 3030;
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    let SQL = 'SELECT DISTINCT * FROM books_info;';
    client.query(SQL)
        .then(data => {
            let counter = data.rows.length;
            
            res.render('./pages/index',{books:data.rows , count:counter} );
        })
    

});

app.get('/searches/new', (req, res) => {
    res.render('./pages/searches/new');
});
let booksArr = [];
app.post('/searches', (req, res) => {
    const title = req.body.input;
    const searchBy = req.body.searchBy;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${title}+in${searchBy}:${title}`;
    superagent.get(url)
        .then(booksData => {
            let booksArr2 = [];

            booksData.body.items.forEach((element, i) => {
                if (i < 10) {
                    const book = new booksObject(element);
                    booksArr.push(book);
                    booksArr2.push(book);
                    
                }
            });
            res.render('./pages/searches/show', { book: booksArr2 });
        })
})

function booksObject(ele) {
    if (ele.volumeInfo.description != undefined) this.description = ele.volumeInfo.description;
    else this.description = 'NO Descriptions Right Now';
    if (ele.volumeInfo.imageLinks != undefined) this.imageUrl = ele.volumeInfo.imageLinks.thumbnail.replace('http', 'https');
    else this.imageUrl = 'filter';
    this.titleName = ele.volumeInfo.title;
    this.authorName = ele.volumeInfo.authors;
    if (ele.volumeInfo.industryIdentifiers != undefined) this.ISBN=ele.volumeInfo.industryIdentifiers[0].identifier; 
    else this.ISBN = 'hhhhhhhhhhhhhhhhh';
    
    this.id=ele.id;

}

app.post('/obada/:id',(req,res)=>{
    let unique = req.params.id;
    let bookshelf = req.body.bookshelf;
    booksArr.forEach(val =>{
        if(unique === val.id){
            
            let SQL = 'INSERT INTO books_info (url,title,author,description,isbn,bookshelf,bookID) VALUES ($1,$2,$3,$4,$5,$6,$7);';
            let safeValues = [val.imageUrl,val.titleName,val.authorName,val.description,val.ISBN,bookshelf,val.id];
            client.query(SQL,safeValues)
            .then(data =>{
                
                console.log('done');
            })
            let SQL2 = `SELECT * FROM books_info WHERE bookID = '${val.id}';`;
            client.query(SQL2)
            .then(data =>{
                res.render('pages/books/details',{details:data.rows[0]});
            })

        }
    })
})

app.get('/obada/:id',(req,res)=>{
    let unique = req.params.id;
    let SQL = `SELECT * FROM books_info WHERE id = '${unique}';`;
            client.query(SQL)
            .then(data =>{
                console.log('ooooooooooooooooooooooooooooo',data.rows[0].isbn);

                res.render('pages/books/details',{details:data.rows[0]});
            })
})




app.use('*', notFound);
app.use(errorHandler);


function errorHandler(error, req, res) {
    res.status(500).render('./pages/error', { error: error });
}
function notFound(req, res) {
    res.status(404).send('NOT FOUND!!');
}


client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listening on PORT ${PORT}`);
        })
    })
