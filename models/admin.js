var mongoose = require('mongoose');

var adminSchema = {
	name: { type: String, required: true}, 
	username: { type: String, required: true}, 
	password: { type: String, required: true }, 
	adminStatus: Boolean
};

var schema = new mongoose.Schema( adminSchema );

module.exports = schema; 
module.exports.adminSchema = adminSchema; 
