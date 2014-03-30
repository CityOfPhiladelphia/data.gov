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

// New array to hold urls of resoures.
var arrayURL = [];

// Counter to keep track of each resource and its details.
var counter = 0;

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

			  // Rename properties to conform with CCMS.
			  newResource.title = resources[i].name;
			  newResource.description = resources[i].short_description;
			  var nameArray = [];
			  for (var j = 0; j <resources[i].tags.length; j++){
				nameArray.push(resources[i].tags[j].name);
			  }
			  newResource.keyword = nameArray;
			  newResource.publisher = resources[i].organization;
			  newResource.accessURL = "http://www.opendataphilly.org/opendata/resource/" + resources[i].id;

			  newResource.identifier = "" + resources[i].id + "";
			  newResource.accessLevel = "public";

			  // Push new JSON object onto new resource array.
			  newResources.push(newResource);		  

			  // Assign each url with a specific number in the array 'arrayURL'.
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

  // Redefine function as synchronous so it goes through each resource in order.
  async.whilst(function () {
  return counter < newResources.length;
  },
  function (next) {
  	  // Fetch JSON from each of the resources' API endpoint.
	  request(arrayURL[counter].url, function (error, response, body2) {

	  if (!error && response.statusCode == 200) {
	  	// Parse JSON from API.
		var resource = JSON.parse(body2);

		// Rename properties to conform with CCMS.
		newResources[counter].modified = resource.last_updated;
		// If empty division, fill with Office of Chief Data Officer.
		if (resource.division == ""){
			newResources[counter].contactPoint = "Office of Chief Data Officer";
		}
		else{
			newResources[counter].contactPoint = resource.division;
		}
		// If empty contact email fill with data@phila.gov.
		if (resource.contact_email == ""){
			newResources[counter].mbox = "data@phila.gov";
		}
		else{
		newResources[counter].mbox = stripSpaces(resource.contact_email);
		}

		newResources[counter].license = resource.usage;

		// Push new JSON object onto new resource array.
		newResources.push(newResources[counter]); 

		// Pop previously pushed JSON objects.
		newResources.pop(newResources[counter]);

		// Write transformed JSON data, now in CCMS, to a file called CCMSdata.json.
		fs.writeFile(dataFile, JSON.stringify(newResources, null, 4), function(err) {
	      if(err) {
			console.log(err);
	      } 
	    });
	    
	    // Increment counter by one.
	    counter++;
	  }

	  // If the resource # is less than # of resources, callback function next.
	  if (counter < newResources.length)
	  {
	  	next();
	  }
	  // When done, print the following.
	  else{
	  	console.log("The file was saved!");
	  }
	  });
  });
});
