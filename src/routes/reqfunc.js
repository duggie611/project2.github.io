const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Connection = require('mysql/lib/Connection');
const encoder = bodyParser.urlencoded({ extended: true });
const connection = require('./dbconnect');
const url = require('url');
const { is } = require('express/lib/request');
function reqfunc_route(app) {
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
      secret : 'secret',
      resave : true,
      saveUninitialized : true
}));
app.get('/createreq', (req, res) => {
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
    if (curresults.length > 0) {
        res.render('createreq',{data : curresults});
    }
    else res.redirect('home');
    console.log(curresults);
  })
});
app.use((req, res, next) =>{
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
})
app.post('/createreq', (req, res) =>{
  var reqname = req.body.reqname;
  var salary = req.body.salary;
  var departname = req.body.departname;
  var startdate = req.body.startdate;
  var deadline = req.body.deadline;
  var jobtype = req.body.jobtype;
  var jobdetail = req.body.jobdetail;
  var curuser = req.session.account;
  connection.query("Select * from department where Departname = ?",[departname], function(error, results, fields){
    if(results.length > 0)
    {
      connection.query("Select * from hiringreq where Reqname = ? and StartDate = ? and Deadline = ? and JobType = ?",[reqname,startdate,deadline,jobtype],
      function(error, results2, fields) {
        if(results2.length > 0)
        {
          req.session.message = {
            type: 'danger',
            message: 'Yêu cầu tuyển dụng đã tồn tại!'
          }
          connection.query("Select * from user where Account = ?",[curuser], function(error, curresults, fields) {
            if(curresults.length > 0)
            {
              res.render('createreq',{message : req.session.message, data : curresults});
            }
          })
        }
        else
        {
          connection.query("Select Max(ReqID) as ID from hiringreq", function(error, results4, fields){
            if(results4[0].ID === 0)
            {
              var newid = 1;
              connection.query("Insert into hiringreq values(?,?,?,?,?,?,?,?)",
              [newid,reqname,salary,departname,startdate,deadline,jobdetail,jobtype],function(error, results5,fields){
                if(!error)
                {
                  req.session.message = {
                    type: 'success',
                    message: 'Tạo yêu cầu tuyển dụng thành công!'
                  }
                  connection.query("Select * from user where Account = ?",[curuser], function(error, curresults, fields) {
                    if(curresults.length > 0)
                    {
                      res.render('createreq',{message : req.session.message, data : curresults});
                    }
                  })
                }
              })
            }
            else
            {
              connection.query("Insert into hiringreq values(?,?,?,?,?,?,?,?)",
              [results4[0].ID + 1,reqname,salary,departname,startdate,deadline,jobdetail,jobtype],function(error, results5,fields){
                if(!error)
                {
                  req.session.message = {
                    type: 'success',
                    message: 'Tạo yêu cầu tuyển dụng thành công!'
                  }
                  connection.query("Select * from user where Account = ?",[curuser], function(error, curresults, fields) {
                    if(curresults.length > 0)
                    {
                      res.render('createreq',{message : req.session.message, data : curresults});
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
    else{
      req.session.message = {
        type: 'danger',
        message: 'Tên phòng ban không tồn tại!'
      }
      // res.render('createacc', {message : req.session.message});
      connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0) {
            res.render('createreq',{message : req.session.message, data : curresults});
        }
      })
    }
  })
})
// xuat cac yeu cau tuyen dung ra
app.get('/showhiring', (req,res) =>{
  connection.query("Select * from hiringreq", function(error, results, fields){
    if(results.length > 0)
    {
      connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
        if(error) throw error;
        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
              if(error) throw error;
              connection.query("Select distinct DepartName from hiringreq",function(error,results6,fields){
                if(error) throw error;
                res.render('showhiring', {hiringquery : results, countall : results2, countFull : results3 , countPart : results4, countIntern : results5, departsort : results6});
              })
          })
        })
      })
    })
    }
    else{
      res.send("Yêu cầu tuyển dụng không tồn tại!!!");
    }
  })
})
// route den trang tim kiem yeu cau viec lam theo tung loai
app.get('/showhiring/:id', (req, res) => {
  connection.query("Select * from hiringreq where JobType = ?",[req.params.id],function(error,results,fields){
    if(results.length > 0)
    {
      connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
        if(error) throw error;
        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
              if(error) throw error;
              connection.query("Select distinct DepartName from hiringreq",function(error,results6,fields){
                if(error) throw error;
                res.render('showhiring', {hiringquery : results, countall : results2, countFull : results3 , countPart : results4, countIntern : results5, departsort : results6});
              })
          })
        })
      })
    })
  }
  else if(results.length == 0 && req.params.id != 'Full-time' && req.params.id != 'Part-time' && req.params.id != 'Thực tập sinh')
  {
    connection.query("Select * from hiringreq where DepartName = ?",[req.params.id],function(error,results,fields){
      if(results.length > 0)
      {
        connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
              if(error) throw error;
              connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
                if(error) throw error;
                connection.query("Select distinct DepartName from hiringreq",function(error,results6,fields){
                  if(error) throw error;
                  res.render('showhiring', {hiringquery : results, countall : results2, countFull : results3 , countPart : results4, countIntern : results5, departsort : results6});
                })
            })
          })
        })
      })
      }
      else
      {
        connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
              if(error) throw error;
              connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
                if(error) throw error;
                connection.query("Select distinct DepartName from hiringreq",function(error,results6,fields){
                  if(error) throw error;
                  res.render('showhiring', {hiringquery : results, countall : results2, countFull : results3 , countPart : results4, countIntern : results5, departsort : results6});
                })
            })
          })
        })
      })
      }
    })
  }
  else{
    connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
      if(error) throw error;
      connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
        if(error) throw error;
        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
            if(error) throw error;
            connection.query("Select distinct DepartName from hiringreq",function(error,results6,fields){
              if(error) throw error;
              res.render('showhiring', {hiringquery : results, countall : results2, countFull : results3 , countPart : results4, countIntern : results5, departsort : results6});
            })
        })
      })
    })
  })
  }
})
})

// route den trang xoa, sua yeu cau
app.get('/allreq', (req, res) => {
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
    if (curresults.length > 0) {
        connection.query("Select * from hiringreq",function(error, results, fields){
          if(error) throw (error);
          else res.render('allreq',{data : curresults, query : results});
        })
    }
    else res.redirect('home');
  })
});
//route xoa yeu cau
app.get('/deletereq/:id', (req, res) =>{
  // console.log(req.params.account);
  connection.query("Delete from hiringreq where ReqID = ?",[req.params.id],function(error, results, fields){
    if(!error)
    {
      req.session.message = {
        type: 'success',
        message: 'Xóa yêu cầu thành công!'
      }
      var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
      connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0) {
            res.redirect('back');
            // res.render('/editreq',{data : curresults, message : req.session.message});
            // res.end();
        }
        else res.redirect('home');
      })
    }
    else console.log('Xóa không thành công!');
  })
})
//route sua thong tin nguoi dung
app.get('/editreq/:id', (req, res) =>{
  // console.log(req.params.account);
  connection.query("Select * from hiringreq where ReqID = ?",[req.params.id],function(error, results, fields){
    if(results.length == 0)
    {
      res.redirect('/' + req.params.id);
    }
    else 
    {
      var oldreq = results;
      var curuser = req.session.account;
      connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0) {
          res.render('editreq', {query : oldreq , data : curresults});
        }
      })
      // res.render('edituser', {query : olduser });
      // res.redirect('edituser');
    }
  })
})
// app.get('editreq', (req, res) =>{
//   res.render('editreq');
// })
app.post('/editreq/:id', (req, res) => {
  var reqname = req.body.reqname;
  var salary = req.body.salary;
  var departname = req.body.departname;
  var startdate = req.body.startdate;
  var deadline = req.body.deadline;
  var jobtype = req.body.jobtype;
  var jobdetail = req.body.jobdetail;
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from hiringreq where ReqName = ? and Salary = ? and DepartName = ? and StartDate = ? and Deadline = ? and JD = ? and JobType = ?"
  ,[reqname,salary,departname,startdate,deadline,jobdetail,jobtype], function(error, results, fields) {
    if(results.length > 0)
    {
        req.session.message = {
          type: 'danger',
          message: 'Yêu cầu tuyển dụng đã tồn tại!'
        }
        res.redirect('/allreq')
    }
    else{
      connection.query("Update hiringreq Set ReqName = ? , Salary = ? , DepartName = ? , StartDate = ? , Deadline = ? , JD = ? , JobType = ? where ReqID = ?",
      [reqname,salary,departname,startdate,deadline,jobdetail,jobtype,req.params.id], function(error, results, fields){
        if(!error)
        {
          req.session.message = {
            type: 'success',
            message: 'Cập nhật thông tin yêu cầu tuyển dụng thành công!'
          }
        connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
          if (curresults.length > 0) {
              // res.render('editacc',{message : req.session.message, data : curresults});
              // res.render('allreq',{message : req.session.message, data : curresults});
              res.redirect('/allreq');
          }
        })
        }
        else {
          req.session.message = {
            type: 'danger',
            message: 'Cập nhật thông tin yêu cầu tuyển dụng không thành công!'
          }
          connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
            if (curresults.length > 0) {
                // res.render('edituser',{message : req.session.message, data : curresults});
                // res.render('allreq',{message : req.session.message, data : curresults});
                res.redirect('/allreq');
            }
          })
        }
      })
    }
  })
})
// route xem thong tin chi tiet ve cac cong viec
app.get('/jobdetail/:id', (req, res) =>{
  connection.query("Select * from hiringreq where ReqID = ?",[req.params.id],function(error, results, fields){
    if(results.length == 0) 
    {
      res.redirect('/' + req.params.id);
    }
    else 
    {
      var curreq = results;
      connection.query("Select * from hiringreq", function(error, results1, fields){
        if(results1.length > 0)
        {
          connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
              if(error) throw error;
              connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
                if(error) throw error;
                connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
                  if(error) throw error;
                  connection.query("Select distinct(DepartName) from hiringreq",function(error,results6,fields){
                    if(error) throw error;
                      res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5, departsort : results6});
                  })
                // res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
              })
            })
          })
        })
        }
        else{
          res.redirect('/' + req.params.id);
        }
      })
    }
  })
})
app.post('/showhiring', (req, res) => {
  connection.query("Select * from hiringreq where ReqName LIKE ?",['%' + req.body.titlesearch + '%'], function(error, results, fields){
    if(results.length > 0)
    {
      connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
        if(error) throw error;
        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
              if(error) throw error;
            res.render('showhiring', {hiringquery : results, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
          })
        })
      })
    })
    }
    else{
      connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
        if(error) throw error;
        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
              if(error) throw error;
            res.render('showhiring', {hiringquery : null, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
          })
        })
      })
    })
    }
  })
})
app.post('/jobdetail/:id', (req, res) => {
  connection.query("Select * from hiringreq where ReqName LIKE ?",['%' + req.body.titlesearch + '%'], function(error, results, fields){
    if(results.length > 0)
    {
      connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
        if(error) throw error;
        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
              if(error) throw error;
            res.render('showhiring', {hiringquery : results, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
          })
        })
      })
    })
    }
    else{
      connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results2, fields){
        if(error) throw error;
        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results3, fields){
          if(error) throw error;
          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results4, fields){
            if(error) throw error;
            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results5, fields){
              if(error) throw error;
            res.render('showhiring', {hiringquery : null, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
          })
        })
      })
    })
    }
  })
})
}
module.exports = reqfunc_route;
