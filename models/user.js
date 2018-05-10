var mongoose = require('mongoose');

var userSchema = {
	inPool: { type: Boolean }, 
	name: { type: String, required: true}, 
	password: { type: String, required: true }, 
	gender: { type: Number }, 
	title: { type: String }, 
	linkedin: { type: String }, 
	picture: { type: String }, 
	email: { type: String, required: true }, 
	phone: { type: String }, 
	tagline: { type: String }, 
	nationality: { type: String },
	cuisine: [String],
	veg: { type: Boolean },
	halal: { type: Boolean },
	lunchCount: { type: Number },
	dropCount: { type: Number },
	available: [String],
	blocked: [ {
    		type: mongoose.Schema.Types.ObjectId, ref: 'User'
 		 } 
  	],
	known: [ {
	    type: mongoose.Schema.Types.ObjectId, ref: 'User'
	  } 
	],
	blockedRestaurants: [ {
	    type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant'
	  } 
	]
};

var schema = new mongoose.Schema( userSchema );

schema.virtual('username').get(function(){
	return (this.email);
});

schema.virtual('knownCount').get(function(){
	return (this.known.length);
});
schema.virtual('blockedCount').get(function(){
	return (this.blocked.length);
});


module.exports = schema; 
module.exports.userSchema = userSchema; 
