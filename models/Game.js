var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GameSchema = new Schema(
  {
    name: {type: String, required: true},
	summary: {type: String,},
    player: [{type: Schema.ObjectId, ref: 'Player'}],
    team: [{type: Schema.ObjectId, ref: 'Team'}],
	role: [{type: Schema.ObjectId, ref: 'Role'}]
  }
);

// Virtual for game's URL
GameSchema
.virtual('url')
.get(function () {
  return '/catalog/game/' + this._id;
});

//Export model
module.exports = mongoose.model('Game', GameSchema);