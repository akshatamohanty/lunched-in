var mongoose = require('mongoose');

var dailyPoolSchema = {
	date: { type: Date, required: true}, 
	participants: [ {
	    type: mongoose.Schema.Types.ObjectId, ref: 'User'
	  } 
	]
};

module.exports = new mongoose.Schema( dailyPoolSchema );
module.exports.dailyPoolSchema = dailyPoolSchema; 
