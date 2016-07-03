var restapi = require('./restapi');
var config = require('config');
var querystring = require('querystring');

var USER_PROFILE_HOST = "graph.facebook.com";
var USER_PROFILE_ENDPOINT = "/v2.6/{USER_ID}";
var PAGE_ACCESS_TOKEN = config.get('pageAccessToken');

exports.userprofile = function(fbuserID, fn){
  if(!fbuserID){
    fn('')
  }
  var endpoint = USER_PROFILE_ENDPOINT.replace("{USER_ID}", fbuserID);
  var args = "fields=first_name,last_name,profile_pic,locale,timezone,gender";
  endpoint += '?' + querystring.stringify(args) + '&access_token=' + PAGE_ACCESS_TOKEN ;
  restapi.perform(USER_PROFILE_HOST, endpoint, 'GET', args, function(data){
    fn(data, data.error);
  });
}