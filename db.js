//Basic handler for the database
const sqlite3 = require('sqlite3').verbose();
const db = newsqlite3.Database('./database.db', (err)=> {
    if (err) {
        console.error('There was an error connecting to the Database:', err.message);
    }
    else {
        console.log('Connected successfully to the Database.');
    }
});

//Now to create the table


