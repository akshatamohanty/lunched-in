var mongoose = require('mongoose');

var restaurantSchema = {
	code: { type: String, require: true},
	name: { type: String, required: true}, 
	address: { type: String },
	cuisine: [ String ],
	scheduled: Number,
	total: Number
};

module.exports = new mongoose.Schema( restaurantSchema );
module.exports.restaurantSchema = restaurantSchema; 