var Player = require('../models/player');
var Role = require('../models/role');
var Team = require('../models/team');
var Game = require('../models/game');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');

exports.indexRouter = function(req, res) {   
    
    async.parallel({
        Player_count: function(callback) {
            Player.count({}, callback); 
        },
        Game_count: function(callback) {
            Game.count({}, callback);
        },
        Role_count: function(callback) {
            Role.count({}, callback);
        },
        Team_count: function(callback) {
            Team.count({}, callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'E-sports', error: err, data: results });
    });
};



exports.player_list = function(req, res, next) {

  Player.find({}, 'first_name nickname family_name team')
    .populate('team')
    .exec(function (err, list_players) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('player_list', { title: 'Player List', player_list: list_players });
    });
    
};


exports.player_detail = function(req, res) {

    async.parallel({
        player: function(callback) {
            Player.findById(req.params.id)
			  .populate('team')
			  .populate('game')
			  .populate('role')
              .exec(callback)
        },
        players_team: function(callback) {
          Team.find({ 'player': req.params.id },'name')
          .exec(callback)
        },
		players_game: function(callback) {
          Game.find({ 'player': req.params.id },'name')
          .exec(callback)
        },
		players_role: function(callback) {
          Role.find({ 'player': req.params.id },'name')
          .exec(callback)
        },
		
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.player==null) { // No results.
            var err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('player_detail', { title: 'Player Detail', player: results.player, players_team: results.players_team,
		players_game: results.players_game, players_role: results.players_role } );
    });

};


exports.player_create_get = function(req, res, next) { 
      
    // Get all teams games and roles, which we can use for adding to our player.
    async.parallel({
        teams: function(callback) {
            Team.find(callback);
        },
        games: function(callback) {
            Game.find(callback);
        },
		
		 roles: function(callback) {
            Role.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('player_form', { title: 'Add player', teams: results.teams, games: results.games, roles: results.roles });
    });
    
};


exports.player_create_post = [


// Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('nickname').isLength({ min: 1 }).trim().withMessage('Nickname must be specified.')
        .isAlphanumeric().withMessage('Nickname has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),

  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a player object with escaped and trimmed data.
        var player = new Player(
          { 
		  
		  first_name: req.body.first_name,
		  nickname: req.body.nickname,
          family_name: req.body.family_name,
          date_of_birth: req.body.date_of_birth,
		  team: req.body.team,
		  game: req.body.game,
		  role: req.body.role,
		  nationality: req.body.nationality
           });

       if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('player_form', { title: 'Add player', team: results.teams, game: results.games, role: results.roles, nationality: results.nationalities, errors: errors.array() });
        return;
	   }
               else {
            // Data from form is valid.
            // Check if player with same name already exists.
            Player.findOne({ 'nickname': req.body.nickname })
                .exec( function(err, found_player) {
                     if (err) { return next(err); }

                     if (found_player) {
                         // Player exists, redirect to its detail page.
                         res.redirect(found_player.url);
                     }
                     else {

                         player.save(function (err) {
                           if (err) { return next(err); }
                           // Player saved. Redirect to player detail page.
                           res.redirect(player.url);
                         });

                     }

                 });
        }
    }
];


exports.player_delete_get = function(req, res, next) {

    async.parallel({
        player: function(callback) {
            Player.findById(req.params.id).exec(callback)
        },
       
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.player==null) { // No results.
            res.redirect('/catalog/players');
        }
        // Successful, so render.
        res.render('player_delete', { title: 'Delete player', player: results.player } );
    });

};


exports.player_delete_post = function(req, res, next) {

    async.parallel({
        Player: function(callback) {
         Player.findById(req.body.teamid).exec(callback)
        },
        
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
       
        else {
            // Delete object and redirect to the list of players.
            Player.findByIdAndRemove(req.body.playerid, function deleteplayer(err) {
                if (err) { return next(err); }
                // Success - go to player list
                res.redirect('/catalog/players')
            })
        }
    });
};

exports.player_update_get = function(req, res, next) {

    // Get player, teams , games and roles for form.
    async.parallel({
        player: function(callback) {
            Player.findById(req.params.id).populate('team').populate('game').populate('role').exec(callback);
        },
        teams: function(callback) {
            Team.find(callback);
        },
        games: function(callback) {
            Game.find(callback);
        },
        roles: function(callback) {
            Role.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.player==null) { // No results.
                var err = new Error('Player not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            
            res.render('player_form', { title: 'Update Player', teams:results.teams, games:results.games, roles: results.roles, player: results.player });
        });

};


exports.player_update_post = [
// Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('nickname').isLength({ min: 1 }).trim().withMessage('Nickname must be specified.')
        .isAlphanumeric().withMessage('Nickname has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),

  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a player object with escaped and trimmed data.
        var player = new Player(
          { 
		  
		  first_name: req.body.first_name,
		  nickname: req.body.nickname,
          family_name: req.body.family_name,
          date_of_birth: req.body.date_of_birth,
		  team: req.body.team,
		  game: req.body.game,
		  role: req.body.role,
		  nationality: req.body.nationality,
		  _id:req.params.id
           });

       if (!errors.isEmpty()) {
		   async.parallel({
                team: function(callback) {
                    Team.find(callback);
                },
                game: function(callback) {
                    Game.find(callback);
                },
				role: function(callback) {
                    Role.find(callback);
                },
            },function(err, results) {
                if (err) { return next(err); }
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('player_form', { title: 'Update player', team: results.teams, game: results.games, role: results.roles, errors: errors.array() });
			});
        return;
	   }

           
                     else {

                         Player.findByIdAndUpdate(req.params.id, player, {},function (err) {
                           if (err) { return next(err); }
                           // Player saved. Redirect to player detail page.
                           res.redirect(player.url);
                         });

                     }               
        } 
];