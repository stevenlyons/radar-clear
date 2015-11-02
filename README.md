# radar-clear

## Setup

This is a simple node.js app, just pull the files to a location and npm restore:

```
$ npm install
```

## Run

The basic commandline:

```
$ node radar-clear.js -d
```

The following options are available:
Option | Alias | Description
-d | dryrun | Shows which platforms would be updated but does not update.
-f | filter | A filter applied to the platform aliases to select which platforms should be updated. A simple filter that matches the start of the alias names.
-v | verbose | Outputs additional information while processing.