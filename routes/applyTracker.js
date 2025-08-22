const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const catchAsync = require('../utils/catchAsync');
const {validateApplication, isLoggedIn, processResumeFile} = require('../middleware');

const applyTracker = require('../controllers/applyTracker');

router.route('/')
  .get(isLoggedIn, catchAsync(applyTracker.index))
  .post(  upload.single('resumeFile'),
  processResumeFile,
  validateApplication,
  catchAsync(applyTracker.newApplication))



router.get('/new', isLoggedIn, applyTracker.newForm);

router.get('/:id/analysis', isLoggedIn, catchAsync(applyTracker.analyseResume));

router.route('/:id')
  .get(isLoggedIn, catchAsync(applyTracker.showPage))
  .put(isLoggedIn,
  upload.single('resumeFile'),
  validateApplication,
  catchAsync(applyTracker.editApplication))

  .delete(isLoggedIn,  catchAsync(applyTracker.deleteApplication))


router.get('/:id/edit', isLoggedIn, catchAsync(applyTracker.editForm));

module.exports = router;
