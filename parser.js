// Include required modules.
var request = require('request');
var fs = require('fs');

// Variable declarations.
var apiEndpoint = 'http://www.opendataphilly.org/api/resources/';
var dataFile = process.argv[2] || "CCMSdata.json";
var debug = process.argv[3] || false;

// Utility function to strip superfluous whitespace from string.
function stripSpaces(str) {
	return str.replace(/(^[\s]+|[\s]+$)/g, '');
}

// Fetch JSON from AI endpoint.
request(apiEndpoint, function (error, response, body) {

  if (!error && response.statusCode == 200) {
  	// Parse JSON from API.
  	var resources = JSON.parse(body);

  	// New array to hold CCMS JSON objects.
	var newResources = [];

	// Iterates over each element in the JSON array returned from the API.
  	for(var i=0; i<resources.length; i++) {
  		
  		// A new object to hold CCMS compliant JSON.
  		var newResource = {};

  		// The organization value from the source JSON
		var org = stripSpaces(resources[i].organization.toLowerCase());

		  // If resource's organization is city of philadelphia...
		  if(org == "city of philadelphia") {

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

			  // Push new JSON object onto new resource array.
			  newResources.push(newResource);
		  }
  	}

  	// Write transformed JSON data, now in CCMS, to a file called CCMSdata.json.
	fs.writeFile(dataFile, JSON.stringify(newResources), function(err) {
	    if(err) {
		console.log(err);
	    } else {
		console.log("The file was saved!");
	    }
	});
	if(debug) {
		console.log(newResources);
	}	
  }

  // Otherwise, output error statement.
  else {
  	console.log("Could not fetch JSON data from API endpoint");
  }
});


