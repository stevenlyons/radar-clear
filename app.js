var async = require('async');
var Client = require('node-rest-client').Client;
var minimist = require('minimist');

var client = new Client(); 

var _url = "https://portal.dev.cedexis.com/api";
var _clientId = "test_sjl";
var _clientSecret = "e9a6fd7e-f44e-4b39-8067-724b40ec4f2c"; // Cedexis Dev
//var _clientSecret = "c6c40437-6cf7-4ecf-a3e2-79bda2f3fe55"; // Tango
var _token;
var _filter = extractFilter();

async.waterfall([
    function (callback) {
        console.log("Started updating platforms");
        callback(null, _clientId, _clientSecret);
    },
    generateAccessToken,
    getPlatforms

], function (err, result) {
   // result now equals 'done'  
   //console.log(result); 

   async.each (result, updatePlatform, function(err) {
        if (err) {
            console.log("Error: " + err.message);
        }

        console.log("Finished updating platforms");
   });
});


function updatePlatform(platform, callback) {
    console.log(`Updating platform: ${platform.displayName} - ${platform.name}`);

    console.log(platform);
    platform.radarConfig = getDefaultRadarConfig();
    console.log(platform);

//return callback(null); // temp

    var args = {
            data: platform,
            headers: { "Authorization": `Bearer ${_token}`, "Content-Type": "application/json" } 
        };

    client.put(`${_url}/v2/config/platforms.json/${platform.id}`, args, function(data, response) {
            // parsed response body as js object 
            //console.log(data);

            if (data && response.statusCode == 200) {
                //console.log("Update: " + JSON.stringify(data));
                return callback(null, data);
            }

//console.log("Status Code: " + response.statusCode);
//console.log("Update: " + JSON.stringify(data));

            message = "Error updating platform";
            if (data && data.errorDetails && data.errorDetails[0].developerMessage) {
                message = data.errorDetails[0].developerMessage;
            }
            
            return callback(new RadarException(message));
        }); 
}

function extractFilter() {
    var argv = minimist(process.argv.slice(2));

    return (argv && argv.f) ? argv.f : "";
}

function generateAccessToken(clientId, clientSecret, callback) {
    var args = {
            data: [`client_id=${clientId}`, `client_secret=${clientSecret}`, `grant_type=client_credentials`].join('&'),
            headers: { "Content-Type": "application/x-www-form-urlencoded" } 
        };

    client.post(`${_url}/oauth/token`, args, function(data, response) {
            // parsed response body as js object 
            //console.log(data);

            if (data && data.access_token && response.statusCode == 200) {
                _token = data.access_token;
                return callback(null, data.access_token);
            }

            message = "Error getting access token";
            if (data && data.developerMessage) {
                message = data.developerMessage;
            }
            
            return callback(new RadarException(message));
        }); 
}

function getPlatforms(token, callback) {
    var args = {
            headers: { "Authorization": `Bearer ${token}` } 
        };

    // v2/reporting/platforms.json/private
    client.get(`${_url}/v2/config/platforms.json`, args, function(data, response) {
            // parsed response body as js object 
            //console.log(data);

            if (data && response.statusCode == 200) {
                //console.log(data);
                var filtered = data.filter( filterPlatforms );                    
                return callback(null, filtered);
            }

            message = "Error getting platforms";
            if (data && data.developerMessage) {
                message = data.developerMessage;
            }
            
            return callback(new RadarException(message));
        }); 
}

function filterPlatforms(value) {
    return value.publicProviderArchetypeId == 0 && value.name.startsWith(_filter);
}

function RadarException(message) {
   this.message = message;
   this.name = "RadarException";
}


function getDefaultRadarConfig() {
    return { httpEnabled: false,
           httpsEnabled: false,
           usePublicData: 0,
           primeUrl: null,
           rttUrl: null,
           xlUrl: null,
           customUrl: null,
           primeSecureUrl: null,
           rttSecureUrl: null,
           xlSecureUrl: null,
           customSecureUrl: null,
           weight: 10,
           weightEnabled: false,
           cacheBusting: true,
           isoWeightList: null,
           isoWeight: null,
           isoWeightEnabled: false,
           marketWeightList: null,
           marketWeight: null,
           marketWeightEnabled: false,
           primeType: null,
           rttType: null,
           xlType: null,
           customType: null,
           primeSecureType: null,
           rttSecureType: null,
           xlSecureType: null,
           customSecureType: null,
           radar14PrimeUrl: '',
           radar14RttUrl: '',
           radar14XlUrl: null,
           radar14PrimeSecureUrl: null,
           radar14RttSecureUrl: null,
           radar14XlSecureUrl: null };
}