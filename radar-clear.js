// radar-clear
// Clears the Radar settings from the platforms specified by the alias filter

"use strict";

const async = require('async');
const Client = require('node-rest-client').Client;
const minimist = require('minimist');

const client = new Client(); 

const _url = "https://portal.dev.cedexis.com/api";
const _clientId = "test_sjl";
const _clientSecret = "e9a6fd7e-f44e-4b39-8067-724b40ec4f2c"; // Cedexis Dev
//const _clientSecret = "c6c40437-6cf7-4ecf-a3e2-79bda2f3fe55"; // Tango
const _options = extractOptions();
let _token;

async.waterfall([
    function (callback) {
        let message = _options.dryrun ? "DRYRUN: Platforms that would be changed" 
                                      : "Started updating platforms";
        
        console.log(message);

        verboseLog("Options: ", _options);

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

function extractOptions() {
    let options = {
        string: ['filter'],
        boolean: ['dryrun', 'verbose'],
        alias: {
            f: 'filter',
            d: 'dryrun',
            v: 'verbose'
        },
        default: {
            filter: '',
            d: false,
            v: false
        }
    };
    let argv = minimist(process.argv.slice(2), options);

    return (argv) ? argv : {};
}

function generateAccessToken(clientId, clientSecret, callback) {
    let args = {
            data: [`client_id=${clientId}`, `client_secret=${clientSecret}`, `grant_type=client_credentials`].join('&'),
            headers: { "Content-Type": "application/x-www-form-urlencoded" } 
    };

    client.post(`${_url}/oauth/token`, args, function(data, response) {
        verboseLog("Token Data: ", data);

        if (data && data.access_token && response.statusCode == 200) {
            _token = data.access_token;
            return callback(null, data.access_token);
        }

        verboseLog("Token Status Code: ", response.statusCode);

        let message = "Error getting access token";
        if (data && data.developerMessage) {
            message = data.developerMessage;
        }
        
        return callback(new RadarException(message));
    }); 
}

function getPlatforms(token, callback) {
    let args = {
            headers: { "Authorization": `Bearer ${token}` } 
    };

    client.get(`${_url}/v2/config/platforms.json`, args, function(data, response) {
        // Too much data for verbose
        //verboseLog("Platform Data: ", data);

        if (data && response.statusCode == 200) {
            let filtered = data.filter(filterPlatforms);
            verboseLog("Filtered Platform Data: ", filtered);
            return callback(null, filtered);
        }

        verboseLog("Platforms Status Code: ", response.statusCode);

        let message = "Error getting platforms";
        if (data && data.developerMessage) {
            message = data.developerMessage;
        }
        
        return callback(new RadarException(message));
    }); 
}

function updatePlatform(platform, callback) {
    console.log(`Updating platform: ${platform.displayName} - ${platform.name}`);

    if (_options.dryrun) {
        return callback(null, null);
    }

    verboseLog("Platform Values: ", platform);
    platform.radarConfig = getDefaultRadarConfig();
    verboseLog("Sending Values: ", platform);

    let args = {
            data: platform,
            headers: { "Authorization": `Bearer ${_token}`, "Content-Type": "application/json" } 
    };

    client.put(`${_url}/v2/config/platforms.json/${platform.id}`, args, function(data, response) {
        verboseLog("Update Data: ", data);

        if (data && response.statusCode == 200) {
            return callback(null, data);
        }

        verboseLog("Update Status Code: ", response.statusCode);

        let message = "Error updating platform";
        if (data && data.errorDetails && data.errorDetails[0].developerMessage) {
            message = data.errorDetails[0].developerMessage;
        }
        
        return callback(new RadarException(message));
    }); 
}

function filterPlatforms(value) {
    return value.publicProviderArchetypeId == 0 && value.name.startsWith(_options.filter);
}

function stringify(json) {
    return JSON.stringify(json, null, 2);
}

function verboseLog(message, data) {
    if (_options.verbose) { 
      console.log(message + ((typeof data === 'object') ? stringify(data) : data)); 
    }
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