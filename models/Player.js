var mongoose = require('mongoose');
var moment = require('moment')

var Schema = mongoose.Schema;

var PlayerSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
	nationality: {type: String, required:true, max: 100},
	nickname: {type: String, required:true, max: 100},
    date_of_birth: {type: Date},
	game: {type: Schema.ObjectId, ref: 'Game', required:true},
	team: {type : Schema.ObjectId, ref: 'Team'},
	role: {type: Schema.ObjectId, ref: 'Role', required:true}
  }
);

// Virtual for player's full name
PlayerSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for player's URL
PlayerSchema
.virtual('url')
.get(function () {
  return '/catalog/player/' + this._id;
});

PlayerSchema
.virtual('date_of_birth_formatted')
.get(function () {
  return moment(this.date_of_birth).format('MMMM Do, YYYY');
});


//Export model
module.exports = mongoose.model('player', PlayerSchema);