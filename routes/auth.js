const express = require('express');
const router = express.Router();
const passport = require('passport')


const catchAsync = require('../utils/catchAsync');
const {loginAuthenticate, storeReturnTo} = require('../middleware');

const auth = require('../controllers/auth')

router.route('/signup')
    .get(catchAsync(auth.signupForm))
    .post(catchAsync(auth.signup))

router.route('/login')
    .get(auth.loginForm)
    .post(storeReturnTo, loginAuthenticate, auth.login)

router.get('/logout',catchAsync(auth.logout));

module.exports = router;