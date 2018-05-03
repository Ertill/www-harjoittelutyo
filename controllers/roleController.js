var Role = require('../models/role');
var Player = require('../models/player');
var Team = require('../models/team');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Roles.
exports.role_list = function(req, res, next) {
	
  Role.find({}, 'name')   
    .exec(function (err, list_roles) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('role_list', { title: 'Role List', role_list: list_roles});
    });
};

// Display detail page for a specific Role.
exports.role_detail = function(req, res) {
   async.parallel({
        role: function(callback) {
            Role.findById(req.params.id)
              .exec(callback);
        },

        role_players: function(callback) {
          Player.find({'role' :req.params.id})
		  .populate('team')
          .exec(callback);
        },

		

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.role==null) { // No results.
            var err = new Error('Role not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('role_detail', { title: 'Role Detail', role: results.role, role_players: results.role_players } );
    });
};

// Display role create form on GET.
exports.role_create_get = function(req, res, next) {       
    res.render('role_form', { title: 'Add role' });
};

// Handle role create on POST.
exports.role_create_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Role name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a role object with escaped and trimmed data.
        var role = new Role(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('role_form', { title: 'Add Role', role: role, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if role with same name already exists.
            Role.findOne({ 'name': req.body.name })
                .exec( function(err, found_role) {
                     if (err) { return next(err); }

                     if (found_role) {
                         // Role exists, redirect to its detail page.
                         res.redirect(found_role.url);
                     }
                     else {

                         role.save(function (err) {
                           if (err) { return next(err); }
                           // Role saved. Redirect to role detail page.
                           res.redirect(role.url);
                         });

                     }

                 });
        }
    }
];

// Display role delete form on GET.
exports.role_delete_get = function(req, res, next) {

    async.parallel({
        role: function(callback) {
            Role.findById(req.params.id).exec(callback)
        },
        role_players: function(callback) {
          Player.find({ 'role': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.role==null) { // No results.
            res.redirect('/catalog/roles');
        }
        // Successful, so render.
        res.render('role_delete', { title: 'Delete role', role: results.role, role_players: results.role_players } );
    });

};;

// Handle role delete on POST.
exports.role_delete_post = function(req, res, next) {

    async.parallel({
        role: function(callback) {
          Role.findById(req.body.teamid).exec(callback)
        },
        role_players: function(callback) {
          Player.find({ 'role': req.body.roleid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.role_players.length > 0) {
            // Role has players. Render in same way as for GET route.
            res.render('role_delete', { title: 'Delete role', role: results.role, role_players: results.role_players } );
            return;
        }
        else {
            // Role has no players. Delete object and redirect to the list of games.
            Role.findByIdAndRemove(req.body.roleid, function deleterole(err) {
                if (err) { return next(err); }
                // Success - go to role list
                res.redirect('/catalog/roles')
            })
        }
    });
};;

// Display role update form on GET.
exports.role_update_get = function(req, res, next) { 
	async.parallel({
		role: function(callback) {
			Role.findById(req.params.id).exec(callback);
		},
	},
		function(err, results) {
            if (err) { return next(err); }
            if (results.role==null) { // No results.
                var err = new Error('role not found');
                err.status = 404;
                return next(err);
            }
		
    res.render('role_form', { title: 'Update role', role: results.role });
		});
};

// Handle role update on POST.
exports.role_update_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'role name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a role object with escaped and trimmed data.
        var role = new Role(
          { name: req.body.name,
		    _id:req.params.id
		  }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('role_form', { title: 'Update role', role: role, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if role with same name already exists.
            Role.findOne({ 'name': req.body.name })
                .exec( function(err, found_role) {
                     if (err) { return next(err); }

                     if (found_role) {
                         // Role exists, redirect to its detail page.
                         res.redirect(found_role.url);
                     }
                     else {

                         Role.findByIdAndUpdate(req.params.id, role, function (err) {
                           if (err) { return next(err); }
                           // Role updated. Redirect to role detail page.
                           res.redirect(role.url);
                       });
                     }
                 });
       }
    }
];