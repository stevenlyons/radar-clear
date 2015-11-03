# radar-clear

## Setup

This is a simple node.js app, just pull the files to a location and npm restore:

```
$ npm install
```

Portal:
* Get an Oauth token from the Portal for the desired account.
* In the script, update the url, client id and client secret

## Run

The basic commandline:

```
$ node radar-clear.js
```

The following options are available:

Option | Alias | Description
-------|-------|------------
-c | commit | By default, the tool does a dryrun and does not update the platform. Use this to make the update on all matching platforms.
-f | filter | A filter applied to the platform aliases to select which platforms should be updated. A simple filter that matches the start of the alias names.
-v | verbose | Outputs additional information while processing.
