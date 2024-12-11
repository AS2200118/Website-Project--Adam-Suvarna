//Basic handler for the database:
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db', (err)=> {
    if (err) {
        console.error('There was an error connecting to the Database:', err.message);
    }
    else {
        console.log('Connected successfully to the Database.');
    }
});

//Now to create the tables:
const RestaurantsTable = `CREATE TABLE IF NOT EXISTS RESTAURANTS(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT NOT NULL,
    LOCATION TEXT NOT NULL,
    AVAILABILITY TEXT NOT NULL,
    DATE TEXT NOT NULL,
    TIME TEXT NOT NULL,
    CATEGORIES TEXT NOT NULL)`;

const UsersTable = `CREATE TABLE IF NOT EXISTS USERS(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT NOT NULL,
    PASSWORD TEXT NOT NULL,
    EMAIL TEXT UNIQUE NOT NULL,
    ISADMIN INT)`;

const ReservationTable = `CREATE TABLE IF NOT EXISTS RESERVATIONS(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    USER_ID INT,
    RESTAURANT_ID INT,
    GUESTS INT NOT NULL, 
    FOREIGN KEY (USER_ID) REFERENCES USERS(ID),
    FOREIGN KEY (RESTAURANT_ID) REFERENCES RESTAURANTS(ID))`;

const MenuTable = `CREATE TABLE IF NOT EXISTS MENU(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    RESTAURANT_ID INT,
    ITEM_ID INT,
    FOREIGN KEY (RESTAURANT_ID) REFERENCES RESTAURANTS(ID),
    FOREIGN KEY (ITEM_ID) REFERENCES ITEM(ID))`;

const ItemTable = `CREATE TABLE IF NOT EXISTS ITEM(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT NOT NULL,
    DESCRIPTION TEXT NOT NULL,
    PRICE TEXT NOT NULL,
    CATEGORY TEXT NOT NULL
    IMAGE TEXT NOT NULL)`;

const ReviewTable = `CREATE TABLE IF NOT EXISTS REVIEWS(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    USER_ID INT,
    RESTAURANT_ID INT,
    RATING INT,
    COMMENT TEXT,
    REPLY TEXT,
    FOREIGN KEY (USER_ID) REFERENCES USERS(ID),
    FOREIGN KEY (RESTAURANT_ID) REFERENCES RESTAURANTS(ID))`;

module.exports = {db, RestaurantsTable, UsersTable, ReservationTable, MenuTable, ReviewTable};