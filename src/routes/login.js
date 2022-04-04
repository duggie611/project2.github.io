const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Connection = require('mysql/lib/Connection');
const encoder = bodyParser.urlencoded({ extended: true });
const connection = require('./dbconnect');

function loginroute(app) {
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
      secret : 'secret',
      resave : true,
      saveUninitialized : true
}));
//lay du lieu trang login de hien thi
app.get('/login', (req, res) => { 
  res.render('login');
});

//gui du lieu nhap tai trang login
app.post('/login', (req, res) => {
  var account = req.body.account;
  var password = req.body.password;
  connection.query("Select * from user where Account = ? and Password = ?",[account,password],function(error,results,fields){
    if (results.length > 0) {
        req.session.account = account;
        // req.session.save(function(err) {})
        res.send('<script language="javascript">alert("Đăng nhập thành công!!"); window.location = "dashboard"</script>');
    } else {
        res.send('<script language="javascript">alert("Sai tài khoản hoặc mật khẩu!!"); window.location = "login"</script>');
        // res.redirect("/"); // ko dung dc res.redirect sau res.send
    }
  res.end();
});
})
}
module.exports = loginroute;
