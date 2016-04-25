var mongoose = require('mongoose');

var restaurantSchema = {
	code: { type: String, require: true},
	name: { type: String, required: true}, 
	address: { type: String },
	zip: Number,
	price: Number,
	phone: { type: String },
	cuisine: [ String ],
	halal: { type: Boolean },
	veg: { type: Boolean },
	total: Number
};

module.exports = new mongoose.Schema( restaurantSchema );
module.exports.restaurantSchema = restaurantSchema; 