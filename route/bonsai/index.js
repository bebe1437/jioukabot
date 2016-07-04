    var bonsai_url    = "https://5184aqza:utrbngxqbsl9q3mr@yew-9576489.us-east-1.bonsai.io";
    var elasticsearch = require('elasticsearch');
    var client        = new elasticsearch.Client({
                                host: bonsai_url,
                                log: 'trace' 
                            });
    
    // Test the connection...
    client.ping({
        requestTimeout: 30000,
        hello: "elasticsearch"
      },
      function (error) {
        if (error) {
          console.error('elasticsearch cluster is down!');
        } else {
          console.log('All is well');
        }
      }
    );