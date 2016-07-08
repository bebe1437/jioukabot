var api = require("../route/api");

var user_id ="mary";

var adds=[];
adds.push({
    activity:{
        activity_id: "a001",
        host: 'mary',
        host_gender: 1,
        content: '來去看電影吧',
        locale: 'zh_TW',
        gender: 0,
        charge:{
            type: 0
        }       
    }
});
adds.push({
    activity:{
        activity_id: "a002",
        host: 'candy',
        host_gender: 1,
        content: '來去看電影吧',
        locale: 'zh_TW',
        gender: 0,
        charge:{
            type: 0
        }       
    }
});
adds.push({
    activity:{
        activity_id: "a003",
        host: 'john',
        host_gender: 0,
        content: '來去看電影吧',
        locale: 'zh_TW',
        gender: 1,
        charge:{
            type: 0
        }       
    }
});

/*
adds.forEach(function(add){
   api.createActivities(add.activity.activity_id, add.activity, function(error, response){
    if(error){
        console.log(JSON.stringify(error));
        return;
    }
        console.log(JSON.stringify(response));
    }); 
});

*/


var user_id = 'mary';
var userPrefer = {
    user_id: user_id,
    user_gender: 1,
    gender: 0,
    charge: 0,
    locale: 'zh_TW',
    content: '看電影'
}
var block_list=[];

api.searchActivities(user_id, userPrefer, block_list, function(hits, err){
     if(err){
        console.log(JSON.stringify(err));
        return;
    }
    console.log('result:%s', JSON.stringify(hits));
});