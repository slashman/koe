
'use strict';
var initModel = function(){
	console.log('Initializing model...')
	for (var x = 0; x < model.width; x++){
		model.map[x] = [];
		for (var y = 0; y < model.height; y++){
			model.map[x][y] = {
				owner: false,
				//uniformly distributed amount of peasants per fief
				//TODO: make this a normal distribution and make the mean 
				//10 to have outliers that are harder to conquer
				peasants: Math.floor((Math.random() * 10) + 1),

			};
		}
	}
};

var model = {
	width : 20,
	height : 20,
	map: [],
	players: [],
	sockets: [],
	init: initModel
};

model.init();
module.exports = model;


// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
// 	Schema = mongoose.Schema;
// /**
//  * Exam Schema
//  */
// var ExamSchema = new Schema({
// 	name: {
// 		type: String,
// 		default: '',
// 		required: 'Please fill Exam name',
// 		trim: true
// 	},
// 	created: {
// 		type: Date,
// 		default: Date.now
// 	},
// 	user: {
// 		type: Schema.ObjectId,
// 		ref: 'User'
// 	},
// 	questions: [
// 		{
// 			type: Schema.Types.ObjectId, 
// 			ref: 'Question'
// 		}
// 	]
// });

// mongoose.model('Exam', ExamSchema);