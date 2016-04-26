var mongoose = require('mongoose');
var User = require('./user');
var Restaurant = require('./restaurant');

var matchSchema = {
	run: { type: Number, required: true}, 
	date: { type: Date, required: true}, 
	participants: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User'  }], 
	dropouts: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User'  }],
	location: Restaurant.restaurantSchema
};

module.exports = new mongoose.Schema( matchSchema );
module.exports.matchSchema = matchSchema; 