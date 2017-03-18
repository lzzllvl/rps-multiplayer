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


function Player() {
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
}


var gameController = {
  getPlayerNumber: function() {
    var self = this;
    database.ref("players")
      .child("one")
      .once("value")
      .then(function(snap){
      snap.exists() ? self.player_number = "two": self.player_number = "one";
    })
  },
  setUsername: function(name) {
    this.username = name;
  },
  storeUser: function(user) {
    database.ref("players").update({ [this.player_number] : { "name": user.name,
                                     "wins": user.wins,
                                     "losses": user.losses}});
  },
  findGameOutcome: function() {
    var self = this;
    database.ref("players")
    .once("value")
    .then(function(snap) {
      var moveOne = snap.val().one.move;
      var moveTwo = snap.val().two.move;
      var result = self.player_number == "one"
        ? rpsGame.findResult(moveOne, moveTwo)
        : rpsGame.findResult(moveTwo, moveOne);
      domManipulators.renderOutcome(result);
    })
  },
  acceptMove: function(move) {
    database.ref("players/" + this.player_number)
      .update({"move": move});
  },

  opponentListener: function(user) {
    var self = this;
    database.ref("players").on("child_added", function(snapshot) {
      if(self.player_number != snapshot.key){
        domManipulators.opponentJoin(snapshot.val().name);
      }
    })
  },
  removeUser: function() {
    database.ref("players/" + this.player_number).set(null);
  }
}


var chatController = {
  submitMessage: function(text) {
    database.ref("chat").push(text);
  },

  updateScroll: function () {
    database.ref("chat").on("child_added", function(snapshot){
      var message = $("<p>").text(snapshot.val());
      message.appendTo($("#previous"))
    })
  }
}

var domManipulators = {
  userJoin: function(name) {
    $("#top").empty();
    $("<h2>").text("User: " + name).prependTo($("#player1"));
  },

  opponentJoin: function(name) {
    $("<h2>").text("Opponent: "+ name).prependTo($("#player2"))
  },

  renderChoices: function(userId) {
    var rock = $("<h3>").text("ROCK").data("pick", "r");
    var paper = $("<h3>").text("PAPER").data("pick", "p");
    var scissors = $("<h3>").text("SCISSORS").data("pick", "s");
    $(userId)
      .append(rock)
      .append(paper)
      .append(scissors);
  },

  renderWaiting: function() {
    $("#player1").empty().append($("<h4>").text("Waiting for Opponent"));
  },

  addChoiceListener: function() {
    var self = this;
    $("#player1").on("click", "h3", function() {
      var choice = $(this).data("pick");
      gameController.acceptMove(choice);
      self.renderWaiting()
    })
  },

  renderOutcome: function (outcome) {
   $("<h4>").text(outcome).appendTo($("#outcome"));
 },
  reset: function() {

  }

}


$(document).ready(function() {
  //find out player number from database
  gameController.getPlayerNumber();
  domManipulators.renderChoices("#player1");
  domManipulators.renderChoices("#player2");

  $("#userSubmit").on("click", function() {
    var userName = $("#username").val().trim();
    var current = userName ? new Player() : null;
    if(current){
      current.init(userName);
      gameController.setUsername(userName)
      gameController.storeUser(current);
      gameController.opponentListener();
      domManipulators.userJoin(current.name);
      domManipulators.addChoiceListener();
    } else {
      $("#username").val("");
    }
  });

  $("#messager").on("click", function() {
    var text = gameController.username + ": " + $("#send").val().trim();
    console.log(text);
    chatController.submitMessage(text);
    $("#send").val("");
  });
});

$(window).on("unload", function(){
  var text = gameController.username + " disconnected.";
  chatController.submitMessage(text);
  gameController.removeUser();
});
