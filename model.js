Players = new Meteor.Collection("players");

Messages = new Meteor.Collection('messages');

Players.allow({
    insert: function (name, score){
        return false;
    },
    update: function (userId, players, fields, modifier){
        return _.all(players, function (player) {
        if (Meteor.user().facebook_id === player.facebook_id) {return false;}
        else {return true;}
    });

    }
});