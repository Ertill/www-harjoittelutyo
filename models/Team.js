var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TeamSchema = new Schema(
  {
    name: {type: String, required: true},
	summary: {type: String},
	player: [{type: Schema.ObjectId, ref: 'Player'}],
	game: [{type: Schema.ObjectId, ref: 'Game'}]
	
  }
);

// Virtual for team's URL
TeamSchema
.virtual('url')
.get(function () {
  return '/catalog/Team/' + this._id;
});

//Export model
module.exports = mongoose.model('Team', TeamSchema);