const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db', (err)=> {
    if (err) {
        console.error('There was an error connecting to the Database:', err.message);
    }
    else {
        console.log('Connected successfully to the Database.');
    }
});

db.run(`INSERT INTO USER (name,email,password,isadmin) VALUES ('admin','admin','admin',1)`,(err)=>{
    if(err)
        console.log(err.message)
    else
    console.log('admin added successfully!')
})