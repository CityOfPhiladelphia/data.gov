var request = require('request');
var fs = require('fs');

request('http://www.opendataphilly.org/api/resources/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	var resources = JSON.parse(body);
	var newResources = [];
	//iterates over each object
  	for(var i=0; i<resources.length; i++) {
  		var newResource = {};
		var org = resources[i].organization.toLowerCase();
		  //if resource's organization is city of philadelphia
		  if(org == "city of philadelphia" || org == "city of philadelphia ") {
			  //rename properties to conform with CCMS
			  newResource.title = resources[i].name;
			  newResource.description = resources[i].short_description;
			  newResource.keyword = resources[i].tags[0].name;
			  newResource.modified = resources[i].release_date;
			  newResource.publisher = resources[i].organization;
			  newResources.push(newResource);
		  }
  	}
	console.log(resources[i].tags[0].name);
	fs.writeFile("CCMSdata.json", JSON.stringify(newResources), function(err) {
	    if(err) {
		console.log(err);
	    } else {
		console.log("The file was saved!");
	    }
	});
	console.log(newResources);
  }
});


