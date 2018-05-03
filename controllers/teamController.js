var Team = require('../models/team');
var Player = require('../models/player');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
// Display list of all teams.
exports.team_list = function(req, res, next) {

  Team.find({}, 'name')   
    .exec(function (err, list_teams) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('team_list', { title: 'Team List', team_list: list_teams});
    });
    
};

// Display detail page for a specific team.
exports.team_detail = function(req, res) {
    async.parallel({
        team: function(callback) {
            Team.findById(req.params.id)
              .exec(callback);
        },

        team_players: function(callback) {
          Player.find({'team' :req.params.id})
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.team==null) { // No results.
            var err = new Error('Team not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('team_detail', { title: 'Team Detail', team: results.team, team_players: results.team_players } );
    });
};

// Display team create form on GET.
exports.team_create_get = function(req, res, next) {       
    res.render('team_form', { title: 'Add team' });
};

// Handle team create on POST.
exports.team_create_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Team name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a team object with escaped and trimmed data.
        var team = new Team(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('team_form', { title: 'Add team', team: team, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if team with same name already exists.
            Team.findOne({ 'name': req.body.name })
                .exec( function(err, found_team) {
                     if (err) { return next(err); }

                     if (found_team) {
                         // Team exists, redirect to its detail page.
                         res.redirect(found_team.url);
                     }
                     else {

                         team.save(function (err) {
                           if (err) { return next(err); }
                           // Team saved. Redirect to team detail page.
                           res.redirect(team.url);
                         });

                     }

                 });
        }
    }
];

// Display team delete form on GET.
exports.team_delete_get = function(req, res, next) {

    async.parallel({
        team: function(callback) {
            Team.findById(req.params.id).exec(callback)
        },
        teams_players: function(callback) {
          Player.find({ 'team': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.team==null) { // No results.
            res.redirect('/catalog/teams');
        }
        // Successful, so render.
        res.render('team_delete', { title: 'Delete team', team: results.team, team_players: results.teams_players } );
    });

};

// Handle team delete on POST.
exports.team_delete_post = function(req, res, next) {

    async.parallel({
        Team: function(callback) {
          Team.findById(req.body.teamid).exec(callback)
        },
        teams_players: function(callback) {
          Player.find({ 'team': req.body.teamid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.teams_players.length > 0) {
            // Team has players. Render in same way as for GET route.
            res.render('team_delete', { title: 'Delete team', team: results.team, team_players: results.teams_players } );
            return;
        }
        else {
            // Team has no players. Delete object and redirect to the list of teams.
            Team.findByIdAndRemove(req.body.teamid, function deleteteam(err) {
                if (err) { return next(err); }
                // Success - go to team list
                res.redirect('/catalog/teams')
            })
        }
    });
};

// Display team update form on GET.
exports.team_update_get = function(req, res, next) { 
	async.parallel({
		team: function(callback) {
			Team.findById(req.params.id).exec(callback);
		},
	},
		function(err, results) {
            if (err) { return next(err); }
            if (results.team==null) { // No results.
                var err = new Error('Team not found');
                err.status = 404;
                return next(err);
            }
		
    res.render('team_form', { title: 'Update team', team: results.team });
		});
};

// Handle team update on POST.
exports.team_update_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Team name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a team object with escaped and trimmed data.
        var team = new Team(
          { name: req.body.name,
		    _id:req.params.id
		  }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('team_form', { title: 'Update team', team: team, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if team with same name already exists.
            Team.findOne({ 'name': req.body.name })
                .exec( function(err, found_team) {
                     if (err) { return next(err); }

                     if (found_team) {
                         // Team exists, redirect to its detail page.
                         res.redirect(found_team.url);
                     }
                     else {

                         Team.findByIdAndUpdate(req.params.id, team, function (err) {
                           if (err) { return next(err); }
                           // Team updated. Redirect to team detail page.
                           res.redirect(team.url);
                         });
                     }
                 });
       }
    }
];