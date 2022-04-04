const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Connection = require('mysql/lib/Connection');
const encoder = bodyParser.urlencoded({ extended: true });
const connection = require('./dbconnect');
const url = require('url');
function userfunc_route(app) {
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
      secret : 'secret',
      resave : true,
      saveUninitialized : true
}));

//lay du lieu trang creatacc de hien thi
app.get('/createacc', (req, res) => {
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
    if (curresults.length > 0 && curresults[0].EmpID <= 1099) {
        res.render('createacc',{data : curresults});
    }
    // else res.redirect('admin');
    else 
    {
      // res.render('admin',{data : curresults});
      res.redirect('/admin');
    }
  })
});

app.use((req, res, next) =>{
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
})

app.post('/createacc', (req, res) => {
  var account = req.body.account;
  var password = req.body.password;
  var name = req.body.name;
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[account], function(error, results, fields) {
    if(results.length > 0)
    {
        req.session.message = {
          type: 'danger',
          message: 'Tên tài khoản đã tồn tại'
        }
        connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
          if (curresults.length > 0) {
              res.render('createacc',{message : req.session.message, data : curresults});
          }
        })
    }
    else{
      connection.query("Select * from userdetail where Name = ?",[name], function(error, results2, fields) {
        if(results2.length > 0)
        {
          var id = results2[0].EmpID;
          connection.query("Insert into user (EmpID, Account, Password) values (?, ?, ?)", [id, account, password], function(error, results3, fields){
          if(error) 
          {
            req.session.message = {
              type: 'danger',
              message: 'Nhân viên đã có tài khoản !'
            }
            connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
              if (curresults.length > 0) {
                  res.render('createacc',{message : req.session.message, data : curresults});
              }
            })
            // throw (error);
          }
          else
          {
            req.session.message = {
              type: 'success',
              message: 'Tạo tài khoản thành công !'
            }
            // res.render('createacc', {message : req.session.message});
            connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
              if (curresults.length > 0) {
                  res.render('createacc',{message : req.session.message, data : curresults});
              }
            })
          }
          })
        }
        else
        {
          req.session.message = {
            type: 'danger',
            message: 'Tên nhân viên không tồn tại'
          }
          // res.render('createacc', {message : req.session.message});
          connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
            if (curresults.length > 0) {
                res.render('createacc',{message : req.session.message, data : curresults});
            }
          })
        }
      })
    }
  })
})

//route cho trang editacc
app.get('/editacc', (req, res) => {
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
    if (curresults.length > 0 && curresults[0].EmpID <= 1099) {
        connection.query("Select * from user inner join userdetail on user.EmpID = userdetail.EmpID inner join department on userdetail.DepartmentID = department.DepartID",function(error, results, fields){
          if(error) throw (error);
          else res.render('editacc',{data : curresults, query : results});
        })
    }
    else res.redirect('/admin');
  })
});
//route xoa nguoi dung
app.get('/deleteuser/:account', (req, res) =>{
  // console.log(req.params.account);
  connection.query("Delete from user where Account = ?",[req.params.account],function(error, results, fields){
    if(!error)
    {
      req.session.message = {
        type: 'success',
        message: 'Xóa thành công!'
      }
      var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
      connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0 && curresults[0].EmpID <= 1099) {
            res.redirect('back');
            // res.render('editacc',{data : curresults, message : req.session.message});
            // res.end();
        }
        else res.redirect('/admin');
      })
    }
    else console.log('Xóa không thành công!');
  })
})
//route sua thong tin nguoi dung
app.get('/edituser/:account', (req, res) =>{
  // console.log(req.params.account);
  connection.query("Select * from user where Account = ?",[req.params.account],function(error, results, fields){
    if(error) throw (error);
    else 
    {
      var olduser = results;
      var curuser = req.session.account;
      connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0 && curresults[0].EmpID <= 1099) {
          res.render('edituser', {query : olduser , data : curresults});
        }
        else res.redirect('/admin');
      })
    }
  })
})
app.get('edituser', (req, res) =>{
  res.render('edituser');
})
app.post('/edituser/:id', (req, res) => {
  var account = req.body.account;
  var password = req.body.password;
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[account], function(error, results, fields) {
    if(results.length > 0)
    {
        req.session.message = {
          type: 'danger',
          message: 'Tên tài khoản đã tồn tại'
        }
        connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
          if (curresults.length > 0) {
              res.redirect('/editacc');
              // res.render('edituser',{message : req.session.message, data : curresults});
              // res.redirect('/editacc');
              // res.end();
          }
        })
    }
    else{
      connection.query("Update user Set Account = ? , Password = ? where Account = ?",[account,password,req.params.id], function(error, results, fields){
        if(!error)
        {
          req.session.message = {
            type: 'success',
            message: 'Cập nhật thông tin tài khoản thành công!'
          }
        connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
          if (curresults.length > 0) {
              // res.render('editacc',{message : req.session.message, data : curresults});
              res.redirect('/editacc');
          }
        })
        }
        else {
          req.session.message = {
            type: 'danger',
            message: 'Cập nhật thông tin tài khoản không thành công!'
          }
          connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
            if (curresults.length > 0) {
                // res.render('edituser',{message : req.session.message, data : curresults});
                res.redirect('/editacc');
            }
          })
        }
      })
    }
  })
})
}
module.exports = userfunc_route;
