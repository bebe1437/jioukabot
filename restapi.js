var https = require('https');

exports.perform = function(host, endpoint, method, data, success){
  console.log('===START REST API:%s===', method);
  var dataString = JSON.stringify(data);
  var headers = {};
  
  if (method != 'GET') {
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    };
  }
  
  console.log('===ENDPOINT===');
  console.log(endpoint);
  
  var options = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      console.log('===RESPONSE===');
      console.log(responseString);
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}