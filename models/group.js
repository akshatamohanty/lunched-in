var mongoose = require('mongoose');

var groupSchema = {
	run: { type: Number, required: true}, 
	participants: { type:[ User.userSchema ], required: true },
};

var schema = new mongoose.Schema( groupSchema );

schema.virtual('valid').get(function(){
	//check if all users aren't mutually blocked

	//check if there is a restaurant that serves all
});

schema.virtual('satisfaction').get(function(){
	// check what conditions are satisfied for each user and return average
});



module.exports = schema; 
module.exports.groupSchema = groupSchema; 