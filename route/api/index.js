var request = require('request');
var elasticsearch = require('elasticsearch');
var constants = require('../../constants');
var route = require('../index.js');
var dateFormat = require('dateformat');
var Match = require("../../model/Match");

var es_client = new elasticsearch.Client({
  host: constants.elasticsearch,
  log: 'trace'
});

if(!constants.pageAccessToken
  || !constants.api
  || !constants.api.sendMessage
  || !constants.api.userprofile){
  
  console.log('Missing facebook userprofile api configureation');
  process.exit(1);    
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
exports.sendMessage = function(messageData, callback) {
  request({
    uri: constants.api.sendMessage,
    qs: { access_token: constants.pageAccessToken },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
      
      if(callback){
        callback();
      }
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

/*
 * Facebook UserProfile 
 * {
   "first_name": "Phoebe",
   "last_name": "Turing",
   "profile_pic": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/943815_1590926874501601_4115396103879685023_n.jpg?oh=2790f47c957a77b4960c2a9953e40ec3&oe=5802BCA7",
   "locale": "zh_TW",
   "timezone": 8,
   "gender": "female"
}
*/

exports.userprofile = function(user_id, fn){
  request({
    uri: constants.api.userprofile.replace('{USER_ID}', user_id),
    qs: { fields: "first_name,last_name,profile_pic,locale,timezone,gender", access_token: constants.pageAccessToken},
    method: 'GET'

  }, function (error, response, body) {
      fn(JSON.parse(body), error);
  });  
}

/***
Query:
{
  from:0,
  size:1,
  "sort":[
    {"update_time" : {"order":"desc"}},
    {"_score" : {"order":"desc"}}
  ],
  "query": {
    "bool":{
        "must":[
            {
                "query_string":{
                    "query":"電影"
                }
            },
            { "match":{"prefer_gender":0} }
        ],
        "must_not":[
            { "match":{"user_id":"0"} }
        ]
    }
  }
}
**/
exports.createUsers = function(user_id, userPrefer, fn){
  var date = dateFormat(Date.now(), "yyyy/mm/dd HH:MM:ss");
  es_client.create({
    index: 'matches',
    type: 'prefers',
    id: user_id,
    body: {
      user_id: userPrefer.user_id,
      user_gender: userPrefer.user_gender,
      locale: userPrefer.locale,
      gender: userPrefer.gender,
      charge: userPrefer.charge,
      content: userPrefer.content,
      status: userPrefer.status,
      update_time: date
    }
  }, fn);  
}

exports.searchUsers = function(recipientId, activity, block_list, fn){
  
  var musts =[
    {
      simple_query_string:{ query: activity.content, analyzer: "smartcn"}
    },
    { match:{status:0}},
    { match:{locale:activity.locale}},
    { match:{charge:activity.charge.type}}
  ];
  if(activity.gender!=2){
    musts.push({ match:{user_gender:activity.gender}});
  }
  
  var shoulds = [
    { match:{gender:2}},
    { match:{gender:activity.host_gender}}
  ];
  
  var mustnots =[
    //{ match:{user_id:activity.host}}
  ];
  if(block_list && block_list.length>0){
    block_list.forEach(function(block){
      mustnots.push({match:{user_id:block}});
    });    
  }
  
  var query = {
      bool:{
          must:musts,
          should: shoulds,
          must_not: mustnots
      }
  };
  
  this.search(recipientId, 'prefers', query, fn);
}


exports.createActivities = function(activity_id, activity, fn){
  var date = dateFormat(Date.now(), "yyyy/mm/dd HH:MM:ss");
  var body = {
      host: activity.host,
      activity_id: activity_id,
      host_gender: activity.host_gender,
      gender: activity.gender,
      locale: activity.locale,
      content: activity.content,
      status: activity.status,
      update_time: date
  };
  if(activity.charge){
    body.charge = activity.charge.type;
  }
  es_client.create({
    index: 'matches',
    type: 'activities',
    id: activity_id,
    body: body
  }, fn);  
}

exports.searchActivities = function(recipientId, userPrefer, block_list, fn){
  
  var musts =[
    {
      simple_query_string:{ query: userPrefer.content, analyzer: "smartcn"}
    },
    { match:{status:0}},
    { match:{locale:userPrefer.locale}},
    { match:{charge:userPrefer.charge}}
  ];
  if(userPrefer.gender!=2){
    musts.push({ match:{host_gender:userPrefer.gender}});
  }
  
  var shoulds = [
    { match:{gender:2}},
    { match:{gender:userPrefer.user_gender}}
  ];
  
  var mustnots =[
     //{ match:{host:userPrefer.user_id}}
  ];
  if(block_list && block_list.length>0){
    block_list.forEach(function(block){
      mustnots.push({match:{activity_id:block}});
    });    
  }
  
  var query = {
      bool:{
          must:musts,
          should: shoulds,
          must_not: mustnots
      }
  };

  this.search(recipientId, 'activities', query, fn);
}

exports.search = function(recipientId, type, query, fn){
  es_client.search({
    index: 'matches',
    type: type,
    body: {
      from:0,
      size:1,
      "sort":[
        {"update_time" : {"order":"desc"}},
        {"_score" : {"order":"desc"}}
      ],    
      query: query
    }
    }).then(function(response){
      var hits = response.hits;
      var obj={
        total: hits.total
      }
      if(obj.total>0){
        obj['obj'] = hits.hits[0]._source;
      }
      fn(obj);
    } , function (err) {
      fn(null, err);
  });  
}

exports.deleteUser = function(user_id, fn){
  es_client.delete({
    index: 'matches',
    type: 'users',
    id: user_id
  }, fn);  
}

exports.deleteActivity = function(activity_id, fn){
  es_client.delete({
    index: 'matches',
    type: 'activities',
    id: activity_id
  }, fn);  
}

exports.updateDoc = function(type, doc_id, field, value, fn){
  var date = dateFormat(Date.now(), "yyyy/mm/dd HH:MM:ss");
  var body ={
    doc:{}
  };
  body.doc[field] = value;
  body.doc['update_time'] = date;
  es_client.update({
    index: 'matches',
    type: type,
    id: doc_id,
    body: body
  }, fn);
}

exports.initElasticsearch = function(){
  var main = this;
  es_client.indices.delete({
    index: 'matches'
  }, function(err, res){
    if(err){
      console.error('Fail to delete index:%s', JSON.stringify(err));
      return;
    }
    main.initIndex();
  });  
}
exports.initIndex = function(){
    var main = this;
    var index_body = {
      settings: {
        index: {
          analysis: {
            analyzer: {
              default: {
                type: "smartcn"
              }
            }
          }
        }
      }
    };
    es_client.indices.create({
      index: 'matches',
      body: index_body
    }, function(err, res){
      if(err){
        console.error('Fail to create index:%s', JSON.stringify(err));
        return;
      }
      main.initSearchType();
    });  
}

exports.initSearchType = function(){
    var prefer_body = {
      properties: {
          user_id:{
              type:"string"
          },
          user_gender:{
              type: "short"
          },
          user_locale:{
              type: "string"
          },
          gender:{
              type: "short"
          },
          charge:{
              type: "short"
          },
          content: {
              type:      "string",
              analyzer:  "smartcn"
          },
          update_time:{
              type: "date",
              format : "yyyy/MM/dd HH:mm:ss"
          }
      }
    };
    
    var activity_body = {
      properties: {
          activity_id:{
              type:"string"
          },
          host_gender:{
              "type": "short"
          },
          gender:{
              type: "short"
          },
          charge:{
              type: "short"
          },
          locale:{
              type: "string"
          },
          content: {
              type:      "string",
              analyzer:  "smartcn"
          },
          update_time:{
              type: "date",
              format : "yyyy/MM/dd HH:mm:ss"
          }
      }
    };
    es_client.indices.putMapping({
      index: 'matches',
      type: 'prefers',
      body: prefer_body
    }, function(error, response){
      if(error){
        console.error('Fail to put mapping type[prefers]:%s', JSON.stringify(error));
        return;
      }
      es_client.indices.putMapping({
        index: 'matches',
        type: 'activities',
        body: activity_body
      }, function(error, response){
        if(error){
          console.error('Fail to put mapping type[activities]:%s', JSON.stringify(error));
          return;
        }
        console.log('===Elasticsearch init completed.===');
      });
    });  
}