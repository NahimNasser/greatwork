// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".
Players = new Meteor.Collection("players");
Messages = new Meteor.Collection('messages');
if (Meteor.isClient) {
  Meteor.subscribe("players");
  Meteor.subscribe("messages");

  Accounts.ui.config({
    requestPermissions: {
      facebook: ['email', 'publish_actions', 'publish_stream', 'user_online_presence', 'read_friendlists']
    }
  });

  Handlebars.registerHelper('formatted_time', function(object) {
    var d = moment(object);
    return d.fromNow();
  });

  Session.set('page_size', 3);

  Template.messages.messages = function() {
    return Messages.find({}, {sort: {time: -1}}).fetch().slice(0,1);
  };

  Template.player.rendered = function() {
          var $player = $(this.find('.player'));
          var $score = $(this.find('.score'));
          // Meteor.defer(function() {
          // $.scrollTo($player, 800);
          $score.addClass('animated flip');
          $player.addClass('animated bounce');
  };

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.player.selected_great_works = function(){
    return Messages.find({victim: this.name}, {sort: {time: -1}}).fetch().slice(0, Session.get('page_size'));
  };

  Template.player.show_accomplishments = function (e) {
      var player = this;
      var $great = $(e.target);
      if (!$great.hasClass('player')) {
          $great = $great.parents('.player');
      }

      var $all = $('.accomplishments');

      if ($(e.target).hasClass('name') ||  $(e.target).hasClass('score') || $(e.target).hasClass('player') || $(e.target).hasClass('show_details')){
        $all.parents('.player').removeClass("selected");
        if (window.UGH) {
            window.UGH.find('.accomplishments').hide(0, function() {
                $great.find('.accomplishments').show(0, function(){
                  $great.addClass('selected');
                  Session.set("selected_player", player._id);
                  window.UGH = $great;
                  // UGH == great, makes sense! great work yourself jeff
                });
            });
        } else {
                $great.find('.accomplishments').slideDown(0, function(){
                  $great.addClass('selected');
                  Session.set("selected_player", player._id);
                  window.UGH = $great;
                });
        }

      }
  };

  Template.player.events({
    'click': function (e) {
      e.preventDefault();
      Template.player.show_accomplishments(e);
    },

    'click .show_details': function (e){
      e.preventDefault();
      Template.player.show_accomplishments(e);
    },

    'click input.inc': function (e) {
      var $great = $(e.target);
      if (!$great.hasClass('player')) {
          $great = $great.parents('.player');
      }

      Meteor.call('giveTakeGreatWork', {
        victim: this,
        message: $great.find('.greatMessage').val(),
        points: 5
      });

    },

    'click input.dec': function (e) {
      var $great = $(e.target);
      if (!$great.hasClass('player')) {
          $great = $great.parents('.player');
      }

      Meteor.call('giveTakeGreatWork', {
        victim: this,
        message: $great.find('.greatMessage').val(),
        points: -5
      });
    },

    'click #showmore': function (e) {
      Session.set('page_size', 2 * Session.get('page_size'));
    },

    'click #showless': function (e) {
      Session.set('page_size', 3);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.publish("players", function (){
    return Players.find({});
  });

  Meteor.publish("messages", function (){
    return Messages.find({});
  });

  Accounts.onCreateUser(function(options, user) {
          user.profile = options.profile;
          user.profile.services = user.services;
          //Additional facebook data whoring:
          var result = Meteor.http.get("https://graph.facebook.com/me", {params: {access_token: user.services.facebook.accessToken}});
          user.profile.services.facebook.meData = result.data;
          Players.insert({name: options.profile.name, score: 0, facebook_id:user.services.facebook.id}); //Eventually, this needs to be moved to a post-creation hook
        return user;
      });
  Meteor.Router.add('/404', [404, "There's nothing here!"]);

  Meteor.startup(function () {

    // All values listed below are default
    collectionApi = new CollectionAPI({
      authToken: undefined,              // Require this string to be passed in on each request
      apiPath: 'greatapi',          // API path prefix
      standAlone: false,                 // Run as a stand-alone HTTP(S) server
      sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
      listenPort: 3005,                  // Port to listen to (stand-alone only)
      listenHost: undefined,             // Host to bind to (stand-alone only)
      privateKeyFile: 'privatekey.pem',  // SSL private key file (only used if SSL is enabled)
      certificateFile: 'certificate.pem' // SSL certificate key file (only used if SSL is enabled)
    });

    // Add the collection Players to the API "/players" path
    collectionApi.addCollection(Players, 'players', {
      // All values listed below are default
      authToken: undefined,                   // Require this string to be passed in on each request
      methods: ['POST','GET','PUT','DELETE']  // Allow creating, reading, updating, and deleting
    });

    collectionApi.addCollection(Messages, 'messages', {
      // All values listed below are default
      authToken: undefined,                   // Require this string to be passed in on each request
      methods: ['POST','GET','PUT','DELETE']  // Allow creating, reading, updating, and deleting
    });

    // Starts the API server
    collectionApi.start();
  });

  // Meteor.startup(function () {
    // if (Players.find().count() === 0) {
    //   var names = ["Ada Lovelace",
    //   "Grace Hopper",
    //   "Marie Curie",
    //   "Carl Friedrich Gauss",
    //   "Nikola Tesla",
    //   "Claude Shannon"];
    //   for (var i = 0; i < names.length; i++)
    //     Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
    // }
  // });
}
