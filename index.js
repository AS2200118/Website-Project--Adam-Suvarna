//Basic handler for the server with db and express coding:
const express = require('express')
const db_acc = require('./db.js')
const db = db_acc.db
const server = express()
const port = 3000
server.use(express.json())

//Post request for user registration:
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

//Post request for Restaurant:
server.post('/restaurant', (req,res)=> {
    const name = req.body.name
    const location = req.body.location
    const availability = req.body.availability
    const date = req.body.date
    const categories = req.body.categories
    let query = `INSERT INTO RESTAURANTS (NAME,LOCATION,AVAILABILITY,DATE,CATEGORIES) VALUES ('${name}',
    '${location}','${availability}','${date}','${categories}')`

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
        db.run(db_acc.NotificationTable, (err)=> {
            if(err)
                console.log("Error creating Notifaction Table" +err)
        });
    })
})

