var request = require('request');

request('http://www.opendataphilly.org/api/resources/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	var resources = JSON.parse(body);
  	var newResources = [];
  	for(var i=0; i<resources.length; i++) {
  		var newResource = {};
  		if(resources[i].organization == "City of Philadelphia") {
  			newResource.Title = resources[i].name;
  			newResource.Description = resources[i].short_description;
  			newResources.push(newResource);
  		}
  	}
  	console.log(newResources);
  }
});

