var Game = require('../models/game');
var Player = require('../models/player');
var Team = require('../models/team');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all games.
exports.game_list = function(req, res, next) {
   Game.find({}, 'name')   
    .exec(function (err, list_games) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('game_list', { title: 'Game List', game_list: list_games});
    });
};

// Display detail page for a specific Game.
exports.game_detail = function(req, res) {
    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id)
              .exec(callback);
        },

        game_players: function(callback) {
          Player.find({'game' :req.params.id})
		  .populate('team')
          .exec(callback);
        },

		

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.game==null) { // No results.
            var err = new Error('Game not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('game_detail', { title: 'Game Detail', game: results.game, game_players: results.game_players } );
    });
};

// Display game create form on GET.
exports.game_create_get = function(req, res, next) {       
    res.render('game_form', { title: 'Add game' });
};

// Handle game create on POST.
exports.game_create_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Game name required').isLength({ min: 1 }).trim(),
	body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('summary').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a game object with escaped and trimmed data.
        var game = new Game(
          { name: req.body.name,
		    summary: req.body.summary
		  }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('game_form', { title: 'Create game', game: game, summary:summary, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if game with same name already exists.
            Game.findOne({ 'name': req.body.name })
                .exec( function(err, found_game) {
                     if (err) { return next(err); }

                     if (found_game) {
                         // Game exists, redirect to its detail page.
                         res.redirect(found_game.url);
                     }
                     else {

                         game.save(function (err) {
                           if (err) { return next(err); }
                           // Game saved. Redirect to game detail page.
                           res.redirect(game.url);
                         });

                     }

                 });
        }
    }
];

// Display game delete form on GET.
exports.game_delete_get = function(req, res, next) {

    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id).exec(callback)
        },
        game_players: function(callback) {
          Player.find({ 'game': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.game==null) { // No results.
            res.redirect('/catalog/games');
        }
        // Successful, so render.
        res.render('game_delete', { title: 'Delete game', game: results.game, game_players: results.game_players } );
    });

};;

// Handle game delete on POST.
exports.game_delete_post = function(req, res, next) {

    async.parallel({
        game: function(callback) {
          Game.findById(req.body.teamid).exec(callback)
        },
        games_players: function(callback) {
          Player.find({ 'game': req.body.gameid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.games_players.length > 0) {
            // Game has players. Render in same way as for GET route.
            res.render('game_delete', { title: 'Delete game', game: results.game, game_players: results.game_players } );
            return;
        }
        else {
            // Game has no players. Delete object and redirect to the list of games.
            Game.findByIdAndRemove(req.body.gameid, function deletegame(err) {
                if (err) { return next(err); }
                // Success - go to game list
                res.redirect('/catalog/games')
            })
        }
    });
};;

// Display game update form on GET.
exports.game_update_get = function(req, res, next) { 
	async.parallel({
		game: function(callback) {
			Game.findById(req.params.id).exec(callback);
		},
	},
		function(err, results) {
            if (err) { return next(err); }
            if (results.game==null) { // No results.
                var err = new Error('Game not found');
                err.status = 404;
                return next(err);
            }
		
    res.render('game_form', { title: 'Update game', game: results.game });
		});
};

// Handle game update on POST.
exports.game_update_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Game name required').isLength({ min: 1 }).trim(),
	body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a game object with escaped and trimmed data.
        var game = new Game(
          { name: req.body.name,
		    summary: req.body.summary,
		    _id:req.params.id
		  }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('game_form', { title: 'Update game', game: game, errors: errors.array()});
        return;
        }
        else {
           

                         Game.findByIdAndUpdate(req.params.id, game, function (err) {
                           if (err) { return next(err); }
                           // Game updated. Redirect to game detail page.
                           res.redirect(game.url);
                         });

                     

                 }
        }
    
];