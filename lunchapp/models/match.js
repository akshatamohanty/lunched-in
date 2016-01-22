var mongoose = require('mongoose');
var User = require('./user');
var Restaurant = require('./restaurant');

var matchSchema = {
	date: { type: Date, required: true}, 
	participants: [ User.userSchema ],
	dropouts: [ User.userSchema ],
	location: [ Restaurant.restaurantSchema ]
};

module.exports = new mongoose.Schema( matchSchema );
module.exports.matchSchema = matchSchema; 