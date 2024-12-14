//Basic handler for the server with db and express coding:
const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const db_acc = require('./db.js')
const db = db_acc.db
const cookieParser = require('cookie-parser');
const server = express()
const port = 2000
const secret_key = 'dnjendidj3ieadamdw48202diwjowosrrrlepoppadamkdiwjdwidadamkdjojo3eadamswdndjiadamdjdjkw'
server.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))
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

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if(err)
        {
            return res.status(500).send('error hashing password')
        }
        let query = `INSERT INTO USERS (NAME,EMAIL,PASSWORD,ISADMIN) VALUES (?,?,?,?)`
    
        db.run(query, [name,email,hashedPassword,0], (err)=> {
            if(err)
            {
                console.log(err)
                return res.status(401).send(err)
            }
            else
            return res.status(200).send('You have successfully registered!')
        })
    })
})

//POST request for user login:
server.post('/user/login', (req,res)=> {
    const email = req.body.email
    const password = req.body.password
    let query = `SELECT * FROM USERS WHERE EMAIL=? AND PASSWORD=?`
    
    db.get(query, [email,password], (err,row)=> {
        bcrypt.compare(password, row.PASSWORD, (err, isMatch) => {
            if(err)
                {
                    console.log(err)
                    return res.status(500).send(err)
                }
                else if(!isMatch)
                    return res.status(401).send('Password is wrong, please try again.')
                else
                {
                    let userID = row.ID
                    let isAdmin = row.ISADMIN
                    const token = generateToken(userID,isAdmin)
                    res.cookie('authToken', token,{
                        sameSite:'strict',
                        secure:true,
                        httpOnly:true,
                        expiresIn:'3h'
                    })
                    return res.status(200).json({ id: userID, admin: isAdmin })
                }
        })
    })
})

//GET request for all users in the UsersTable:
server.get('/admin/all-users', verifyToken, (req,res)=> {
    console.log(req.userDetails)
    const isAdmin = req.userDetails.isAdmin;
    if(isAdmin!==1)
        return res.status(403).send("Forbidden")
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
server.get('/admin/user/:name', verifyToken, (req,res)=> {
    console.log(req.userDetails)
    const isAdmin = req.userDetails.isAdmin;
    if(isAdmin!==1)
        return res.status(403).send("Forbidden")
    db.get(`SELECT NAME,EMAIL FROM USERS WHERE NAME=?`, [req.params.name], (err,row)=> {
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
server.delete('/admin/delete/user/:ID', verifyToken, (req,res)=> {
    console.log(req.userDetails)
    const isAdmin = req.userDetails.isAdmin;
    if(isAdmin!==1)
        return res.status(403).send("Forbidden")
    const userid = parseInt(req.params.ID,10)
    let query = `DELETE FROM USERS WHERE ID =?`

    db.run(query, [userid], (err)=> {
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
server.post('/admin/restaurant', /*verifyToken,*/ (req,res)=> {
    /*console.log(req.userDetails)
    const isAdmin = req.userDetails.isAdmin;
    if(isAdmin!==1)
        return res.status(403).send("Forbidden")*/
    const name = req.body.name
    const location = req.body.location
    const availability = req.body.availability
    const date = req.body.date
    const time = req.body.time
    const categories = req.body.categories
    let query = `INSERT INTO RESTAURANTS (NAME,LOCATION,AVAILABILITY,DATE,TIME,CATEGORIES) VALUES (?,?,?,?,?,?)`

    db.run(query, [name,location,availability,date,time,categories], (err)=> {
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
        query+=` AND NAME=?`
     if(categories)
        query+=` AND CATEGORIES=?`
     if(date)
        query+=` AND DATE=?`
     if(time)
        query+=` AND TIME=?`
     if(availability)
        query+=` AND AVAILABILITY=?`

    db.all(query, [name,categories,date,time,availability], (err,row)=> {
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
    let query = `SELECT * FROM RESTAURANTS WHERE NAME=? AND DATE=? AND TIME=?`
    
    db.get(query, [name,date,time], (err,row)=> {
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
            let query2= `INSERT INTO RESERVATIONS (USER_ID, RESTAURANT_ID, GUESTS) VALUES (?,?,?)`

            db.run(query2, [restaurantID,userID,guests], (err)=> {
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

//POST request to add item:
server.post('/admin/additem', (req,res)=> {
    //console.log(req.userDetails)
    //const isAdmin = req.userDetails.isAdmin;
    //if(isAdmin!==1)
        //return res.status(403).send("Forbidden")
    const name = req.body.name
    const description = req.body.description
    const price = req.body.price
    const category = req.body.category
    let query = `INSERT INTO ITEM (NAME,DESCRIPTION,PRICE,CATEGORY) VALUES ('${name}',
    '${description}','${price}','${category}')`

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

//Put request to add item to restaurant:
server.put('/admin/restaurant/additem', /*verifyToken,*/ (req,res)=> {
    /*console.log(req.userDetails)
    const isAdmin = req.userDetails.isAdmin;
    if(isAdmin!==1)
        return res.status(403).send("Forbidden")*/
    let name = req.query.name
    let category = req.query.category
    let query = `SELECT * FROM ITEM WHERE NAME='${name}' AND CATEGORY='${category}'`

    db.get(query, (err,row)=> {
        if(err)
        {
            console.log(err)
            return res.send(err)
        }
        else
        {
            let itemID= row.ID
            let restaurantID= parseInt(req.body.restaurantID,10)
            let query2= `INSERT INTO MENU (ITEM_ID, RESTAURANT_ID) VALUES (${itemID},
            ${restaurantID})`

            db.run(query2, (err)=> {
                if(err)
                {
                    console.log(err)
                    return res.send(err)
                }
                else
                {
                    res.send(`Item: '${name} added for Restaurant: '${restaurantID}' is Successfull!`)
                }
            })
        }
    })
})

//GET request to get the menu items for a specific restaurant
server.get('/restaurant/menu', (req, res) => {
    const restaurantID = req.query.restaurantID
    const query = `SELECT ITEM.NAME, ITEM.DESCRIPTION, ITEM.PRICE, ITEM.CATEGORY FROM MENU
                   JOIN ITEM ON MENU.ITEM_ID = ITEM.ID JOIN RESTAURANT ON 
                   MENU.RESTAURANT_ID = RESTAURANT.ID WHERE RESTAURANT.ID =${restaurantID}`

    db.all(query, (err, row) => {
        if (err)
        {
            return res.status(401).send(err)
        } 
        else if (!row) 
        {
            return res.send('No menu items found for this restaurant, please check again later.')
        } 
        else 
        {
            return res.status(200).json(row)
        }
    })
})

//DELETE request to delete an item from menu
server.delete('/admin/delete/item/:ID', verifyToken, (req,res)=> {
    console.log(req.userDetails)
    const isAdmin = req.userDetails.isAdmin;
    if(isAdmin!==1)
        return res.status(403).send("Forbidden")
    const restaurantID = parseInt(req.params.restaurantID,10)
    const itemID = parseInt(req.params.itemID,10)
    let query = `DELETE FROM MENU WHERE RESTAURANT_ID = ${restaurantID} AND ITEM_ID = ${itemID}`

    db.run(query, (err)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else
        return res.status(200).send(`Item with ID ${itemID} from Restaurant ID: ${restaurantID} 
    has been successfully deleted!`)
    })
})

//PUT Request for adding review
server.put(`/restaurant/review`, (req,res)=> {
    let name = req.query.name
    let date = req.query.date
    let query = `SELECT * FROM RESTAURANTS WHERE NAME='${name}' AND DATE='${date}'`
    
    db.get(query, (err,row)=> {
        if(err)
        {
            console.log(err)
            return res.send(err)
        }
        else
        {
            let restaurantID= row.ID
            let userID = parseInt(req.body.userID,10)
            let comment = req.body.comment
            let rating = parseInt(req.body.rating,10)
            let query2= `INSERT INTO REVIEWS (USER_ID, RESTAURANT_ID, COMMENT, RATING) VALUES (${userID},
            ${restaurantID}, '${comment}', ${rating})`

            db.run(query2, (err)=> {
                if(err)
                {
                    console.log(err)
                    return res.send(err)
                }
                else
                {
                    res.send(`Review for Restaurant: '${name}' has been added!`)  
                }
            })
        }
    })
})


//GET request to get the reviews
server.get('/restaurant/all-reviews', (req,res)=> {
    db.all('SELECT RATING,COMMENT,REPLY FROM REVIEWS', (err,row)=> {
        if(err)
        {
            return res.status(401).send(err)
        }
        else if(!row)
            return res.send('No reviews are available at the moment, please check again later.')
        else
        return res.status(200).json(row)
    })
})

//GET request for a specific restaurant review
server.get('/review/:restaurant', (req,res)=> {
    db.get(`SELECT RATING.REVIEWS,COMMENT.REVIEWS,REPLY.REVIEWS FROM REVIEWS INNER JOIN 
        RESTAURANTS ON REVIEWS.RESTAURANT_ID = RESTAURANTS.ID WHERE RESTAURANTS.NAME = 
        '${req.params.restaurant}'`, (err,row)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else if(!row)
            return res.send(`Restaurant Does Not Exist`)
        else
        return res.status(200).json(row)
    })
})

//PUT request for admin replying to a review
server.put(`/admin/review-reply`, verifyToken, (req,res)=> {
    console.log(req.userDetails)
    const isAdmin = req.userDetails.isAdmin;
    if(isAdmin!==1)
        return res.status(403).send("Forbidden")
    let userID = req.query.userID
    let restaurantID = req.query.restaurantID
    let reply = req.body.reply
    let query = `SELECT * FROM REVIEWS WHERE USER_ID=${userID} AND RESTAURANT_ID=${restaurantID}`
    
    db.get(query, (err,row)=> {
        if(err)
        {
            console.log(err)
            return res.send(err)
        }
        else if(!row)
        {
            return res.send(`No reviews from User ID: ${userID} and Restaurant ID: ${restaurantID} exist.`)
        }
        else
        {
            let query2= `UPDATE REVIEWS SET REPLY='${reply}' WHERE USER_ID=${userID} AND 
                         RESTAURANT_ID=${restaurantID}`
            db.run(query2, (err)=> {
                if(err)
                {
                    console.log(err)
                    return res.send(err)
                }
                else
                {
                    res.send(`Review added from User ID: ${userID} and Restaurant ID: ${restaurantID} Successfully!`)  
                }
            })
        }
    })
})

//DELETE request for deleting review
server.delete('/admin/delete/review/:ID', verifyToken, (req,res)=> {
    console.log(req.userDetails)
    const isAdmin = req.userDetails.isAdmin;
    if(isAdmin!==1)
        return res.status(403).send("Forbidden")
    const userID = parseInt(req.params.userID,10)
    const reviewID = parseInt(req.params.reviewID,10)
    let query = `DELETE FROM REVIEWS WHERE USER_ID = ${userID} AND REVIEW_ID = ${reviewID}`

    db.run(query, (err)=> {
        if(err)
        {
            console.log(err)
            return res.status(401).send(err)
        }
        else
        return res.status(200).send(`Review with ID ${reviewID} from User ID: ${userID} 
    has been successfully deleted!`)
    })
})

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
        db.run(db_acc.ItemTable, (err)=> {
            if(err)
                console.log("Error creating Item Table" +err)
        });
        db.run(db_acc.ReviewTable, (err)=> {
            if(err)
                console.log("Error creating Review Table" +err)
        });
    })
})

