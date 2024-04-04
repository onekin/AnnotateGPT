# AnnotateGPT
AnnotateGPT is a Chrome extension designed to facilitate the peer review process for conference and journal submissions. Leveraging the capabilities of Large Language Models (LLMs), this tool enables reviewers to evaluate manuscripts through annotations directly within their browser. By offering a criterion-based approach, AnnotateGPT effectively addresses the challenges posed by the escalating volume of research submissions, alleviating the strain on traditional peer-review systems.

Main features:
* Ease to install.  AnnotateGPT is just two-click away. If you have previously installed any browser extension, installing AnnotateGPT is a doddle! Last but not least, AnnotateGPT is being certified by Chrome, before being uploaded to its web store. So, no security leaks.
* Color-coding highlighting. You define a  Review Model (e.g., originality, legibility and so on), each model’s attribute is mapped to a colour to be used during highlighting at review time,
* Qualify highlighting. Highlights can be associated with comments, grades (strengths and weaknesses) or references to the literature. Your comments would undertake a sentiment analysis to avoid offensive wordings.
* Canvas view. Have a global picture of the review so far. The canvas is plotted along with the attributes of the review model. Gradations and highlights are shown within each plot.
* Review-draft generation. A first text draft is generated as a review head-start. Comments are placed by the manuscript quotes for authors to easily spot the rationales for the reviewer comments. 
* Sharing. Data is stored locally. Yet, it can be exported as a JSON file and emailed to colleagues who can then import it into their AnnotateGPT installations. On loading the manuscript, your colleagues will see the very same view as you.
  
## References


# END-USERS MANUAL
* AnnotateGPT is designed to streamline the academic peer-review process by pre-annotating manuscripts using AI-generated highlights.

## Installation and Setup
You can follow these steps to get AnnotateGPT up and running

### Step 1: Requirements
Ensure your computer and you meet the minimum requirements for running Chatin.

- Google Chrome browser
- LLM API key. Chatin allows you to interact with GPT and Claude, therefore, in order to use them ensure you have an OpenAI or Anthropic API key

### Step 2: Install the Chatin Extension
- Open your web browser and navigate to the AnnotateGPT extension page on the [[Browser Extension Store/Marketplace](https://chromewebstore.google.com/detail/annotategpt/gjocfhlnleefeikdcnebmohfkgckceip)].
- Click the "Add to Browser" or "Install" button to begin the installation process.
- Once the installation is complete, you will see a AnnotateGPT icon appear in your browser’s toolbar. This indicates that AnnotateGPT is successfully installed.

### Step 3: Setup
Open AnnotateGPT's options panel. You can do it by right click in AnnotateGPT's browser’s toolbar icon.
![options](https://github.com/onekin/AnnotateGPT/assets/31988855/911b49b6-d45b-4e93-b37a-f106a0b10c0d)


In this page, you have to complete the following information:

1. Select your Large Language Model and include your API key

![config](https://github.com/onekin/AnnotateGPT/assets/31988855/e80f7204-394c-4a89-86c0-8997b7b593ae)


After that, open the "details" panel of the web extension. You can find this page opening "Manage extensions" and then you can find a Details button in AnnotateGPT. Once, in the details page, you have to **Allow access to URL files**.

![allowaccess](https://github.com/onekin/AnnotateGPT/assets/31988855/22fa5dcd-0b8b-4336-a410-84a192ce0eb8)

Finally, open a PDF file from you local system in the web browser a click on the AnnotateGPT icon. The extension must be executed and you should visualize a sidebar at the left of the page.

![example](https://github.com/onekin/AnnotateGPT/assets/31988855/877a0eaf-392d-48b9-901b-3b60008f2643)

If you encounter any difficulties reaching this point, please don't hesitate to contact xabier.garmendiad@ehu.eus.

## Getting Started

You can create a new review criteria clicking on the arrow shown in the next figure:

![review](https://github.com/onekin/AnnotateGPT/assets/31988855/5720b84a-a358-45b2-9d39-0e824943e5ca)

Here, AnnotateGPT provides different options to create a new review criteria to carry out the review
- **Create review model.** This option creates an empty review criteria which you can later complete creating different criteria with their name and criterion.
- **Import review model.** This option allows to import a previously exported review criteria created in AnnotateGPT
- **Standard review model.** This option provides a set of review criteria templates derived from the [The ACM SIGSOFT Empirical Standards for Software Engineering] (https://www2.sigsoft.org/EmpiricalStandards/tools/).

Once you select one of the options, you will have to give a name for you review criteria, for example, the name of the conference/journal the paper belongs.

![caise](https://github.com/onekin/AnnotateGPT/assets/31988855/f0b3fa24-00b0-488a-9a09-f70c097cd337)

Then, the new review criteria will be displayed in the sidebar:

![caisecri](https://github.com/onekin/AnnotateGPT/assets/31988855/f8aceef7-5b87-449f-ae52-55ca631feb51)


## Features and Functionality
We distinguish two kinds of functionalities: Divergent functionalities (those that help to create new nodes) and Convergence functionalities (those that help to decide which node select).

### Review Criteria management
## Support and Resources
- You can ask support in the following mail: xabier.garmendiad@ehu.eus

- Here there is a video demo: [https://youtu.be/lGInf5cqZ7Q?si=8Ks48PHibMiFXli9](https://youtu.be/3FOdsqpyyDA?si=_rHj8NFvQ9eQhaL4)

## Available LLMs
- OpenAI. GPT4
- Anthropic. Claude2.0

# DEVELOPERS MANUAL
## Architecture Overview
Chatin is a browser extension and it is developed with web development technologies: JavaScript, Node and Gulp.
It is developed over the last Manifest version (Manifest version 3): https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3?hl=es-419

The web extension follows the standard web browser extension architecture with content script modules to manage the web content and background scripts to manage the local storage, mindmeister and LLM communications.

## Development Environment
To develop from the source code, you will need to install node and gulp to build the extension. This are the required versions
- Node v12.22
- Gulp v4

## API Documentation
Chatin makes use of differente APIs:
- MindMeister API. Chatin uses this API to manage the maps: https://developers.mindmeister.com/
  
- LangChain. Chatin uses different LLM's API through the LangChain JS library: https://js.langchain.com/docs/get_started/introduction

## Code Structure
The artifact code is organized as follows:

- ![chatin](https://github.com/onekin/Chatin/assets/31988855/ee3f42df-1472-433e-9b87-16dafccb80d7)

These are the main components:
- images. This folder contains the images within the browser extension.
- pages. This folder contains the html files of the extension.
- resources. This folder contains mind map templates and the pdf.js library to process pdfs.
- scripts. This is the main component, it contains the scripts to make the extension work. Based on a web extension architecture this is the main classes:
  - Content Script: content_script.js, this is the script that is executed when MindMeister is accessed
  - Service worker: background.js, this script initializes all the background scripts to enable the communications
  - Options file: options.js, this is the script executed when the option page is opened
  - The rest of scripts are organized in the following folders.
     	- chatin. This folder contains the scripts that are executed in MindMeister.
    		- HomePageManager is executed in MindMeister home page to add the button to create a Chatin map.
    		- MindmapManager is executed when opening a MindMeister map and it handles Chatin's functionality. This is the most important file.
    		- The rest of the files in this folder are classes imported in the two above classes and define the Chatin model (e.g., node names, question templates, prompt styles...)
  	- llm. The main class in this folder is LLMManager, which is executed at the background to establish the communications with Langchain for asking questions to a LLM and with the local storage to manage the variables from the Options page.
     	- mindmeister. This folder contains the scripts to communicate with MindMeister API functionalities
        - utils. This folder contains helper functions which are small pieces of reusable code designed to perform a specific task that supports larger code structures.
## Building and Testing
To compile the project, you only need to execute the following lines, but make sure you have the node and gulp versions specified in the Development Enviroment section.

	$ npm install
	$ gulp default

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

## Testing

## Contribution Guidelines
To contribute please contact xabier.garmendiad@ehu.eus.

## Roadmap and Future Plans
This project has been developed in a research setting. The aim is to explore the benefits of AI for problem analysis so future plans seek to evaluate the artifact in real settings

## Installation
Use node 10.24.1

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


