//Basic handler for the server with db and express coding:
const express = require('express')
const db_acc = require('./db.js')
const db = db_acc.db
const server = express()
const port = 888
server.use(express.json())

//Post request for user registration:
server.post('/user/register', (req,res)=> {
    const name = req.body.name
    const password = req.body.password
    const email = req.body.email
    const admin = req.body.admin
    let query = `INSERT INTO USERS(name,password,email,admin) VALUES (
    '${name}',
    '${password}',
    '${email}'.
    ${admin} )`

    db.run(query, (err)=> {
        if(err)
            return res.status(401).send(err)
        else
        return res.status(200).send('You have successfully registered!')
    })
})

server.get('user/login', (req,res)=> {
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
        return res.send(row)
    })
})

