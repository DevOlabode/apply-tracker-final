const { required } = require('joi');
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    url :{
        type : String,
    },
    company : {
        type : String,
        required : true,
    },
    position : {
        type : String,
        required : true,
    },
    resumeFile: {
        originalName: { 
            type: String
        },
        size: { 
            type: Number
        },
        path: { 
            type: String
        }, 
        mimetype: { 
            type: String 
        }
    },
    status : {
        type : String,
        enum : ['applied', 'rejected', 'interviewing', 'offer', 'hired'],
        lowercase : true,
        default : 'applied',
        required : true,
    },
    appliedDate : {
        type : String,
        required : false,
    },
    interviewDate : {
        type : String,
        required : false,
    }, 
    notes : {
        type : String,
        required : false,
    },
    user :  {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application
