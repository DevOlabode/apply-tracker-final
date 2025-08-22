const statuses = ['applied', 'rejected', 'interviewing', 'offer', 'hired']
const Application = require('../models/apply');

const pdfParse = require("pdf-parse");

const fs = require('fs');
const path = require('path');

const { analyseResume } = require('../utils/analyseResume');
const ExpressError = require('../utils/expressError')


module.exports.index = async (req, res) => {
    const { status, q } = req.query;

    let query = { user: req.user._id };

    if (status && status !== 'All') {
        query.status = status.trim().toLowerCase();
    }

    if (q && q.trim() !== "") {
        query.company = new RegExp(q.trim(), "i");
    }

    const applications = await Application.find(query);

    res.render('applyTracker/index', { 
        applications, 
        status: status || 'All',
        q 
    });
};

module.exports.newForm =  (req, res)=>{
    res.render('applyTracker/new', { statuses });
};

module.exports.analyseResume = async(req, res) => {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application || !application.resumeFile) {
        req.flash('error', "Can't analyze this application");
        return res.redirect('/application');
    }

    const filePath = path.join(__dirname, '..', application.resumeFile.path);
    
    // Check if file exists before trying to read it
    if (!fs.existsSync(filePath)) {
        req.flash('error', "Resume file not found. It may have been deleted.");
        return res.redirect(`/application/${id}`);
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(fileBuffer);
        const resumeText = data.text;
        const jobUrl = application.url;

        const analyseResult = await analyseResume(resumeText, jobUrl);

        let analysis;
        try {
            analysis = JSON.parse(analyseResult);
        } catch (err) {
            console.error("Invalid JSON from Groq:", analyseResult);
            req.flash("error", "Analysis failed. Please try again.");
            return res.redirect("/application");
        }
        res.render('applyTracker/analysis', { analysis });
    } catch (error) {
        console.error("Error processing file:", error);
        req.flash('error', 'Error processing resume file');
        return res.redirect(`/application/${id}`);
    }
};

module.exports.showPage = async (req, res)=>{
    const { id } = req.params;
    const findApplication =await Application.findById(id);
    if(!findApplication){
        throw new ExpressError('Application Not Found', 404)
    };

    res.render('applyTracker/details', { findApplication });
};


module.exports.editForm = async (req, res)=>{
    const { id } = req.params;
    const findApplication = await Application.findById(id);
    res.render('applyTracker/edit', { findApplication, statuses });
};

module.exports.newApplication = async (req, res) => {
  const application = new Application({
      url: req.body.url,
      company: req.body.company,
      position: req.body.position,
      status: req.body.status,
      appliedDate: req.body.appliedDate,
      interviewDate: req.body.interviewDate,
      notes: req.body.notes,
      user: req.user._id,
      resumeFile: req.body.resumeFile 
    });
    await application.save();
    res.redirect('/application');
  };


module.exports.editApplication = async (req, res) => {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      throw new ExpressError('Application Not Found', 404);
    }

    // If a new resume was uploaded
    if (req.file) {
      // delete old resume file if it exists
      if (application.resumeFile && application.resumeFile.path) {
        const oldFilePath = path.join(__dirname, '..', application.resumeFile.path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error('Error deleting old resume:', err);
          });
        }
      }

      // attach new file to update
      req.body.resumeFile = {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
      };
    } else {
      // keep existing resume if no new file uploaded
      req.body.resumeFile = application.resumeFile;
    }

    const updatedApp = await Application.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });

    res.redirect(`/application/${updatedApp._id}`);
  };

module.exports.deleteApplication =   async (req ,res)=>{
    const { id } = req.params;
    
    // Delete associated resume file if it exists
    const application = await Application.findById(id);
    if (application && application.resumeFile && application.resumeFile.path) {
        const filePath = path.join(__dirname, '..', application.resumeFile.path);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting resume file:', err);
            });
        }
    }
    
    await Application.findByIdAndDelete(id);
    res.redirect('/application');
}