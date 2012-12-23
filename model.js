
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

Messages.allow({
    insert: function (userId, doc){
        if (doc.name === doc.victim) {return false;}
        else { return true;}
    }
});

Meteor.methods({
    giveTakeGreatWork: function (options){
        options = options || {};
        Players.update(options.victim._id, {$inc: {score: -5}});
        Messages.insert({victim: options.victim.name, name: options.name, message: options.message, time: Date.now(), points: options.points});
        var to = Meteor.users.findOne({"profile.name": options.victim.name}).profile.services.facebook.email;
        //To customize mail delievery,  use
        // process.env.MAIL_URL = smtp://USERNAME:PASSWORD@HOST:PORT/
        Email.send({
            from: "noreply@greatworkapp.com",
            to: to,
            replyTo: "great@greatworkapp.com",
            subject: "Great work, from " + options.name,
            html: '<html><h1>' + options.name + ' has given you great work! <br /><strong>"' + options.message + '"</strong></h1><br /><h2>' + options.points + ' points received.</h2> <br /> Watch the action live at <a href="http://www.greatworkapp.com">GreatWork</a></html>'
        });
    }
});