const Joi = require('joi');

module.exports.applySchema = Joi.object({
  url: Joi.string().required(),
 resumeFile: Joi.object({
  originalName: Joi.string().required(),
  size: Joi.number().max(5 * 1024 * 1024).required(),
  mimetype: Joi.string().optional(),
  path: Joi.string().required()
}).optional().allow(null),
  company: Joi.string().required(),
  position: Joi.string().required(),
  status: Joi.string()
    .valid('applied', 'rejected', 'interviewing', 'offer', 'hired')
    .required(),
  appliedDate: Joi.date().iso().required(),  
  interviewDate: Joi.date().iso().optional().allow(''),       
  notes: Joi.string().optional().allow(''),         
});