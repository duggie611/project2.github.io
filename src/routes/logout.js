const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Connection = require('mysql/lib/Connection');
const encoder = bodyParser.urlencoded({ extended: true });
const connection = require('./dbconnect');

function logoutroute(app) {
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
      secret : 'secret',
      resave : true,
      saveUninitialized : true
}));

app.get('/logout', (req, res) => {
    req.session.destroy((err) =>{
        if(err) throw err;
        res.redirect('/login');
    });
})
}
module.exports = logoutroute;
