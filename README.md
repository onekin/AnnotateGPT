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
- **Standard review model.** This option provides a set of review criteria templates derived from the [The ACM SIGSOFT Empirical Standards for Software Engineering](https://www2.sigsoft.org/EmpiricalStandards/tools/).

Once you select one of the options, you will have to give a name for you review criteria, for example, the name of the conference/journal the paper belongs.

![caise](https://github.com/onekin/AnnotateGPT/assets/31988855/f0b3fa24-00b0-488a-9a09-f70c097cd337)

Then, the new review criteria will be displayed in the sidebar:

![caisecri](https://github.com/onekin/AnnotateGPT/assets/31988855/f8aceef7-5b87-449f-ae52-55ca631feb51)


## Features and Functionality
We distinguish three different components while reviewing with AnnotateGPT: Annotation, Review criteria and the Review.

### Annotation management
Annotion can be performed by two different actors: the reviewer and the LLM.
- **Annotations by the reviewer.** The user can create their own annotations selecting text in the PDF and clicking on the criterion button in the sidebar.
![annotation](https://github.com/onekin/AnnotateGPT/assets/31988855/c5534a68-6d26-4794-ba68-9ce2acf24d1b)

- **Annotations by the LLM.** The user can ask the LLM to annotate the criterion.
![LLMannotation](https://github.com/onekin/AnnotateGPT/assets/31988855/6b9fe204-5223-4cce-b36e-2a3845c2f9ce)

LLMs provides a number of annotations, which can be established in the options page of the extension. If you double click in the created annotations, you can see details of the annotation which contain the sentiment associated to the annotation and a comment field.

![det](https://github.com/onekin/AnnotateGPT/assets/31988855/78e34a8a-006b-41a3-9118-c2880287ed67)

Is it also possible to include the sentiment and comments for the annotations created by the reviewer. The comments can be written manually or you can ask the LLM about the annotated content. This operations can be performed by doing right click on the annotation:

![annotation](https://github.com/onekin/AnnotateGPT/assets/31988855/b5f4a22e-ca81-487f-9b07-08a354bcd7d7)

These are the different operations that can be performed with the annotations:
- Clarify. Ask an open question to the LLM to clarify some doubts about annotation content.
- Fact checking. Asks the LLM about the veracity of the text in the annotation.
- Social judging. Asks the LLM the rise of social concerns about the annotated text.
- Render. This displays the same window as with doing the double click.
- Delete. The annotation can be removed.

The questions asked to the LLM display the following window with different options:

![answer](https://github.com/onekin/AnnotateGPT/assets/31988855/e6c17a92-23b0-4945-b4fe-6a3e0eaa90ae)

- **Redo.** Repeats the question to the LLM.
- **Save.** The answer is save in the annotation comment.

### Review Criteria management
Criterion can be created from the sidebar. The next figure shows which are the button (1) to create a criteria group and (2) to create a new criterion.
![criterion](https://github.com/onekin/AnnotateGPT/assets/31988855/a5129c63-2356-4654-b5a0-63439c869f65)

When you are creating a new criterion you have to provide a name and a description, which are important for asking later the LLM.

![new](https://github.com/onekin/AnnotateGPT/assets/31988855/22fdcdde-ddb5-473a-a754-62af86e80e33)

You can modify criterion's name by double clicking in its button. It will show the following window where you can modify the label and the description:
![modfi](https://github.com/onekin/AnnotateGPT/assets/31988855/9bbb9d8b-3214-4366-baca-1c480e3f3c05)

#### Operations with review criteria
If you click on a button with the right button four options appear:

![newa](https://github.com/onekin/AnnotateGPT/assets/31988855/ceeeb2bd-caf6-4e33-8848-e2c3ecb23d8d)

These are the different operations that can be performed with the annotations:
- Annotate. Ask the LLM to create annotations.
- Compile. Asks the LLM to provide a summary of the criterion, it uses the PDF content and the annotations.
- Viewpoints. Asks the LLM to provide different viewpoints about the current criterion assessment
- Render. This displays the assessments made for the review criteria, that is, the annotations, and the compilation and viewpoints if they were saved when were returned by the LLM.

In the following image you can see an example of using Compile:
![met](https://github.com/onekin/AnnotateGPT/assets/31988855/c1545e54-f193-42d9-8a14-50c4f6f72dc9)

- **Redo.** Repeats the question to the LLM.
- **Save answer.** The answer is save in the annotation comment.

Save answer can be visualized by the render option and are also included in the review draft.

![example](https://github.com/onekin/AnnotateGPT/assets/31988855/f2c9d53e-b0a1-423f-90f4-a874f7ae25fb)


### Review management

AnnotateGPT provide different tools for managing the review. While you are working with AnnotateGPT you can also ask for review drafts or consult the current status through a Canvas view.
![toolbar](https://github.com/onekin/AnnotateGPT/assets/31988855/a82e4f62-986c-4b79-a78d-bec71cb297b6)

#### Review drafts

#### Review drafts


## Support and Resources
- You can ask support in the following mail: xabier.garmendiad@ehu.eus

- Here there is a video demo: [https://youtu.be/lGInf5cqZ7Q?si=8Ks48PHibMiFXli9](https://youtu.be/3FOdsqpyyDA?si=_rHj8NFvQ9eQhaL4)

## Available LLMs
- OpenAI. GPT4
- Anthropic. Claude2.0

# DEVELOPERS MANUAL
## Architecture Overview
Chatin is a browser extension and it is developed with web development technologies: JavaScript, Node and Gulp.
It is developed over the last Manifest version ([Manifest version 3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3?hl=es-419))

The web extension follows the standard web browser extension architecture with content script modules to manage the web content and background scripts to manage the local storage, mindmeister and LLM communications.

## Development Environment
To develop from the source code, you will need to install node and gulp to build the extension. This are the required versions
- Node v12.22
- Gulp v4

## Library Documentation
AnnotateGPT uses Langchain for LLM communications through the [LangChain JS library](https://js.langchain.com/docs/get_started/introduction)

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


