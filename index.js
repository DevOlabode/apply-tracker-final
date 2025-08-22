require('dotenv').config();

const port = process.env.PORT;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const path = require('path');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const localStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash')


const Application = require('./models/apply');
const User = require('./models/auth');

const ExpressError = require('./utils/expressError'); 
const catchAsync = require('./utils/catchAsync');

const applyRoute = require('./routes/applyTracker');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user')

mongoose.connect('mongodb://127.0.0.1:27017/application')
    .then(() => {
        console.log("Mongo Connection Open")   
    }).catch((err) => {
        console.log("Error", err)
    });

app.use(methodOverride('_method'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : true}));
app.engine('ejs', ejsMate);

app.use(flash())

app.use(express.json());


const sessionConfig = {
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : false,
    Cookie : {
        httpOnly: true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7, 
        maxAge: 1000 * 60 * 60 * 24 * 7 
    }
}

app.use(session(sessionConfig));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.warning = req.flash('warning')
    next();
})


app.use(express.static(path.join(__dirname, 'public')));

const statuses = ['applied', 'rejected', 'interviewing', 'offer', 'hired']

app.get('/', catchAsync(async(req, res)=>{
    if(req.user){
    const counts = {};
    for (let s of statuses) {
        counts[s] = await Application.countDocuments({ user: req.user._id, status: s });
    }

    return res.render('home', { counts })
    }else{
        res.render('home')
    }
}));

app.use('/application', applyRoute);
app.use('/', authRoute);
app.use('/user', userRoute);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page not found', 404))
});


app.use((err, req, res, next)=>{
    const {statusCode = 500} = err;
    if(!err.message){
        err.message = 'Something Went Wrong!'
    }
    res.status(statusCode).render('error', {err})
});

app.listen(port, ()=>{
    console.log(`APP IS LISTENING ON PORT ${port}`)
});