const mongoose = require('mongoose')
const Application = require('./models/apply')


mongoose.connect('mongodb://127.0.0.1:27017/application')
    .then(() => {
        console.log("Mongo Connection Open")   
    }).catch((err) => {
        console.log("Error", err)
    });

const seedApplication = [
    {
        company : 'FAANG',
        position: 'Junior Front-End Developer',
        status : 'Interviewing',
        appliedDate : '2025-04-12',
        interviewDate : '2025-06-30',
        notes : 'Doing Interview Online'
    },
      {
    company: 'Google',
    position: 'Frontend Developer',
    status: 'Applied',
    appliedDate: '2025-06-01',
    notes: 'Submitted via careers.google.com'
  },
  {
    company: 'Shopify',
    position: 'Full Stack Intern',
    status: 'Interviewing',
    appliedDate: '2025-05-20',
    interviewDate : '2025-07-12',
    notes: 'Completed phone screen',
  },
  {
    company: 'Netflix',
    position: 'Backend Developer',
    status: 'Rejected',
    appliedDate: '2025-04-25',
    notes: 'No reply after 3 weeks'
  },
  {
    company: 'Microsoft',
    position: 'Cloud Engineer',
    status: 'Offer',
    appliedDate: '2025-05-01',
    notes: 'Received offer. Considering.'
  }
];

const seedDB = Application.insertMany(seedApplication);