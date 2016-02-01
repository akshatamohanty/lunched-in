var mongoose = require('mongoose');

var pairSchema = {
	date: Date, 
	ids: [ {
    		type: mongoose.Schema.Types.ObjectId, ref: 'User'
 		 } 
  	], 
	cuisine: [String],
	blocked: [ {
    		type: mongoose.Schema.Types.ObjectId, ref: 'User'
 		 } 
  	],
	known: [ {
	    type: mongoose.Schema.Types.ObjectId, ref: 'User'
	  } 
	]
};

var schema = new mongoose.Schema( pairSchema );

schema.virtual('knownCount').get(function(){
	return (this.known.length);
});
schema.virtual('blockedCount').get(function(){
	return (this.blocked.length);
});


module.exports = schema; 
module.exports.pairSchema = pairSchema; 
