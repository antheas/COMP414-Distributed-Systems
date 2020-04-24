var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user_model.js');
var Game = require('./game_model.js');

var tournament_round = new mongoose.Schema({
  // tournament_id: {
  //   type: mongoose.Types.ObjectId,
  //   required: true
  // },
  round_number: {
    type: Number,
    default: 0,
    required: true
  },
  games: [{
    type: Schema.Types.ObjectId,
    ref: 'game'
  }],
  queue: [{
    type: String,
    ref: 'user'
  }],
  date_created: {
    type: Date,
    default: Date.now
  }
});



var tournament = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  date_created: {
    type: Date,
    required: true,
    default:Date.now
  },
  has_started: {
    type: Boolean,
    required: true,
    default: false
  },
  has_ended: {
    type: Boolean,
    required: true,
    default: false
  },
  rounds: [{
    type: mongoose.Types.ObjectId,
    ref: 'tournament_round'
  }],
  participants: {
    type: [{ type: String, ref: 'User'}],
    validate: {
      validator: function (v) { //@TODO: remove validation
          return v.length <= 1
      },
      message: 'No more users'
    }
  }
});

var TournamentRound = mongoose.model('tournament_round', tournament_round);
var Tournament = mongoose.model('tournament', tournament);

function arrayLimit(val) {
  console.log("LENGTH IS "+val.length);
  return val.length <= 1;
}

module.exports = {
  Tournament:Tournament,
  TournamentRound: TournamentRound
};     