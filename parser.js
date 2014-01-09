// Include required modules.
var request = require('request');
var fs = require('fs');
var async = require('async');

// Variable declarations.
var apiEndpoint = 'http://www.opendataphilly.org/api/resources/';
var dataFile = process.argv[2] || "CCMSdata.json";
var debug = process.argv[3] || false;

// Utility function to strip superfluous whitespace from string.
function stripSpaces(str) {
	return str.replace(/(^[\s]+|[\s]+$)/g, '');
}

// New array to hold CCMS JSON objects.
var newResources = [];

var arrayURL = [];
var h = 0;
var w = 0;

// Fetch JSON from API endpoint.
request(apiEndpoint, function (error, response, body) {

  if (!error && response.statusCode == 200) {
  	// Parse JSON from API.
  	var resources = JSON.parse(body);

	// Iterates over each element in the JSON array returned from the API.
  	for(var i=0; i<resources.length; i++) {

  		// The organization value from the source JSON
		var org = stripSpaces(resources[i].organization.toLowerCase());

		  // If resource's organization is city of philadelphia...
		  if(org == "city of philadelphia") {

		  	  // A new object to hold CCMS compliant JSON.
  		      var newResource = {};

			  //rename properties to conform with CCMS
			  newResource.title = resources[i].name;
			  newResource.description = resources[i].short_description;
			  var nameArray = [];
			  for (var j = 0; j <resources[i].tags.length; j++){
				nameArray.push(resources[i].tags[j].name);
			  }
			  newResource.keyword = nameArray;
			  newResource.modified = resources[i].release_date;
			  if (resources[i].release_date == null)
			  {
			  	newResource.modified = "2014-01-01";
			  }
			  newResource.publisher = resources[i].organization;
			  newResource.accessURL = "http://www.opendataphilly.org/opendata/resource/" + resources[i].id;

			  newResource.identifier = "" + resources[i].id + "";
			  newResource.accessLevel = "public";

			  // Push new JSON object onto new resource array.
			  newResources.push(newResource);		  

			  for (var k = 0; k < newResources.length; k++){
			  	var newURL = {};
			  	newURL.url = "http://www.opendataphilly.org" + resources[i].url;
			  }	
			  arrayURL.push(newURL);
		  }
  	}
	if(debug) {
		console.log(newResources);
	}	
  }
  // Otherwise, output error statement.
  else {
  	console.log("Could not fetch JSON data from API endpoint");
  }

  async.whilst(function () {
  return w < newResources.length;
  },
  function (next) {
  	  //console.log(w);
	  request(arrayURL[w].url, function (error, response, whoo) {
	  if (!error && response.statusCode == 200) {
	  // Parse JSON from API.
		var resource = JSON.parse(whoo);
		newResources[h].contactPoint = resource.division;
		newResources[h].mbox = resource.contact_email;
		newResources.pop(newResources[h]);
		newResources.push(newResources[h]); 
		h++;
	  }
	  w++;
	  if (w < newResources.length)
	  {
	  	next();
	  }
	  else{
	  	console.log("The file was saved!");
	  }
	  });
	  fs.writeFile(dataFile, JSON.stringify(newResources, null, 4), function(err) {
			if(err) {
			console.log(err);
			} 
		});
  });
});



