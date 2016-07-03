var command = require('./command');
var UserSys = require('./model/UserSys');
var hold = require('./hold');
var user_id = '1155742751164216';


//command.postback(user_id, '$HOLD_CHARGE.POCKETMONEY'); 
//command.savefield(user_id, "HOLD.CHARGE/PRICE$b63e81a7-dd66-4661-94c0-6466d0cc757a", '2000'); 
//command.postback(user_id, '$HOLD_CHARGE.FREE');

//hold.testMessage(user_id, 'free?');


var Sync = require('sync');
 
var MyNewFunctionThatUsesFibers = function(a, b) { // <-- no callback here 
	
	// we can use yield here 
	// yield(); 
	
	// or throw an exception! 
	// throw new Error('something went wrong'); 
	
	// or even sleep 
	// Sync.sleep(200); 
	
	// or turn fs.readFile to non-blocking synchronous function 
	// var source = require('fs').readFile.sync(null, __filename) 
	
	return a + b; // just return a value 
	
}.async() // <-- here we make this function friendly with async environment 
 
// Classic asynchronous nodejs environment 
var MyOldFashoinAppFunction = function() {
	
	// We just use our MyNewFunctionThatUsesFibers normally, in a callback-driven way 
	MyNewFunctionThatUsesFibers(2, 3, function(err, result){
		
		// If MyNewFunctionThatUsesFibers will throw an exception, it will go here 
		if (err) return console.error(err);
		
		// 'return' value of MyNewFunctionThatUsesFibers 
		console.log(result); // 5 
	})
}
 
// From fiber environment 
//Sync(function(){
	
	// Run MyNewFunctionThatUsesFibers synchronously 
	var result = MyNewFunctionThatUsesFibers(2, 3);
	console.log(result); // 5 
	
	// Or use sync() for it (same behavior) 
	var result = MyNewFunctionThatUsesFibers.sync(null, 2, 3);
	console.log(result); // 5 
//})