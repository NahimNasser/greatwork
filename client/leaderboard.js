
// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".
if (Meteor.isClient) {
  Template.player.preserve({
        '.player': function (node) {return node.id; }
      });
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

  Template.currentplayer.currentplayer = function(){
    if (Meteor.user().profile) {
      return Players.findOne({name: Meteor.user().profile.name});
    }
  };

  Template.currentplayer.rendered = function(){
    var $score = $(this.find('.current-score'));
    $score.addClass('animated flipInX');
  };

  Template.player.rendered = function() {
          var self = this;
          var $player = $(this.find('.player'));
          var $name = $(this.find('.name'));
          if (self.data.name.length > 25){
              $name.addClass('small-font');
            }
          if (self.first_render_complete){
            var $score = $(this.find('.score'));
            Meteor.defer(function() {
                $score.addClass('animated flip');
                $player.addClass('animated bounce');
            });
        }
        else {
          $player.addClass('animated flipInX');
          self.first_render_complete = true;
        }
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

  Template.currentplayer.events({
    'click .fb_invite': function(e){
      facebookinit();
      sendRequestViaMultiFriendSelector();
    }
  });

  Template.player.events({
    'click, click.show_details': function(e) {
      e.preventDefault();
      var $great = $(e.target);
      if (!$great.hasClass('player')) {
          $great = $great.parents('.player');
      }

      if (! $(e.target).hasClass('give')){
        if (! $great.find('.accomplishments').is(":visible")) {
          $('.accomplishments').slideUp();
          $great.find('.accomplishments').slideDown();
        }
        else {
          $('.accomplishments').slideUp();
        }
      }
    },

    'click .give': function(e){
        e.preventDefault();
        $(e.target).closest('.front_card').css({
          display: 'none'
        });
        $thisComment = $(e.target).closest('.front_card').next();
        $thisComment.addClass('animated bounceIn');
        $thisComment.css({
          display: 'block'
        });
    },

    'click input.inc': function (e) {
      e.preventDefault();
      var $great = $(e.target);
      if (!$great.hasClass('player')) {
          $great = $great.parents('.player');
      }
      var msg = $great.find('.greatMessage');
      if (msg.val() === "") {
        toastr.error("You must specify a great work message.");
      }
      else {

        Meteor.call('giveTakeGreatWork', {
          victim: this,
          message: $great.find('.greatMessage').val(),
          points: 5
        }, function (error, result){
          if (error){
            toastr.error(error.reason);
          }
        });

        $great.find('.greatMessage').val('');

      }
    },

    'click #showmore': function (e) {
      Session.set('page_size', 2 * Session.get('page_size'));
    },

    'click #showless': function (e) {
      Session.set('page_size', 3);
    }
  });
}
