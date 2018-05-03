var express = require('express');
var router = express.Router();

// Require controller modules.
var player_controller = require('../controllers/playerController');
var role_controller = require('../controllers/roleController');
var game_controller = require('../controllers/gameController');
var team_controller = require('../controllers/teamController');

/// player ROUTES ///

// GET catalog home page.
router.get('/', player_controller.indexRouter);

// GET request for creating a player. NOTE This must come before routes that display player (uses id).
router.get('/player/create', player_controller.player_create_get);

// POST request for creating player.
router.post('/player/create', player_controller.player_create_post);

// GET request to delete player.
router.get('/player/:id/delete', player_controller.player_delete_get);

// POST request to delete player.
router.post('/player/:id/delete', player_controller.player_delete_post);

// GET request to update player.
router.get('/player/:id/update', player_controller.player_update_get);

// POST request to update player.
router.post('/player/:id/update', player_controller.player_update_post);

// GET request for one player.
router.get('/player/:id', player_controller.player_detail);

// GET request for list of all player items.
router.get('/players', player_controller.player_list);

/// role ROUTES ///

// GET request for creating role. NOTE This must come before route for id (i.e. display role).
router.get('/role/create', role_controller.role_create_get);

// POST request for creating role.
router.post('/role/create', role_controller.role_create_post);

// GET request to delete role.
router.get('/role/:id/delete', role_controller.role_delete_get);

// POST request to delete role.
router.post('/role/:id/delete', role_controller.role_delete_post);

// GET request to update role.
router.get('/role/:id/update', role_controller.role_update_get);

// POST request to update role.
router.post('/role/:id/update', role_controller.role_update_post);

// GET request for one role.
router.get('/role/:id', role_controller.role_detail);

// GET request for list of all roles.
router.get('/roles', role_controller.role_list);

/// game ROUTES ///

// GET request for creating a game. NOTE This must come before route that displays game (uses id).
router.get('/game/create', game_controller.game_create_get);

//POST request for creating game.
router.post('/game/create', game_controller.game_create_post);

// GET request to delete game.
router.get('/game/:id/delete', game_controller.game_delete_get);

// POST request to delete game.
router.post('/game/:id/delete', game_controller.game_delete_post);

// GET request to update game.
router.get('/game/:id/update', game_controller.game_update_get);

// POST request to update game.
router.post('/game/:id/update', game_controller.game_update_post);

// GET request for one game.
router.get('/game/:id', game_controller.game_detail);

// GET request for list of all game.
router.get('/games', game_controller.game_list);

/// team ROUTES ///

// GET request for creating a team. NOTE This must come before route that displays team (uses id).
router.get('/team/create', team_controller.team_create_get);

// POST request for creating team. 
router.post('/team/create', team_controller.team_create_post);

// GET request to delete team.
router.get('/team/:id/delete', team_controller.team_delete_get);

// POST request to delete team.
router.post('/team/:id/delete', team_controller.team_delete_post);

// GET request to update team.
router.get('/team/:id/update', team_controller.team_update_get);

// POST request to update team.
router.post('/team/:id/update', team_controller.team_update_post);

// GET request for one team.
router.get('/team/:id', team_controller.team_detail);

// GET request for list of all team.
router.get('/teams', team_controller.team_list);

module.exports = router;