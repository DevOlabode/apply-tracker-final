const {applySchema} = require('./joiSchema');
const ExpressError = require('./utils/expressError')

const passport = require('passport');

module.exports.validateApplication  = (req, res, next)=>{
    const { error } = applySchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400)
    }else{
        next();
    }
};


module.exports.loginAuthenticate = passport.authenticate('local', {
    failureFlash : true,
    failureRedirect : '/login'
});

module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first');
        return res.redirect('/login')
    }
    next()
};

module.exports.storeReturnTo = (req, res, next)=>{
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo
    }
    next();
};

module.exports.processResumeFile = (req, res, next) => {
  if (req.file) {
    req.body.resumeFile = {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    };
  } else {
    req.body.resumeFile = null;
  }
  next();
};
