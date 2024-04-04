# AnnotateGPT

## References


# END-USERS MANUAL
* Purpose: AnnotateGPT is designed to streamline the academic peer-review process by pre-annotating manuscripts using AI-generated highlights.
* Background: Addresses the increasing pressure on traditional peer-review systems due to the growing number of research submissions.

AnnotateGPT is a chrome extension to allow conference and journal reviewers to review papers using annotations. 
Main features:
* Ease to install.  AnnotateGPT is just two-click away. If you have previously installed any browser extension, installing AnnotateGPT is a doddle! Last but not least, AnnotateGPT is being certified by Chrome, before being uploaded to its web store. So, no security leaks.
* Color-coding highlighting. You define a  Review Model (e.g., originality, legibility and so on), each model’s attribute is mapped to a colour to be used during highlighting at review time,
* Qualify highlighting. Highlights can be associated with comments, grades (strengths and weaknesses) or references to the literature. Your comments would undertake a sentiment analysis to avoid offensive wordings.
* Canvas view. Have a global picture of the review so far. The canvas is plotted along with the attributes of the review model. Gradations and highlights are shown within each plot.
* Review-draft generation. A first text draft is generated as a review head-start. Comments are placed by the manuscript quotes for authors to easily spot the rationales for the reviewer comments. 
* Sharing. Data is stored locally. Yet, it can be exported as a JSON file and emailed to colleagues who can then import it into their AnnotateGPT installations. On loading the manuscript, your colleagues will see the very same view as you.

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


Finally, open the "details" panel of the web extension. You can find this page opening "Manage extensions" and then you can find a Details button in AnnotateGPT. Once, in the details page, you have to **Allow access to URL files**.

![allowaccess](https://github.com/onekin/AnnotateGPT/assets/31988855/22fa5dcd-0b8b-4336-a410-84a192ce0eb8)


## Getting Started
You can create a Chatin mind map clicking on its template. Once you click there, an empty Chatin map is displayed:

<img width="1466" alt="Screenshot 2024-03-21 at 17 44 07" src="https://github.com/onekin/Chatin/assets/31988855/61406ea0-cc33-45ba-b42e-43a7461ae45e">

First, you have to complete your problem space. To this aim, you have to complete the following nodes:
- Perceived Problem: Indicate which is the problem you perceived in the practice.
- Practice: Indicate which is the setting or context you want to address. An example can be “combating climate change”
- Activity: Indicate one concrete task from the practice you want to research. An example of an activity within the practice of combating climate change could be “reduce the use of cars”.
- Person [optional]: People that engage in the practice in which they perceive the problem
- Optional variables: You can add extra variables adding new nodes in the Context node.
  
<img width="1272" alt="Screenshot 2024-03-21 at 18 14 10" src="https://github.com/onekin/Chatin/assets/31988855/1ff0c319-05eb-49d5-a61d-dffeea3f23ff">

Once the Problem Space is defined, you can start the analysis clicking on the "NEW" button in the Problem Analysis node. At the start of the analysis you will see that a new yellow/question node is created to start the analysis. Remember that you can refine or extend the problem space when you want during the problem analysis.

## Features and Functionality
We distinguish two kinds of functionalities: Divergent functionalities (those that help to create new nodes) and Convergence functionalities (those that help to decide which node select).

### Divergence
#### Ask questions
Chatin offers different prompts to explore the problem and analyze the cause and consequences of the problem. First, Chatin starts identifying causes using the "5 why strategy" through prompting and creating question nodes that deep into the cause of the problems. Question nodes are displayed with the yellow color and they contain the prompt that is going to be send to the LLM (This prompts can be modified by the user changing the content of the node). To perform the question, the user has to click on the node and then select the 'ask question' label that is going to appear (alternatively, the question can also be done by clicking the magnifier icon). After waiting few seconds, new green nodes are generated by the LLM that answer the question.

<img width="1055" alt="Screenshot 2024-03-21 at 18 46 36" src="https://github.com/onekin/Chatin/assets/31988855/4e22b41d-a9f7-40d9-ab8b-64e167037b89">

Moreover, if you click on the node's note, a description of the answer is displayed.
<img width="1055" alt="Screenshot 2024-03-21 at 18 52 18" src="https://github.com/onekin/Chatin/assets/31988855/9e1ac2f1-11ab-486a-93e8-66f82704c7a7">

Now, here starts the iterative process. For the identified problems new question nodes can be generated to deep into the problem. To this aim, when you select an interesting cause you can select it and create a new prompt to continue asking.

<img width="1211" alt="Screenshot 2024-03-22 at 09 57 08" src="https://github.com/onekin/Chatin/assets/31988855/82d6f5c6-e0a8-4935-b1d3-521752a139a7">


Then, you can repeat the above process to create more questions based on the cause until finding the problem you want to address. 

#### User modifications
During this process you have also the possibility to add your own problems or questions. To this aim, Chatin provides the "add own cause" and "add own question" options:
<img width="1274" alt="Screenshot 2024-03-22 at 10 22 18" src="https://github.com/onekin/Chatin/assets/31988855/364deb37-ea01-4f50-8fea-009800c32d6a">

Remember that you can also modify the question nodes:
<img width="757" alt="Screenshot 2024-03-22 at 10 34 20" src="https://github.com/onekin/Chatin/assets/31988855/ad6697b8-7e1f-448b-b324-8776ac6c6adf">

#### PDF based questions
You can complement Chatin Mind map with implicit knowledge. It provides the opportunity to attach PDFs in the question nodes to ask question based on these papers. This helps to get better results associated with the topic.
<img width="1380" alt="Screenshot 2024-03-22 at 10 50 40" src="https://github.com/onekin/Chatin/assets/31988855/18c40480-fa3d-4b48-9944-00f5e4807c44">

Note that nodes created asking from a PDF have a green light color. In addition to this, if you click on the node's note it includes the excerpt that justifies the creation of the node.

<img width="731" alt="Screenshot 2024-03-22 at 11 32 38" src="https://github.com/onekin/Chatin/assets/31988855/fa75b9d5-fe26-4e54-b7fb-73d2c6e3941a">


#### Select a problem to address
During the problem analysis you can select a problem to address. A problem can be selected clicking on the black tick.
![addressProblem](https://github.com/onekin/Chatin/assets/31988855/dc0fad02-b90b-4254-97db-92a75ae44e19)
Once you click on a problem, it is coloured in red and now, instead of searching for causes you can search for consequences in order to find goodness criteria. See next figure. Now the question is differente but the mechanisms is the same as with the causes exploration.
![conse](https://github.com/onekin/Chatin/assets/31988855/33dd2e1b-6e04-496d-b838-9129b51414ab)

If you ask the question, in the consequence mode the LLM will return the established number of answer + the previous causes of the addressed problem (see next figure).
![consequences](https://github.com/onekin/Chatin/assets/31988855/f91587c3-1534-4aa5-ad63-7cf746a27006)

Once you find an interesting consequence, you can add it as a Goodness Criteria to your problem space clicking on the black tick.
![goodness](https://github.com/onekin/Chatin/assets/31988855/18a1fbbb-eb77-4676-a0e4-c7e6ecd57c5d)

When you have the Goodness Criteria in the problem space you can explore how to measure it for future evaluations.

![goodnessCriteria](https://github.com/onekin/Chatin/assets/31988855/e2573aab-e503-402d-8128-cf6bd9c16952)


### Convergence
Chatin provides different functionalities to help you selecting a candidate problem.

#### Compact nodes
Chatin provides the opportunity to aggregate different nodes when there are a lot of options to simplify the map. You can click on a question node and select the compact option. Then, Chatin will ask you to select the number of clusters you want. Finally, once the number of nodes is selected, Chatin will replace the current nodes with the number of asked nodes.

![compact](https://github.com/onekin/Chatin/assets/31988855/3d5781a6-4217-4f1f-b542-eac9a49bd683)

The groups are colored in dark green and collect the previous nodes. You can check which nodes are gathered in each group checking the node note.

#### Ask to Consensus
Chatin provides you the opportunity to consult the question in Consensus in order to retrive associated literature. You can select a question node and select the Consensus option and the question will be asked in Consensus. You will be redirected to a page like this:

https://consensus.app/results/q=WHY%20DOES%20Narrow%20perspective%20OCCUR%20DURING%20problem%20analysis%20IN%20Design%20Science%20Research%20%20and%20assuming%20that%20Person%20is%20novel%20research%3F

![consensus](https://github.com/onekin/Chatin/assets/31988855/4e98bad3-c357-4ee6-ae15-493b9073e4b6)

It is also possible to use consensus in answer nodes. In this case, the question will ask for solutions for the given problem in the literature.

## Support and Resources
- You can ask support in the following mail: xabier.garmendiad@ehu.eus

- Here there is a video demo: https://youtu.be/lGInf5cqZ7Q?si=8Ks48PHibMiFXli9

- Here you can find some map examples created with Chatin: https://docs.google.com/document/d/1liPEni_1E7nwpLqcZN4sE_DnGSYGupJ7rqfIQaxQcYw/edit?usp=sharing

## Available LLMs
- OpenAI. GPT4 and GPT3.5
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


