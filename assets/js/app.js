// Initialize Firebase
var config = {
  apiKey: "AIzaSyCXXB_tEegxmS3qIqo8JuVL14vmClvFLRM",
  authDomain: "gl-rps-multiplayer.firebaseapp.com",
  databaseURL: "https://gl-rps-multiplayer.firebaseio.com",
  storageBucket: "gl-rps-multiplayer.appspot.com",
  messagingSenderId: "495578356922"
};
firebase.initializeApp(config);
const database = firebase.database();

var rpsGame = {
  init: function(first, second) {
    this.p1 = first ;
    this.p2 = second;
    this.turn = first;
  },
  makeMove: function(player, choice) {
    if(player == this.p1) {
      this.playerMove = choice;
      this.turn = this.p2;
    } else {
      this.findResult(this.playerMove, choice);
    }
  },
  findResult: function (user, opponent) {
    if(user == opponent) {
      return this.CONST.tie;
    }
    else if(user == "r") {
      return opponent == "p" ? this.CONST.loss: this.CONST.win;
    }
    else if(user == "p") {
      return opponent == "s" ? this.CONST.loss: this.CONST.win;
    }
    else if(user == "s") { // this `else if` technically could be just an `else`, but I feel it makes the code easier to understand
      return opponent == "r" ? this.CONST.loss: this.CONST.win;
    }
  },
  CONST: {
    win: "Congrats! You Won!",
    loss: "Too Bad, You Lost.",
    tie: "It's a tie, meh."
  }
}


function player() {
  self = this;
  this.init = function(name) {
    self.wins = 0;
    self.losses = 0;
    self.name = name;
  };
  this.wonGame = function(){
    self.wins++;
  };
  this.lostGame = function() {
    self.losses++;
  };
  this.getPlayerNumber = function() {
    database.ref("players")
      .child("one")
      .once("value")
      .then(function(snap){
      snap.exists() ? self.player_number = "two": self.player_number = "one";
    });
  };
}


var gameController = {

  storeUser: function(user) {
    var player = "player" + this.player_number;
    database.ref("players").update({ [user.player_number] : { "name": user.name,
                                     "wins": user.wins,
                                     "losses": user.losses}});
  },
  acceptMove: function() {



  },
  submitMove: function() {
  },
  // opponentListener: function() {
  //   database.ref("players").orderByValue().on("child_added", function(snapshot) {
  //     console.log(snapshot);
  //   })
  // },
  removeUser: function() {

  }
}

var chatController = {
  submitMessage: function(text) {
    database.ref("chat").push(text);
  },
  updateScroll: function () {
    database.ref("chat").on("child_added", function(snapshot){
      var message = $("<p>").text(snapshot.val());
      message.appendTo($("#chat"))
    })
  }
}
