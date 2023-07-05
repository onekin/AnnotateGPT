# Review&Go
[![Build Status](https://travis-ci.com/haritzmedina/reviewAndGo.svg?branch=master)](https://travis-ci.com/haritzmedina/reviewAndGo)

Review&Go is a chrome extension to allow conference and journal reviewers to review papers using annotations. 
Main features:
* Ease to install.  Review&Go is just two-click away. If you have previously installed any browser extension, installing Review&Go is a doddle! Last but not least, Review&Go is being certified by Chrome, before being uploaded to its web store. So, no security leaks.
* Color-coding highlighting. You define a  Review Model (e.g., originality, legibility and so on), each model’s attribute is mapped to a colour to be used during highlighting at review time,
* Qualify highlighting. Highlights can be associated with comments, grades (strengths and weaknesses) or references to the literature. Your comments would undertake a sentiment analysis to avoid offensive wordings.
* Canvas view. Have a global picture of the review so far. The canvas is plotted along with the attributes of the review model. Gradations and highlights are shown within each plot.
* Review-draft generation. A first text draft is generated as a review head-start. Comments are placed by the manuscript quotes for authors to easily spot the rationales for the reviewer comments. 
* Sharing. Data is stored locally. Yet, it can be exported as a JSON file and emailed to colleagues who can then import it into their Review&Go installations. On loading the manuscript, your colleagues will see the very same view as you. 


# For End-users

The extension can be downloaded from [Chrome Store](https://rebrand.ly/reviewAndGo). Optionaly annotations can be shared using [Hypothes.is](https://hypothes.is) web annotation server, what requires an to [register as a user](https://hypothes.is/signup). This can be set in options page after installing the extension.

# For developers


# For contributors


## Installation

	$ npm install

## Usage

Run `$ gulp --watch` and load the `dist`-directory into chrome.

## Entryfiles (bundles)

There are two kinds of entryfiles that create bundles.

1. All js-files in the root of the `./app/scripts` directory
2. All css-,scss- and less-files in the root of the `./app/styles` directory

## Tasks

### Build

    $ gulp


| Option         | Description                                                                                                                                           |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--watch`      | Starts a livereload server and watches all assets. <br>To reload the extension on change include `livereload.js` in your bundle.                      |
| `--production` | Minifies all assets                                                                                                                                   |
| `--verbose`    | Log additional data to the console.                                                                                                                   |
| `--vendor`     | Compile the extension for different vendors (chrome, firefox, opera, edge)  Default: chrome                                                                 |
| `--sourcemaps` | Force the creation of sourcemaps. Default: !production                                                                                                |


### pack

Zips your `dist` directory and saves it in the `packages` directory.

    $ gulp pack --vendor=firefox

### Version

Increments version number of `manifest.json` and `package.json`,
commits the change to git and adds a git tag.


    $ gulp patch      // => 0.0.X

or

    $ gulp feature    // => 0.X.0

or

    $ gulp release    // => X.0.0


## Globals

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. It will be set to `development` unless you use the `--production` option.


**Example:** `./app/background.js`

```javascript
if(process.env.NODE_ENV === 'development'){
  console.log('We are in development mode!');
}
```

## Testing

To run the tests locally, it is required a Hypothesis Developer Token. You can get yours at: https://hypothes.is/account/developer
Then, create an .env file and add it with name "HYPOTHESIS_TOKEN" (without commas)




