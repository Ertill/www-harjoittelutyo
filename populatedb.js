#! /usr/bin/env node

console.log('This script populates some test players, games, teams and roles to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Player = require('./models/Player')
var Game = require('./models/Game')
var Team = require('./models/Team')
var Role = require('./models/Role')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var players = []
var games = []
var teams = []
var roles = []

function playerCreate(first_name, family_name, nickname, nationality, d_birth, team, game, role, cb) {
  playerdetail = {
	  first_name: first_name , 
	  family_name: family_name,
	  nickname: nickname,
	  nationality: nationality,
	  team: team,
	  game: game,
	  role: role
	  }
  if (d_birth != false) playerdetail.date_of_birth = d_birth
  
  var player = new Player(playerdetail);
       
  player.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Player: ' + player);
    players.push(player)
    cb(null, player)
  }  );
}

function gameCreate(name, cb) {
  var game = new Game({ name: name });
       
  game.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Game: ' + game);
    games.push(game)
    cb(null, game);
  }   );
}

function teamCreate(name,game, cb) {
	teamdetail = {
		name: name,
		game: game
	}
 var team = new Team(teamdetail);

  team.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Team: ' + team);
    teams.push(team)
    cb(null, team)
  }  );
}

function roleCreate(name, cb) {
 var role = new Role({ name: name });

  role.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Role: ' + role);
    roles.push(role)
    cb(null, role)
  }  );
}

function createGames(cb) {
    async.parallel([
        function(callback) {
          gameCreate('Overwatch', callback);
        },      
	    function(callback) {
          gameCreate('League Of Legends', callback);
        },
		 function(callback) {
          gameCreate('Counter-Strike: Global Offensive', callback);
        },
		 function(callback) {
          gameCreate('DotA 2', callback);
        }
		
        ],
        // optional callback
        cb);
}

function createTeams(cb) {
    async.parallel([
        function(callback) {
		teamCreate('SK Telecom T1',games[1], callback);
        },
        function(callback) {
          teamCreate('Houston Outlaws',games[0], callback);
        },
		function(callback) {
          teamCreate('Shanghai Dragons',games[0], callback);
        },
		function(callback) {
		teamCreate('Cloud9',[games[1],games[2]], callback);
        },
		function(callback) {
          teamCreate('Fnatic',[games[1],games[2],games[3]], callback);
        }
		
        ],
        // optional callback
        cb);
}
function createRoles(cb) {
	async.parallel([
		function(callback) {
		roleCreate('Jungle', callback);
		},
		function(callback) {
		roleCreate('Top', callback);
		},
		function(callback) {
		roleCreate('Mid', callback);
		},
		function(callback) {
		roleCreate('Adc', callback);
		},
		function(callback) {
		roleCreate('Support', callback);
		},
		function(callback) {
		roleCreate('Tank', callback);
		},
		function(callback) {
		roleCreate('DPS', callback);
		}
		
		],
		// optional callback
		cb);
}

function createPlayers(cb) {
	async.parallel([
		function(callback) {
		playerCreate('Se-yeon','Kim','Geguri','South-Korea', '1999-06-26', teams[2], games[0], roles[5], callback);
		},
		function(callback) {
		playerCreate('Austin','Wilmot','Muma','United States', '1998-08-17', teams[1], games[0], roles[5], callback);
		},
		function(callback) {
		playerCreate('Sang-hyeok','Lee','Faker','South-Korean', '1996-05-07', teams[0], games[1], roles[3], callback);
		},
		function(callback) {
		playerCreate('Zachary','Scuderi','Sneaky','United States', '1994-04-19', teams[3], games[1], roles[4], callback);
		}
		
		],
		// optional callback
		cb);
		
}
			
		async.series([
    createGames,
	createRoles,
	createTeams,
	createPlayers
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('PLAYERInstances: '+players);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		