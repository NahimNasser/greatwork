// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".
Players = new Meteor.Collection("players");
Messages = new Meteor.Collection('messages');

if (Meteor.isClient) {

  Handlebars.registerHelper('formatted_time', function(object) {
  var d = new Date(object);
  return d.toString();
});
  Session.set('page_size', 3);

  Template.messages.messages = function() {
    return Messages.find({}, {sort: {time: -1}}).fetch().slice(0,1);
  };

  Template.player.rendered = function() {
          var $item = $(this.find('.player .score'));
          // Meteor.defer(function() {
          console.log($item);
          $item.addClass('animated flip');
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

  Template.player.events({
    'click': function (e) {
    e.preventDefault();
    var player = this;
      var $great = $(e.target);
      if (!$great.hasClass('player')) {
          $great = $great.parents('.player');
      }

      var $all = $('.accomplishments');

      if ($(e.target).hasClass('name') ||  $(e.target).hasClass('score') || $(e.target).hasClass('player') ){
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
      
    },

    'click input.inc': function (e) {
      $great = $(e.target);
      if (!$great.hasClass('player')) {
          $great = $great.parents('.player');
      }
      Players.update(this._id, {$inc: {score: 5}});
      var victim = Players.findOne(this._id);
      Messages.insert({victim: victim.name, name: Meteor.user().profile.name, message: $great.find('.greatMessage').val(), time: Date.now(), points: 5});
    },

    'click input.dec': function (e) {
      var $great = $(e.target);
      if (!$great.hasClass('player')) {
          $great = $great.parents('.player');
      }
      Players.update(this._id, {$inc: {score: -5}});
      var victim = Players.findOne(this._id);
      Messages.insert({victim: victim.name, name: Meteor.user().profile.name, message: $great.find('.greatMessage').val(), time: Date.now(), points: -5});
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
  Accounts.onCreateUser(function(options, user) {
          user.profile = options.profile;
          user.facebook_id = user.services.facebook.id;
          Players.insert({name: options.profile.name, score: 0, facebook_id:user.services.facebook.id});
        return user;
      });


  Meteor.startup(function () {
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
  });
}
