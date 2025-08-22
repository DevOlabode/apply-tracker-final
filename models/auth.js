const { application } = require('express');
const { required } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    firstName : {
        type : String,
        required : true
    }, 
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    bio : {
        type : String,
        required : false,
    },
    location : {
        type : String,
        required : false,
    },
    website : {
        type : String,
        required : false
    },
    application :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'applications'
    }
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema)