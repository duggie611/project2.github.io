class LoginController{

    // [GET] /login
    index(req, res) {
        res.render('login');
        console.log(req.body);
    }
    
}
module.exports =  new LoginController;