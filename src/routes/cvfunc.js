const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Connection = require('mysql/lib/Connection');
const encoder = bodyParser.urlencoded({ extended: true });
const connection = require('./dbconnect');
const fileUpload = require('express-fileupload');
const fs = require('fs');
function cvfuncroute(app) {
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
      secret : 'secret',
      resave : true,
      saveUninitialized : true
}));
// route lay thong tin cac ung vien
app.get('/allcandidate', (req, res) => {
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
    if (curresults.length > 0) {
        connection.query("Select * from candidate",function(error, results, fields){
          if(error) throw (error);
          else res.render('allcandidate',{data : curresults, query : results});
        })
    }
    else res.redirect('home');
  })
});
app.get('/read/:name', (req, res) =>{
  var filename = req.params.name;
  var tempFile ="./upload/" + filename;
  fs.readFile(tempFile, function (err,data){
     res.contentType("application/pdf");
     res.send(data);
  })
});
// route xoa ho so ung vien
app.get('/deletecandidate/:id', (req, res) =>{
  connection.query("Select CVFile from candidate where BriefID = ?",[req.params.id], function(error, query, fields){
    if(!error)
    {
      var filename = query[0].CVFile;
      var tempFile ="./upload/" + filename;
      fs.unlink(tempFile, function(err,data){
        if (err) {
          console.error(err)
          return
        }
      })
    }
  })
  connection.query("Delete from candidate where BriefID = ?",[req.params.id],function(error, results, fields){
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
        }
        else res.redirect('home');
      })
    }
    else console.log('Xóa không thành công!');
  })
})
// route xet duyet ho so
app.get('/addcandidate/:id', (req, res) =>{
  connection.query("Select * from candidate where BriefID = ?",[req.params.id], function(error, results, fields) {
    if(results.length == 0)
    {
      res.redirect('/' + req.params.id);
    }
    else 
    {
      var oldreq = results;
      var curuser = req.session.account;
      connection.query("Select * from user inner join userdetail on user.EmpID = userdetail.EmpID where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0) {
          res.render('addcandidate', {query : oldreq , data : curresults});
        }
      })
    }
  })
})
app.post('/addcandidate/:id', (req, res) =>{
  var briefid = req.body.briefid;
  var reqid = req.body.reqid;
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var experience = req.body.experience;
  var language = req.body.language;
  var itskill = req.body.itskill;
  var academic = req.body.academic;
  var status = req.body.statustype;
  var submitdate = req.body.submitdate;
  var approver = req.body.approver;
  var approveddate = req.body.approveddate;
  var curuser = req.session.account;
  // console.log(approver);
  // console.log(approveddate);
  connection.query("Select CVFile from candidate where BriefID = ?",[briefid], function(error, results, fields) {
    if(results.length > 0)
    {
      var cvfile = results[0].CVFile;
      connection.query("Insert into approvecand values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [briefid,reqid,name,email,phone,experience,language,itskill,academic,cvfile,status,submitdate,approver,approveddate,null,null,null], function(error, results2, fields){
        if(!error)
                {
                  req.session.message = {
                    type: 'success',
                    message: 'Xét duyệt hồ sơ thành công!'
                  }
                  connection.query("Select * from user where Account = ?",[curuser], function(error, curresults, fields) {
                    if(curresults.length > 0 && curresults[0].EmpID >= 1100 && curresults[0].EmpID <= 1199)
                    {
                      connection.query("Select * from approvecand where Interviewer is null",function(error, queryresults, fields){
                        if(error) throw (error);
                        else 
                        {
                          connection.query("Update candidate Set Status = 'Checked' where BriefID = ?",[briefid],function(error, results111,fields){
                            if (error) throw error;
                            else res.render('approvedcandidate',{message : req.session.message, data : curresults, query : queryresults}); 
                          })
                        }
                        })
                    }
                    else
                    {
                      connection.query("Select * from approvecand ",function(error, queryresults, fields){
                        if(error) throw (error);
                        else res.render('approvedcandidate',{message : req.session.message, data : curresults, query : queryresults});
                      })
                    }
                  })
                }
      })
    }
  })
})
app.get('/approvedcandidate', (req, res) => {
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
    if (curresults.length > 0 && curresults[0].EmpID >= 1100 && curresults[0].EmpID <= 1199) {
        connection.query("Select * from approvecand where Interviewer is null",function(error, results, fields){
          if(results.length == 0)
          {
            req.session.message = {
              type: 'danger',
              message: 'Chưa có hồ sơ nào được xét duyệt!'
            }
            res.render('approvedcandidate', {data : curresults, query : null, message : req.session.message})
          }
          else res.render('approvedcandidate',{data : curresults, query : results});
        })
    }
    else if(curresults.length > 0 && curresults[0].EmpID >= 1200 && curresults[0].EmpID <= 1299)
    {
      connection.query("Select * from approvecand where Interviewer is null and Status = 'Chuẩn bị phỏng vấn'",function(error, results, fields){
        if(results.length == 0)
        {
          req.session.message = {
            type: 'danger',
            message: 'Chưa có hồ sơ nào được xét duyệt!'
          }
          res.render('approvedcandidate', {data : curresults, query : null, message : req.session.message})
        }
        else res.render('approvedcandidate',{data : curresults, query : results});
      })
    }
    else if(curresults[0].EmpID == 1300 || (curresults[0].EmpID >= 1001 && curresults[0].EmpID <= 1099))
    {
      connection.query("Select * from approvecand",function(error, results, fields){
        if(results.length == 0)
        {
          req.session.message = {
            type: 'danger',
            message: 'Chưa có hồ sơ nào được xét duyệt!'
          }
          res.render('approvedcandidate', {data : curresults, query : null, message : req.session.message})
        }
        else res.render('approvedcandidate',{data : curresults, query : results});
      })
    }
    // else if(curresults.length > 0 && curresults[0].EmpID >= 1001 && curresults[0].EmpID <= 1099)
    // {
    //   connection.query("Select * from approvecand",function(error, results, fields){
    //     if(results.length == 0)
    //     {
    //       req.session.message = {
    //         type: 'danger',
    //         message: 'Chưa có hồ sơ nào được xét duyệt!'
    //       }
    //       res.render('approvedcandidate', {data : curresults, query : null, message : req.session.message})
    //     }
    //     else res.render('approvedcandidate',{data : curresults, query : results});
    //   })
    // }
    else res.redirect('home');
  })
});
app.get('/viewcandidate/:id', (req, res) =>{
  connection.query("Select * from approvecand inner join hiringreq on approvecand.ReqID = hiringreq.ReqID where BriefID = ?",[req.params.id], function(error, results, fields) {
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
          res.render('viewcandidate', {query : oldreq , data : curresults});
        }
      })
    }
  })
})
app.get('/editcandidate/:id', (req, res) =>{
  connection.query("Select * from approvecand where BriefID = ?",[req.params.id], function(error, results, fields) {
    if(results.length == 0)
    {
      res.redirect('/' + req.params.id);
    }
    else 
    {
      var oldreq = results;
      var curuser = req.session.account;
      connection.query("Select * from user inner join userdetail on user.EmpID = userdetail.EmpID where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0) {
          res.render('editcandidate', {query : oldreq , data : curresults});
        }
      })
    }
  })
})
app.post('/editcandidate/:id', (req, res) =>{
  var experience = req.body.experience;
  var language = req.body.language;
  var itskill = req.body.itskill;
  var academic = req.body.academic;
  var status = req.body.statustype;
  var approver = req.body.approver;
  var approveddate = req.body.approveddate;
  var curuser = req.session.account;
  connection.query("Select CVFile from approvecand where BriefID = ?",[req.params.id], function(error, results, fields){
    if(results.length > 0)
    {
      var cvfile = results[0].CVFile;
      connection.query("Update approvecand Set Experience = ?, Language = ?, ITSkill = ?, Academic = ?, Status = ?, Approver = ?, ApprovedDate = ?  where BriefID = ?"
      ,[experience,language,itskill,academic,status,approver,approveddate,req.params.id], function(error, results2, fields){
        if(!error)
        {
          req.session.message = {
            type: 'success',
            message: 'Cập nhật thông tin hồ sơ ứng viên thành công!'
          }
          connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
            if (curresults.length > 0 && curresults[0].EmpID >= 1100 && curresults[0].EmpID <= 1199) {
              connection.query("Select * from approvecand where Interviewer is null", function(error, results3, fields){
                if(results3.length > 0)
                {
                  res.render('approvedcandidate',{message : req.session.message, data : curresults, query : results3});
                }
              })              
            }
            else
            {
              connection.query("Select * from approvecand", function(error, results3, fields){
                if(results3.length > 0)
                {
                  res.render('approvedcandidate',{message : req.session.message, data : curresults, query : results3});
                }
              })       
            }
          })
        }
      })
    }
  })
})
app.get('/delapprovedcandidate/:id', (req, res) =>{
  connection.query("Select CVFile from approvecand where BriefID = ?",[req.params.id], function(error, query, fields){
    if(!error)
    {
      var filename = query[0].CVFile;
      var tempFile ="./upload/" + filename;
      fs.unlink(tempFile, function(err,data){
        if (err) {
          console.error(err)
          return
        }
      })
    }
  })
  connection.query("Delete approvecand, candidate from approvecand, candidate where approvecand.BriefID = candidate.BriefID and approvecand.BriefID = ?",[req.params.id], function(error, results, fields){
    if(!error)
    {
      req.session.message = {
        type: 'success',
        message: 'Xóa hồ sơ thành công!'
      }
      var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
      connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0) {
          connection.query("Select * from approvecand", function(error, results3, fields){
            if(results3.length > 0)
            {
              res.render('approvedcandidate',{message : req.session.message, data : curresults, query : results3});
            }
            else res.render('approvedcandidate',{message : req.session.message, data : curresults, query : null});
          })         
        }
        else res.redirect('home');
      })
    }
  })
})
// Route trang phong van
app.get('/interview/:id', (req, res) =>{
  connection.query("Select * from approvecand where BriefID = ?",[req.params.id], function(error, results, fields) {
    if(results.length == 0)
    {
      res.redirect('/' + req.params.id);
    }
    else 
    {
      var oldreq = results;
      var curuser = req.session.account;
      connection.query("Select * from user inner join userdetail on user.EmpID = userdetail.EmpID where Account = ?",[curuser],function(error,curresults,fields){
        if (curresults.length > 0) {
          res.render('interview', {query : oldreq , data : curresults});
        }
      })
    }
  })
})
app.post('/interview/:id', (req, res) =>{
  var experience = req.body.experience;
  var language = req.body.language;
  var itskill = req.body.itskill;
  var academic = req.body.academic;
  var status = req.body.statustype;
  var interviewer = req.body.interviewer;
  var intervieweddate = req.body.intervieweddate;
  var note = req.body.note;
  var curuser = req.session.account;
  connection.query("Select CVFile from approvecand where BriefID = ?",[req.params.id], function(error, results, fields){
    if(results.length > 0)
    {
      var cvfile = results[0].CVFile;
      connection.query("Update approvecand Set Experience = ?, Language = ?, ITSkill = ?, Academic = ?, Status = ?, Interviewer = ?, Intervieweddate = ?, Note = ?  where BriefID = ?"
      ,[experience,language,itskill,academic,status,interviewer,intervieweddate,note,req.params.id], function(error, results2, fields){
        if(!error)
        {
          req.session.message = {
            type: 'success',
            message: 'Cập nhật thông tin hồ sơ ứng viên thành công!'
          }
          connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
            if (curresults.length > 0 && curresults[0].EmpID >= 1200 && curresults[0].EmpID <= 1299) {
              connection.query("Select * from approvecand where Interviewer is null and Status = 'Chuẩn bị phỏng vấn'", function(error, results3, fields){
                if(results3.length > 0)
                {
                  res.render('approvedcandidate',{message : req.session.message, data : curresults, query : results3});
                }
                else 
                {
                  req.session.message = {
                    type: 'success',
                    message: 'Chưa có ứng viên chờ phỏng vấn!'
                  }
                  res.render('approvedcandidate',{message : req.session.message, data : curresults, query : null});
                }
              })              
            }
          })
        }
      })
    }
  })
})
// Route trang xem ung vien trung tuyen
app.get('/passedcandidate', (req, res) => {
  var curuser = req.session.account; //lay ra nguoi dung dang dang nhap hien tai
  connection.query("Select * from user where Account = ?",[curuser],function(error,curresults,fields){
    if (curresults.length > 0) {
        connection.query("Select * from approvecand where Status = 'Trúng tuyển'",function(error, results, fields){
          if(error) throw (error);
          else res.render('approvedcandidate',{data : curresults, query : results});
        })
    }
    else res.redirect('home');
  })
});
}
module.exports = cvfuncroute;
