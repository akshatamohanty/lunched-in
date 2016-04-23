var mongoose = require('mongoose');
var User = require('./user');
var Restaurant = require('./restaurant');

var matchSchema = {
	batch: { type: Number, required: true },
	batchSize: { type: Number, required: true},
	date: { type: Date, required: true}, 
	participants: [ User.userSchema ],
	dropouts: [ User.userSchema ],
	location: Restaurant.restaurantSchema
};

module.exports = new mongoose.Schema( matchSchema );
module.exports.matchSchema = matchSchema; 