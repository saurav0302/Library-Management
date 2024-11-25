const express = require('express')
const db = require('./config/db')
require('dotenv').config();
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json()) // req body    

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/',(req, res)=>{
    res.send("Welcome to library System...")
})

// USer Routing 
const userRoutes = require('./Routes/userRoutes')
app.use('/user', userRoutes)

// Book Routing
const bookRoutes = require('./Routes/bookRoutes')
app.use('/book', bookRoutes) 

// Admin Routing
const adminRoutes = require('./Routes/adminRoutes')
app.use('/admin', adminRoutes)

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=>{
    console.log("Server Started...")
})