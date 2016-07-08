var api = require("../route/api");

var user_id ="mary";
var userPrefer={
    user_gender: 1,
    gender: 0,
    charge: 0,
    locale: 'zh_TW',
    content: '電影跟旅行'
};

var adds=[];
adds.push({
    user_id:"mary",
    prefer:{
        user_gender: 1,
        gender: 0,
        charge: 0,
        locale: 'zh_TW',
        content: '電影跟旅行'        
    }
});

adds.push({
    user_id:"john",
    prefer:{
        user_gender: 0,
        gender: 1,
        charge: 0,
        locale: 'zh_TW',
        content: '電影'        
    }
});
adds.push({
    user_id:"candy",
    prefer:{
        user_gender: 1,
        gender: 1,
        charge: 0,
        locale: 'zh_TW',
        content: '旅行'        
    }
});
adds.push({
    user_id:"andy",
    prefer:{
        user_gender: 0,
        gender: 0,
        charge: 0,
        locale: 'zh_TW',
        content: '電影'        
    }
});

/*
adds.forEach(function(add){
   api.createUsers(add.user_id, add.prefer, function(error, response){
    if(error){
        console.log(JSON.stringify(error));
        return;
    }
        console.log(JSON.stringify(response));
    }); 
});
*/
var user_id = 'mary';
var activity = {
    host: 'mary',
    host_gender: 0,
    content: '來去看電影吧',
    gender: 1,
    locale: 'zh_TW',
    charge:{
        type: 0
    }    
}
var block_list=[];

api.searchUsers(user_id, activity, block_list, function(response, err){
    if(err){
        console.log(JSON.stringify(err));
        return;
    }
    
    console.log(JSON.stringify(response));
});