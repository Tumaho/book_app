DROP TABLE IF EXISTS books_info;

CREATE TABLE books_info (
    id SERIAL PRIMARY KEY,
    url TEXT,
    title TEXT,
    author TEXT,
    description TEXT,
    isbn TEXT,
    bookshelf TEXT,
    bookID TEXT
);

