var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoleSchema = new Schema(
  {
    name: {type: String, required: true},
	player: [{type: Schema.ObjectId, ref: 'Player'}],
	game: [{type: Schema.ObjectId, ref: 'Game'}]
  }
);

// Virtual for role's URL
RoleSchema
.virtual('url')
.get(function () {
  return '/catalog/Role/' + this._id;
});

//Export model
module.exports = mongoose.model('Role', RoleSchema);