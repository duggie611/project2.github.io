const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Connection = require('mysql/lib/Connection');
const encoder = bodyParser.urlencoded({ extended: true });
const connection = require('./dbconnect');

function statisticroute(app) {
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
      secret : 'secret',
      resave : true,
      saveUninitialized : true
}));
//thong ke so luong ho so ung tuyen theo tung phong ban
app.get('/statistic1', (req, res) =>{
  var account = req.session.account;
  connection.query("Select * from user where Account = ?",[account],function(error,results,fields){
    if(results.length > 0 && results[0].EmpID >= 1300)
    {
      connection.query("Select department.DepartID as DepartID , department.DepartName as DepartName , Count(BriefID) as briefcount from candidate inner join hiringreq on candidate.ReqID = hiringreq.ReqID inner join department on hiringreq.DepartName = department.DepartName group by department.DepartName",
      function(error,results1,fields){
        if(results1.length > 0)
        {
          res.render('statistic1',{data : results, query : results1});
        }
      })
    }
    else if (results.length > 0){
      res.redirect('dashboard');
    }
    else {
      res.redirect('home');
    }
  })
})
app.get('/statistic2', (req, res) =>{
  var account = req.session.account;
  connection.query("Select * from user where Account = ?",[account],function(error,results,fields){
    if(results.length > 0 && results[0].EmpID >= 1300)
    {
      connection.query("Select hiringreq.ReqID as ReqID, hiringreq.ReqName as ReqName, Count(BriefID) as briefcount from candidate inner join hiringreq on candidate.ReqID = hiringreq.ReqID group by hiringreq.ReqID",
      function(error,results1,fields){
        if(results1.length > 0)
        {
          res.render('statistic2',{data : results, query : results1});
        }
      })
    }
    else if (results.length > 0){
      res.redirect('dashboard');
    }
    else {
      res.redirect('home');
    }
  })
})
app.get('/statistic3', (req, res) =>{
  var account = req.session.account;
  connection.query("Select * from user where Account = ?",[account],function(error,results,fields){
    if(results.length > 0 && results[0].EmpID >= 1300)
    {
      connection.query("Select hiringreq.JobType as JobType, Count(BriefID) as briefcount from candidate inner join hiringreq on candidate.ReqID = hiringreq.ReqID group by hiringreq.JobType",
      function(error,results1,fields){
        if(results1.length > 0)
        {
          res.render('statistic3',{data : results, query : results1});
        }
      })
    }
    else if(results.length > 0)
    {
      res.redirect('dashboard');
    }
    else {
      res.redirect('home');
    }
  })
})
//lay du lieu trang login de hien thi
// app.get('/dashboard', (req, res) => {
//   var account = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
//   connection.query("Select * from user where Account = ?",[account],function(error,results,fields){
//     //Nhan vien xet duyet
//     if (results.length > 0 && results[0].EmpID >= 1101 && results[0].EmpID <= 1199) {
//       connection.query("Select Count(BriefID) as countbrief from candidate", function(error, results1, fields){
//         if(results1.length > 0)
//         {
//           connection.query("Select Count(ReqID) as countreq from hiringreq",function(error, results2, fields){
//             if(results2.length > 0)
//             {
//               connection.query("Select Count(BriefID) as countapproved from approvecand where Status != 'Trúng tuyển' and Status != 'Không đồng ý tuyển'",function(error, results3, fields) {
//                 if(results3.length > 0)
//                 {
//                   res.render('dashboard',{data : results , count1 : results1, count2 : results2, count3 : results3});
//                 }
//               })
//             }
//           })
//         }
//         else res.render('dashboard',{data : results, query : null});
//       })
//     }
//     //nhan vien phong van
//     else if(results.length > 0 && results[0].EmpID >= 1200 && results[0].EmpID <= 1299)
//     {
//       connection.query("Select Count(BriefID) as countbrief from candidate", function(error, results1, fields){
//         if(results1.length > 0)
//         {
//           connection.query("Select Count(ReqID) as countreq from hiringreq",function(error, results2, fields){
//             if(results2.length > 0)
//             {
//               connection.query("Select Count(BriefID) as countwaiting from approvecand where Status = 'Chuẩn bị phỏng vấn'",function(error, results3, fields) {
//                 if(results3.length > 0)
//                 {
//                   res.render('dashboard',{data : results , count1 : results1, count2 : results2, count3 : results3});
//                 }
//               })
//             }
//           })
//         }
//         else res.render('dashboard',{data : results, query : null});
//       })
//     }
//     else if(results.length > 0 && results[0].EmpID >= 1300 || (results[0].EmpID >= 1001 && results[0].EmpID <= 1099))
//     {
//       connection.query("Select Count(BriefID) as countbrief from candidate", function(error, results1, fields){
//         if(results1.length > 0)
//         {
//           connection.query("Select Count(ReqID) as countreq from hiringreq",function(error, results2, fields){
//             if(results2.length > 0)
//             {
//               connection.query("Select Count(BriefID) as countwaiting from approvecand where Status = 'Chuẩn bị phỏng vấn'",function(error, results3, fields) {
//                 if(results3.length > 0)
//                 {
//                   connection.query("Select Count(BriefID) as countpassed from approvecand where Status = 'Trúng tuyển'",function(error, results4, fields ){
//                     if(results4.length > 0)
//                     {
//                       connection.query("Select Count(BriefID) as countnotpassed from approvecand where Status = 'Không đồng ý tuyển'",function(error, results5, fields ){
//                         if(results4.length > 0)
//                         {
//                           connection.query("Select Count(AccountID) as countacc from user",function(error,results6,fields){
//                             if(results6.length > 0)
//                             {
//                               res.render('dashboard', {data : results, count1 : results1, count2 : results2, count3 : results3, count4 : results4, count5 : results5, count6 : results6});

//                             }
//                           })
//                           // res.render('dashboard', {data : results, count1 : results1, count2 : results2, count3 : results3, count4 : results4, count5 : results5});
//                         }
//                       })
//                     }
//                   })
//                 }
//               })
//             }
//           })
//         }
//         else res.render('dashboard',{data : results, query : null});
//       })
//     }
//     else res.redirect('home');
//     console.log(results);
//   })
// });

// app.get('/dashboard' , (req, res) => {
//   res.render('dashboard');
// })
}
module.exports = statisticroute;
