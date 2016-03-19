var mongoose = require('mongoose');

var matchAlgorithmSchema = {
	time: { type: Date, required: true}, 
	poolCount: Number,
	matchCount: Number
};

var schema = new mongoose.Schema( matchAlgorithmSchema );

module.exports = schema; 
module.exports.matchAlgorithmSchema = matchAlgorithmSchema; 
