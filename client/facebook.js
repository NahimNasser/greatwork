facebookinit = function() {
    // init the FB JS SDK
    appId = Accounts.loginServiceConfiguration.findOne({service: 'facebook'}).appId;
    FB.init({
      appId      : appId, // App ID from the App Dashboard
      channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File for x-domain communication
      status     : true, // check the login status upon init?
      cookie     : true, // set sessions cookies to allow your server to access the session?
      xfbml      : true  // parse XFBML tags on this page?
    });

    // Additional initialization code such as adding Event Listeners goes here

  };

  // Load the SDK's source Asynchronously
  // Note that the debug version is being actively developed and might 
  // contain some type checks that are overly strict. 
  // Please report such bugs using the bugs tool.
  (function(d, debug){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
     ref.parentNode.insertBefore(js, ref);
   }(document, /*debug*/ false));

      function sendRequestViaMultiFriendSelector() {
        FB.ui({method: 'apprequests',
          message: 'You are currently being ridiculed on the wall of great work. Join now to fight back!'
        }, requestCallback);
      }
      
      function requestCallback(response) {
        // console.log(response);
      }