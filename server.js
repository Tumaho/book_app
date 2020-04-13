'use strict';

require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 3030;
const app = express();
const superagent = require('superagent');

app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('./pages/index')
});

app.get('/searches/new', (req, res) => {
    res.render('./pages/searches/new');
});

app.post('/searches',(req,res)=>{
    const title = req.body.input;
    const searchBy = req.body.searchBy;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${title}+in${searchBy}:${title}`;
    superagent.get(url)
    .then(booksData =>{
        let booksArr=[];
        
        booksData.body.items.forEach((element,i) => {
            if (i < 10) {
            const book = new booksObject(element);
            booksArr.push(book);
            }
        });
        res.render('./pages/searches/show',{book:booksArr});
    })
})

function booksObject(ele){
    if(ele.volumeInfo.description != undefined) this.description = ele.volumeInfo.description;
    else this.description = 'NO Descriptions Right Now';
    if(ele.volumeInfo.imageLinks != undefined) this.imageUrl = ele.volumeInfo.imageLinks.thumbnail.replace('http', 'https');
    else this.imageUrl = 'filter';
    this.titleName = ele.volumeInfo.title;
    this.authorName = ele.volumeInfo.authors;
    
}




app.use('*', notFound);
app.use(errorHandler);


function errorHandler(error, req, res) {
    res.status(500).render('./pages/error', {error: error});
}
function notFound(req, res) {
    res.status(404).send('NOT FOUND!!');
}


app.listen(PORT,()=>{
    console.log('listen on:',PORT);
})
