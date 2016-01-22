var mongoose = require('mongoose');

var restaurantSchema = {
	name: { type: String, required: true}, 
	cuisine: [ String ],
	scheduled: Number,
	total: Number
};

module.exports = new mongoose.Schema( restaurantSchema );
module.exports.restaurantSchema = restaurantSchema; 