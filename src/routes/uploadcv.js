const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Connection = require('mysql/lib/Connection');
const encoder = bodyParser.urlencoded({ extended: true });
const connection = require('./dbconnect');
const fileUpload = require('express-fileupload');

function uploadcvroute(app) {
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
      secret : 'secret',
      resave : true,
      saveUninitialized : true
}));

// app.use(fileUpload());
// // route upload file vao thu muc upload
// app.post('/jobdetail/:id', (req, res) =>{
//   console.log(req.body);
//       var name = req.body.name;
//       var email = req.body.email;
//       var phone = req.body.phone;
//       var submitdate = req.body.submitdate;
//       let uploadFile;
//       let uploadPath;
//       if(!req.files || Object.keys(req.files).length === 0){
//             return res.status(400).send('No files were uploaded.');
//       }

//       uploadFile = req.files.cvfile;
//       uploadPath = './upload/' + uploadFile.name;

//       uploadFile.mv(uploadPath, function(err){
//             if(err) return res.status(500).send(err);
//       })

//       connection.query("Select Max(BriefID) as ID from candidate", function(error, results, fields) {
//             if(results[0].ID === 0)
//             {
//                   var newID = 1;
//                   connection.query("Insert into candidate values (?,?,?,?,?,?,?,?)",
//                   [newID,req.params.id,name,email,phone,uploadFile.name,submitdate,''], function(error, results2,fields){
//                         if(!error)
//                         {
//                               connection.query("Select * from hiringreq where ReqID = ?",[req.params.id], function(error, results3, fields){
//                                     if(results3.length > 0)
//                                     {
//                                       connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results4, fields){
//                                         if(error) throw error;
//                                         connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results5, fields){
//                                           if(error) throw error;
//                                           connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results6, fields){
//                                             if(error) throw error;
//                                             connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results7, fields){
//                                               if(error) throw error;
//                                           //   res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
//                                           req.session.message = {
//                                                 type: 'success',
//                                                 message: 'Gửi CV thành công!'
//                                               }
//                                           res.render('jobdetail',{message : req.session.message , query : results3 ,countall : results4, countFull : results5 , countPart : results6, countIntern : results7});
//                                           })
//                                         })
//                                       })
//                                     })
//                                     }
//                                     else{
//                                       res.redirect('/' + req.params.id);
//                                     }
//                                   })
//                         }
//                   })
//             }
//             else
//             {
//                   connection.query("Insert into candidate values (?,?,?,?,?,?,?,?)",
//                   [results[0].ID + 1,req.params.id,name,email,phone,uploadFile.name,submitdate,''], function(error, results2,fields){
//                         if(!error)
//                         {
//                               connection.query("Select * from hiringreq where ReqID = ?",[req.params.id], function(error, results3, fields){
//                                     if(results3.length > 0)
//                                     {
//                                       connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results4, fields){
//                                         if(error) throw error;
//                                         connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results5, fields){
//                                           if(error) throw error;
//                                           connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results6, fields){
//                                             if(error) throw error;
//                                             connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results7, fields){
//                                               if(error) throw error;
//                                           //   res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
//                                           req.session.message = {
//                                                 type: 'success',
//                                                 message: 'Gửi CV thành công!'
//                                               }
//                                           res.render('jobdetail',{message : req.session.message , query : results3 ,countall : results4, countFull : results5 , countPart : results6, countIntern : results7});
//                                           })
//                                         })
//                                       })
//                                     })
//                                     }
//                                     else{
//                                       res.redirect('/' + req.params.id);
//                                     }
//                                   })
//                         }
//                   })
//             }
//       })
// })
}
module.exports = uploadcvroute;
