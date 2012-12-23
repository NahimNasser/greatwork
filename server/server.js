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
