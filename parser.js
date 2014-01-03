var request = require('request');
var fs = require('fs');

request('http://www.opendataphilly.org/api/resources/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
  	var resources = JSON.parse(body);
	var newResources = [];
	//iterates over each resource
  	for(var i=0; i<resources.length; i++) {
  		var newResource = {};
		var org = resources[i].organization.toLowerCase();
		  //if resource's organization is city of philadelphia
		  if(org == "city of philadelphia" || org == "city of philadelphia ") {
			  //rename properties to conform with CCMS
			  newResource.title = resources[i].name;
			  newResource.description = resources[i].short_description;
			  var nameArray = [];
			  for (var j = 0; j <resources[i].tags.length; j++){
				nameArray.push(resources[i].tags[j].name);
			  }
			  newResource.keyword = nameArray;
			  newResource.modified = resources[i].release_date;
			  newResource.publisher = resources[i].organization;
			  newResource.accessURL = resources[i].url;
			  newResource.identifier = resources[i].id;
			  newResources.push(newResource);
		  }
  	}
  	//write transformed JSON data, now in CCMS, to a file called CCMSdata.json
	fs.writeFile("CCMSdata.json", JSON.stringify(newResources, null, 4), function(err) {
	    if(err) {
		console.log(err);
	    } else {
		console.log("The file was saved!");
	    }
	});
	console.log(newResources);
  }
});


