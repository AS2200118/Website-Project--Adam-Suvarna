//Basic handler for the server with db and express coding:
const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const db_acc = require('./db.js')
const db = db_acc.db
const cookieParser = require('cookie-parser');
const server = express()
const port = 3000
const secret_key = 'dnjendidj3ieadamdw48202diwjowosrrrlepoppadamkdiwjdwidadamkdjojo3eadamswdndjiadamdjdjkw'
server.use(cors())
server.use(express.json())
server.use(cookieParser())

//Generate the Token
const generateToken = (id,isAdmin)=> {
    return jwt.sign((id,isAdmin), secret_key, {expiresIn:'3h'})
}

//Verify the Token
const verifyToken = (req,res,next)=> {
    const token = req.cookies.authToken
    if(!token)
        return res.status(401).send('Unauthorized')
    jwt.verify(token, secret_key, (err,details)=> {
        if(err)
            return res.status(403).send('Forbidden')
        req.userDetails = details

        next()
    })
}

//POST request for user registration:
server.post('/user/register', (req,res)=> {
    const name = req.body.name
    const password = req.body.password
    const email = req.body.email
    const admin = parseInt(req.body.admin,10)
    let query = `INSERT INTO USERS (NAME,EMAIL,PASSWORD,ADMIN) VALUES ('${name}','${email}',
    '${password}',${admin})`

    db.run(query, (err)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else
        return res.status(200).send('You have successfully registered!')
    })
})

//POST request for user login:
server.post('/user/login', (req,res)=> {
    const email = req.body.email
    const password = req.body.password
    let query = `SELECT * FROM USERS WHERE EMAIL='${email}' AND PASSWORD='${password}'`
    
    db.get(query, (err,row)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else if(!row)
            return res.send('User does not exist, please register first.')
        else
        return res.status(200).send('Login Successfull!')
    })
})

//GET request for all users in the UsersTable:
server.get('/admin/all-users', (req,res)=> {
    db.all('SELECT * FROM USERS', (err,row)=> {
        if(err)
        {
            return res.status(401).send(err)
        }
        else if(!row)
            return res.send('User does not exist, please register first.')
        else
        return res.status(200).json(row)
    })
})

//GET request using route params for a specific user's Name and Email:
server.get('/admin/user/:name', (req,res)=> {
    db.get(`SELECT NAME,EMAIL FROM USERS WHERE NAME='${req.params.name}'`, (err,row)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else if(!row)
            return res.send(`User with the name "'${req.params.name}'" does not exist`)
        else
        return res.status(200).json(row)
    })
})

//DELETE request for deleting a user by their unique ID:
server.delete('/admin/delete/user/:ID', (req,res)=> {
    const userid = parseInt(req.params.ID,10)
    let query = `DELETE FROM USERS WHERE ID = ${userid}`

    db.run(query, (err)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else
        return res.status(200).send(`User with ID ${userid} has been successfully deleted!`)
    })
})

//POST request for Restaurant:
server.post('/admin/restaurant', (req,res)=> {
    const name = req.body.name
    const location = req.body.location
    const availability = req.body.availability
    const date = req.body.date
    const time = req.body.time
    const categories = req.body.categories
    let query = `INSERT INTO RESTAURANTS (NAME,LOCATION,AVAILABILITY,DATE,TIME,CATEGORIES) VALUES ('${name}',
    '${location}','${availability}','${date}','${time}','${categories}')`

    db.run(query, (err)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else
        return res.status(200).send('You have successfully entered the details required!')
    })
})

//GET request for Restaurant:
server.get('/restaurant/search', (req,res)=> {
    let name = req.query.name
    let categories = req.query.categories
    let date = req.query.date
    let time = req.query.time
    let availability = req.query.availability
    let query = `SELECT NAME,CATEGORIES,DATE,TIME,AVAILABILITY FROM RESTAURANTS WHERE ID>0`
    if(name)
        query+=` AND NAME='${name}'`
     if(categories)
        query+=` AND CATEGORIES='${categories}'`
     if(date)
        query+=` AND DATE='${date}'`
     if(time)
        query+=` AND TIME='${time}'`
     if(availability)
        query+=` AND AVAILABILITY='${availability}'`

    db.all(query, (err,row)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else if(!row)
            return res.send(`Restaurant does not exist`)
        else
        return res.status(200).json(row)
    })
})

//PUT request for reservation
server.put(`/restaurant/reservation`, (req,res)=> {
    let name = req.query.name
    let date = req.query.date
    let time = req.query.time
    let query = `SELECT * FROM RESTAURANTS WHERE NAME='${name}' AND DATE='${date}' AND TIME='${time}'`
    
    db.get(query, (err,row)=> {
        if(err)
        {
            console.log(err)
            return res.send(err)
        }
        else
        {
            let restaurantID= row.ID
            let userID= parseInt(req.body.userID,10)
            let guests= req.body.guests
            let query2= `INSERT INTO RESERVATIONS (USER_ID, RESTAURANT_ID, GUESTS) VALUES (${userID},
            ${restaurantID}, '${guests}')`

            db.run(query2, (err)=> {
                if(err)
                {
                    console.log(err)
                    return res.send(err)
                }
                else
                {
                    let availability= row.availability
                    availability= 'Booked'
                    query= `UPDATE RESTAURANTS SET AVAILABILITY='${availability}' WHERE ID=${restaurantID}`

                    db.run(query, (err)=> {
                        if(err)
                        {
                            console.log(err)
                            res.send(err)
                        }
                        else
                        res.send(`Booking for '${name}' for a table of '${guests}' is Successfull!`)
                    })
                }
            })
        }
    })
})

//

//Server startup + Table run:
server.listen(port,()=> {
    console.log(`Server running at port ${port}`)
    db.serialize(()=> {
        db.run(db_acc.RestaurantsTable, (err)=> {
            if(err)
                console.log("Error creating Restaurant Table" +err)
        });
        db.run(db_acc.UsersTable, (err)=> {
            if(err)
                console.log("Error creating User Table" +err)
        });
        db.run(db_acc.ReservationTable, (err)=> {
            if(err)
                console.log("Error creating Reservation Table" +err)
        });
        db.run(db_acc.MenuTable, (err)=> {
            if(err)
                console.log("Error creating Menu Table" +err)
        });
        db.run(db_acc.ReviewTable, (err)=> {
            if(err)
                console.log("Error creating Review Table" +err)
        });
    })
})

