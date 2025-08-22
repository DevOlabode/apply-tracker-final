const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn}  = require('../middleware');

const user = require('../controllers/user')

router.route('/:id')
    .get(isLoggedIn, catchAsync(user.profile))
    .put(isLoggedIn, catchAsync(user.editProfile))

router.get('/:id/edit', isLoggedIn, catchAsync(user.editForm));

router.route('/:id/changePassword')
    .get(isLoggedIn, catchAsync(user.changepasswordForm))
    .put(isLoggedIn, catchAsync(user.changepassword))

module.exports = router;