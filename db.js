//Basic handler for the database:
const sqlite3 = require('sqlite3').verbose();
const db = newsqlite3.Database('./database.db', (err)=> {
    if (err) {
        console.error('There was an error connecting to the Database:', err.message);
    }
    else {
        console.log('Connected successfully to the Database.');
    }
});

//Now to create the tables + error handling:
const RestaurantsTable = `CREATE TABLE IF NOT EXISTS restaurants(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    location TEXT,
    cuisine TEXT,
    availability TEXT,
    categories TEXT)`;
db.run(RestaurantsTable, (err)=> {
    if (err) {
        return console.error("Error creating Restaurant Table:", err.message);
    }
    console.log("Restaurant Table created successfully");
});

const UsersTable = `CREATE TABLE IF NOT EXISTS users(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT)`;
db.run(UsersTable, (err)=> {
    if (err) {
        return console.error("Error creating Users Table:", err.message);
    }
    console.log("User Table created successfully");
});

const ReservationTable = `CREATE TABLE IF NOT EXISTS reservation(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ID INTEGER,
    restaurant_ID INTEGER,
    date TEXT,
    time TEXT,
    status TEXT,
    FOREIGN KEY (user_ID) REFERENCES users(ID),
    FOREIGN KEY (restaurant_ID) REFERENCES restaurants(ID))`;
db.run(ReservationTable, (err)=> {
    if (err) {
        return console.error("Error creating Reservation Table:", err.message);
        }
    console.log("Reservation Table created successfully");
});

const MenuTable = `CREATE TABLE IF NOT EXISTS menu(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_ID INTEGER,
    item_name TEXT,
    description TEXT,
    price INTEGER,
    image TEXT,
    FOREIGN KEY (restaurant_ID) REFERENCES restuarnts(ID))`;
db.run(MenuTable, (err)=> {
    if (err) {
        return console.error("Error creating Menu Table:", err.message);
    }
    console.log("Menu Table created successfully");
});

const ReviewTable = `CREATE TABLE IF NOT EXISTS reviews(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ID INTEGER,
    restaurant_ID INTEGER,
    rating INTEGER,
    comment TEXT,
    reply TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_ID) REFERENCES restaurants(ID))`;
db.run(ReviewTable, (err)=> {
    if (err) {
        return console.error("Error creating Review Table:", err.message);
    }
    console.log("Review Table created successfully");
});

const NotifactionTable = `CREATE TABLE IF NOT EXISTS notifactions(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ID INTEGER,
    message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_ID) REFERENCES users(ID))`;
db.run(NotifactionTable, (err)=> {
    if (err) {
        return console.error("Error creating Notifactions Table:", err.message);
    }
    console.log("Notifactions Table created successfully");
});

