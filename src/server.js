const path = require('path');
const express = require('express'); //goi thu vien
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const session = require('express-session');
const app = express();
const port = 3000;
const mysql = require('mysql');
const connection = require('./routes/dbconnect');
const fileUpload = require('express-fileupload');
const fetch = require("isomorphic-fetch");
const hbs = handlebars.create({
  extname:'.hbs',
  helpers: {
  compare: function(lvalue, rvalue, options) {

    if (arguments.length < 3)
      throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    var operator = options.hash.operator || "==";

    var operators = {
      '==':       function(l,r) { return l == r; },
      '===':      function(l,r) { return l === r; },
      '!=':       function(l,r) { return l != r; },
      '<':        function(l,r) { return l < r; },
      '>':        function(l,r) { return l > r; },
      '<=':       function(l,r) { return l <= r; },
      '>=':       function(l,r) { return l >= r; },
      'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
      throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
}
})

// dung cac file route
const loginroutes = require('./routes/login');
const logoutroutes = require('./routes/logout');
const dashboardroutes = require('./routes/dashboard');
const userfunc_routes = require('./routes/userfunc');
const reqfunc_routes = require('./routes/reqfunc');
const uploadcv_routes = require('./routes/uploadcv');
const cvfunc_routes = require('./routes/cvfunc');
const statistic_routes = require('./routes/statistic');
//chi den file public
app.use(express.static(path.join(__dirname,'public'))); 
app.use(express.urlencoded({
  extended: true
})); //middleware lay du lieu tu form gui len
app.use(express.json());

// // HTTP logger
// app.use(morgan('combined'))

//Template engine
// app.engine('hbs',handlebars({
//     extname:'.hbs' //doi lai duoi file
// }));

app.engine("hbs", hbs.engine);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname,'resources/views')); //chi den dung thu muc views chua template
// console.log('PATH :',path.join(__dirname,'resources/views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
      secret : 'secret',
      resave : true,
      saveUninitialized : true
}));

app.use(fileUpload());
// route upload file vao thu muc upload
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
app.post('/jobdetail/:id', (req, res) =>{
  console.log(req.body);
      var name = req.body.name;
      var email = req.body.email;
      var phone = req.body.phone;
      var submitdate = req.body.submitdate;

      // getting site key from client side
      const response_key = req.body["g-recaptcha-response"];
      // Put secret key here, which we get from google console
      const secret_key = "6LcnT6geAAAAALCXwcjuULcBvCqWQFw4AUjAdd-v";
      const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
      fetch(url, {
        method: "post",
      })
        .then((response) => response.json())
        .then((google_response) => {
     
          // google_response is the object return by
          // google as a response
          if (google_response.success == true) {
            //   if captcha is verified
            // return res.send({ response: "Successful" });
            let uploadFile;
            let uploadPath;
            if(!req.files || Object.keys(req.files).length === 0){
                  return res.status(400).send('No files were uploaded.');
            }
      
            uploadFile = req.files.cvfile;
            uploadPath = './upload/' + uploadFile.name;
      
            uploadFile.mv(uploadPath, function(err){
                  if(err) return res.status(500).send(err);
            })
            connection.query("Select Max(BriefID) as ID from candidate", function(error, results, fields) {
            if(results[0].ID === 0)
            {
                  var newID = 1;
                  connection.query("Insert into candidate values (?,?,?,?,?,?,?,?)",
                  [newID,req.params.id,name,email,phone,uploadFile.name,submitdate,null], function(error, results2,fields){
                        if(!error)
                        {
                              connection.query("Select * from hiringreq where ReqID = ?",[req.params.id], function(error, results3, fields){
                                    if(results3.length > 0)
                                    {
                                      connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results4, fields){
                                        if(error) throw error;
                                        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results5, fields){
                                          if(error) throw error;
                                          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results6, fields){
                                            if(error) throw error;
                                            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results7, fields){
                                              if(error) throw error;
                                          //   res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
                                          req.session.message = {
                                                type: 'success',
                                                message: 'Gửi CV thành công!'
                                              }
                                          res.render('jobdetail',{message : req.session.message , query : results3 ,countall : results4, countFull : results5 , countPart : results6, countIntern : results7});
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
            }
            else
            {
                  connection.query("Insert into candidate values (?,?,?,?,?,?,?,?)",
                  [results[0].ID + 1,req.params.id,name,email,phone,uploadFile.name,submitdate,null], function(error, results2,fields){
                        if(!error)
                        {
                              connection.query("Select * from hiringreq where ReqID = ?",[req.params.id], function(error, results3, fields){
                                    if(results3.length > 0)
                                    {
                                      connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results4, fields){
                                        if(error) throw error;
                                        connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results5, fields){
                                          if(error) throw error;
                                          connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results6, fields){
                                            if(error) throw error;
                                            connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results7, fields){
                                              if(error) throw error;
                                              connection.query("Select distinct DepartName from hiringreq",function(error, results8,fields){
                                                if(error) throw error;
                                                req.session.message = {
                                                  type: 'success',
                                                  message: 'Gửi CV thành công!'
                                                }
                                                res.render('jobdetail',{message : req.session.message , query : results3 ,countall : results4, countFull : results5 , countPart : results6, countIntern : results7, departsort : results8});
                                              })
                                          //   res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
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
            }
      })
          } else {
            // if captcha is not verified
            connection.query("Select * from hiringreq where ReqID = ?",[req.params.id], function(error, results3, fields){
              if(results3.length > 0)
              {
                connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results4, fields){
                  if(error) throw error;
                  connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results5, fields){
                    if(error) throw error;
                    connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results6, fields){
                      if(error) throw error;
                      connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results7, fields){
                        if(error) throw error;
                        connection.query("Select distinct DepartName from hiringreq",function(error,results8,fields){
                          if(error) throw error;
                          req.session.message = {
                            type: 'danger',
                            message: 'Vui lòng điền captcha!'
                          }
                          res.render('jobdetail',{message : req.session.message , query : results3 ,countall : results4, countFull : results5 , countPart : results6, countIntern : results7, departsort : results8});
                        })
                    //   res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
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
        .catch((error) => {
            // Some error while verify captcha
          return res.json({ error });
        });
      // let uploadFile;
      // let uploadPath;
      // if(!req.files || Object.keys(req.files).length === 0){
      //       return res.status(400).send('No files were uploaded.');
      // }

      // uploadFile = req.files.cvfile;
      // uploadPath = './upload/' + uploadFile.name;

      // uploadFile.mv(uploadPath, function(err){
      //       if(err) return res.status(500).send(err);
      // })

      // connection.query("Select Max(BriefID) as ID from candidate", function(error, results, fields) {
      //       if(results[0].ID === 0)
      //       {
      //             var newID = 1;
      //             connection.query("Insert into candidate values (?,?,?,?,?,?,?,?)",
      //             [newID,req.params.id,name,email,phone,uploadFile.name,submitdate,''], function(error, results2,fields){
      //                   if(!error)
      //                   {
      //                         connection.query("Select * from hiringreq where ReqID = ?",[req.params.id], function(error, results3, fields){
      //                               if(results3.length > 0)
      //                               {
      //                                 connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results4, fields){
      //                                   if(error) throw error;
      //                                   connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results5, fields){
      //                                     if(error) throw error;
      //                                     connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results6, fields){
      //                                       if(error) throw error;
      //                                       connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results7, fields){
      //                                         if(error) throw error;
      //                                     //   res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
      //                                     req.session.message = {
      //                                           type: 'success',
      //                                           message: 'Gửi CV thành công!'
      //                                         }
      //                                     res.render('jobdetail',{message : req.session.message , query : results3 ,countall : results4, countFull : results5 , countPart : results6, countIntern : results7});
      //                                     })
      //                                   })
      //                                 })
      //                               })
      //                               }
      //                               else{
      //                                 res.redirect('/' + req.params.id);
      //                               }
      //                             })
      //                   }
      //             })
      //       }
      //       else
      //       {
      //             connection.query("Insert into candidate values (?,?,?,?,?,?,?,?)",
      //             [results[0].ID + 1,req.params.id,name,email,phone,uploadFile.name,submitdate,''], function(error, results2,fields){
      //                   if(!error)
      //                   {
      //                         connection.query("Select * from hiringreq where ReqID = ?",[req.params.id], function(error, results3, fields){
      //                               if(results3.length > 0)
      //                               {
      //                                 connection.query("Select Count(ReqID) as Count from hiringreq", function(error, results4, fields){
      //                                   if(error) throw error;
      //                                   connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Full-time'", function(error, results5, fields){
      //                                     if(error) throw error;
      //                                     connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Part-time'", function(error, results6, fields){
      //                                       if(error) throw error;
      //                                       connection.query("Select Count(ReqID) as Count from hiringreq where JobType = 'Thực tập sinh'", function(error, results7, fields){
      //                                         if(error) throw error;
      //                                     //   res.render('jobdetail', {query : curreq, countall : results2, countFull : results3 , countPart : results4, countIntern : results5});
      //                                     req.session.message = {
      //                                           type: 'success',
      //                                           message: 'Gửi CV thành công!'
      //                                         }
      //                                     res.render('jobdetail',{message : req.session.message , query : results3 ,countall : results4, countFull : results5 , countPart : results6, countIntern : results7});
      //                                     })
      //                                   })
      //                                 })
      //                               })
      //                               }
      //                               else{
      //                                 res.redirect('/' + req.params.id);
      //                               }
      //                             })
      //                   }
      //             })
      //       }
      // })
})
//Khoi tao tuyen duong
app.get('/', (req, res) => {
  res.redirect('/showhiring');
});
app.get('/home', (req, res) => {
  res.redirect('/showhiring');
});

app.get('/search', (req, res) => {
  res.render('search');
});
// app.post('/jobdetail/:id', (req, res) => {
//   console.log(req.body);
//   // res.render('search');
// });
loginroutes(app);
logoutroutes(app);
dashboardroutes(app);
userfunc_routes(app);
reqfunc_routes(app);

uploadcv_routes(app);
cvfunc_routes(app);
statistic_routes(app);
//127.0.0.1 - localhost
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})