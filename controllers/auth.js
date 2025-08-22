const User = require('../models/auth');
const ExpressError = require('../utils/expressError');

module.exports.signupForm =async(req, res)=>{
    res.render('auth/signup')
};

module.exports.signup = async(req, res)=>{
    try{
        const { username, password, firstName, lastName, email, bio, location, website }  = req.body;
        const user = new User({ username, firstName, lastName, email, bio, location, website });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if(err) return next(err)
        req.flash('success', 'Welcome to the Apply Tracker App')
        res.redirect('/')         
        });
    }catch(err){
        throw new ExpressError(err.message, 400);
    }
};

module.exports.loginForm = (req, res)=>{
    res.render('auth/login')
};

module.exports.login =  (req, res)=>{
    req.flash('success', "Welcome Back to the Apply Tracker App");
    const returnUrl = res.locals.returnTo || '/'
    res.redirect(returnUrl)
};

module.exports.logout = async(req, res)=>{
    req.logout(function(err){
        if(err) return next(err);
        req.flash('success', 'Successfully Logged out');
        res.redirect('/')   
    });
}