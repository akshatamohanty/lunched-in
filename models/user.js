var mongoose = require('mongoose');

var userSchema = {
	name: { type: String, required: true}, 
	password: { type: String, required: true }, 
	title: { type: String, required: true}, 
	picture: { type: String, match: /^http:\/\//i }, 
	email: { type: String }, 
	phone: { type: String }, 
	tagline: { type: String }, 
	cuisine: [{ type: String }],
	available: [{type: String}],
	blocked: [ {
    		type: mongoose.Schema.Types.ObjectId, ref: 'User'
 		 } 
  	],
	known: [ {
	    type: mongoose.Schema.Types.ObjectId, ref: 'User'
	  } 
	]
};

module.exports = new mongoose.Schema( userSchema );
module.exports.userSchema = userSchema; 
