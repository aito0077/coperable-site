var config = require('../config'),
  cop_api = require('../api_client/api'),
  users = require('../logic/users'),
  passport = require('passport'),
  us = require('underscore'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy;

passport.serializeUser(function(user, done) {
  var session_user = {
    id: user._id,
    username: user.first_name,
    is_feca: user.feca ? true : false
  };
  done(null, session_user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    console.log('autenticando localmente');
    console.log('Username: '+username+' - password: '+password);
    users.authenticate(username, password, function(err, user) {
      if (err) { return done(err); }
      if (us.isEmpty(user)) {
        return done(null, false, { message: 'Usuario/Password incorrecto.' });
      }
      return done(null, user);
    });
  }
));


var oauthenticate_create = function(accessToken, refreshToken, given_profile, done) {
  var profile = given_profile._json;
  users.oauthenticate(given_profile.provider, given_profile.id, function(err, user) {
    if (err) { 
	console.log(err);
	return done(err); 
    }
    if (us.isEmpty(user) || us.isUndefined(user._id)) {
      var user_data = {};
        
      switch(given_profile.provider) {
        case 'facebook':
          user_data = {
            first_name: given_profile.first_name || given_profile.name.givenName,
            last_name: given_profile.last_name  || given_profile.name.familyName,
            verified: true
          };
          break;
        case 'twitter':
          user_data = {
            first_name: given_profile.username || given_profile.displayName || given_profile.screen_name|| given_profile.name,
            verified: true
          };
          break;

        default:

          break;
      }
	user_data['username'] = user_data['first_name'];
      user_data['authenticate_with'] = given_profile.provider;
      user_data[given_profile.provider+'_id'] = given_profile.id;
		console.dir(user_data);

      cop_api.client.put('/api/usuario', user_data, function(err, req, res, user) {
	console.log(err);
        done(null, user);
      });
    } else {
      return done(null, user);
    }
  });
};


passport.use(new FacebookStrategy({
    clientID: config.system.FACEBOOK_APP_ID,
    clientSecret: config.system.FACEBOOK_APP_SECRET,
    callbackURL: config.system.DOMAIN_BASE+"/auth/facebook/callback"
  },
  oauthenticate_create
));

passport.use(new TwitterStrategy({
    consumerKey: config.system.TWITTER_CONSUMER_KEY,
    consumerSecret: config.system.TWITTER_CONSUMER_SECRET,
    callbackURL: config.system.DOMAIN_BASE+"/auth/twitter/callback"
  },
  oauthenticate_create
));



/*TWITTER

{ id: 18728810,
  id_str: '18728810',
  name: 'aito77',
  screen_name: 'aito77',
  location: '',
  description: '',
  url: null,
  entities: { description: { urls: [] } },
  protected: false,
  followers_count: 0,
  friends_count: 5,
  listed_count: 0,
  created_at: 'Wed Jan 07 17:15:25 +0000 2009',
  favourites_count: 0,
  utc_offset: null,
  time_zone: null,
  geo_enabled: false,
  verified: false,
  statuses_count: 4,
  lang: 'en',
  status: 
   { created_at: 'Tue Jun 03 21:21:42 +0000 2014',
     id: 473937592342155260,
     id_str: '473937592342155265',
     text: 'Time traveling in vim #protip https://t.co/yDYbyngP1S via @coderwall',
     source: '<a href="https://dev.twitter.com/docs/tfw" rel="nofollow">Twitter for Websites</a>',
     truncated: false,
     in_reply_to_status_id: null,
     in_reply_to_status_id_str: null,
     in_reply_to_user_id: null,
     in_reply_to_user_id_str: null,
     in_reply_to_screen_name: null,
     geo: null,
     coordinates: null,
     place: null,
     contributors: null,
     retweet_count: 0,
     favorite_count: 0,
     entities: 
      { hashtags: [Object],
        symbols: [],
        urls: [Object],
        user_mentions: [Object] },
     favorited: false,
     retweeted: false,
     possibly_sensitive: false,
     lang: 'sl' },
  contributors_enabled: false,
  is_translator: false,
  is_translation_enabled: false,
  profile_background_color: 'C0DEED',
  profile_background_image_url: 'http://abs.twimg.com/images/themes/theme1/bg.png',
  profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png',
  profile_background_tile: false,
  profile_image_url: 'http://abs.twimg.com/sticky/default_profile_images/default_profile_2_normal.png',
  profile_image_url_https: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_2_normal.png',
  profile_link_color: '0084B4',
  profile_sidebar_border_color: 'C0DEED',
  profile_sidebar_fill_color: 'DDEEF6',
  profile_text_color: '333333',
  profile_use_background_image: true,
  default_profile: true,
  default_profile_image: true,
  following: false,
  follow_request_sent: false,
  notifications: false,
  suspended: false,
  needs_phone_verification: false }



FACEBOOK
{ id: '503158026',
  education: 
   [ { school: [Object],
       type: 'High School',
       with: [Object],
       year: [Object] },
     { school: [Object], type: 'College' } ],
  favorite_teams: [ { id: '427568640688959', name: 'El Primer Grande' } ],
  first_name: 'Leonardo',
  gender: 'male',
  hometown: { id: '104032629633440', name: 'San Juan, Argentina' },
  last_name: 'Garcia',
  link: 'https://www.facebook.com/profile.php?id=503158026',
  location: { id: '105517529482887', name: 'Ituzaingó, Buenos Aires' },
  locale: 'es_LA',
  name: 'Leonardo Garcia',
  political: 'Al fondo a la Izquierda',
  religion: 'Católico',
  timezone: -3,
  updated_time: '2014-04-01T18:06:57+0000',
  verified: true,
  work: 
   [ { employer: [Object], start_date: '0000-00' },
     { employer: [Object] },
     { employer: [Object] },
     { end_date: '2012-08-31',
       employer: [Object],
       location: [Object],
       position: [Object],
       start_date: '2006-12-01',
       with: [Object] },
     { end_date: '2006-11-01',
       employer: [Object],
       location: [Object],
       position: [Object],
       start_date: '2005-09-01',
       with: [Object] } ] }

*/
