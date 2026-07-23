# AnnotateGPT
AnnotateGPT is a Chrome extension designed to facilitate the peer review process for conference and journal submissions. Leveraging the capabilities of Large Language Models (LLMs), this tool enables reviewers to evaluate manuscripts through annotations directly within their browser. By offering a criterion-based approach, AnnotateGPT effectively addresses the challenges posed by the escalating volume of research submissions, alleviating the strain on traditional peer-review systems.

Main features:
* **Easy to install.** AnnotateGPT is just two clicks away. If you have previously installed any browser extension, installing AnnotateGPT is a doddle!
* **Any OpenAI-compatible LLM.** Connect to OpenAI, Google Gemini, Groq, OpenRouter, DeepSeek, Mistral AI, Together AI, or any local model via Ollama / LM Studio. Just provide your API key.
* **Color-coding highlighting.** You define a Review Model (e.g., originality, legibility and so on); each model's attribute is mapped to a colour to be used during highlighting at review time.
* **Qualify highlighting.** Highlights can be associated with comments, grades (strengths and weaknesses) or references to the literature. Your comments undertake a sentiment analysis to avoid offensive wordings.
* **Canvas view.** Have a global picture of the review so far. The canvas is plotted along with the attributes of the review model. Gradations and highlights are shown within each plot.
* **Review-draft generation.** A first text draft is generated as a review head-start. Comments are placed by the manuscript quotes for authors to easily spot the rationales for the reviewer comments.
* **Sharing.** Data is stored locally. Yet, it can be exported as a JSON file and emailed to colleagues who can then import it into their AnnotateGPT installations. On loading the manuscript, your colleagues will see the very same view as you.
  
## References


# END-USERS MANUAL
* AnnotateGPT is designed to streamline the academic peer-review process by pre-annotating manuscripts using AI-generated highlights.

## Installation and Setup
You can follow these steps to get AnnotateGPT up and running.

### Step 1: Requirements
Ensure your computer meets the minimum requirements for running AnnotateGPT.

- Google Chrome browser
- An API key for any supported AI provider (OpenAI, Google Gemini, Groq, OpenRouter, DeepSeek, Mistral AI, Together AI) **or** a locally running model server (Ollama, LM Studio, etc.)

### Step 2: Install the AnnotateGPT Extension
- Open your web browser and navigate to the AnnotateGPT extension page on the [[Chrome Web Store](https://chromewebstore.google.com/detail/annotategpt/gjocfhlnleefeikdcnebmohfkgckceip)].
- Click **"Add to Chrome"** to begin the installation.
- Once the installation is complete, you will see an AnnotateGPT icon appear in your browser's toolbar.

### Step 3: Setup
Open AnnotateGPT's options panel by right-clicking the AnnotateGPT icon in your browser toolbar and selecting **"Options"**.

![options](https://github.com/onekin/AnnotateGPT/assets/31988855/911b49b6-d45b-4e93-b37a-f106a0b10c0d)

#### Configure your AI provider (3-step wizard)

The options page guides you through a simple 3-step setup:

**Step 1 — Choose your AI provider**

A grid of supported providers is displayed. Click the one you want to use:
- **OpenAI** (GPT-4, GPT-4o…)
- **Google Gemini** (Gemini 1.5…)
- **Groq** (fast inference)
- **OpenRouter** (200+ models)
- **DeepSeek** (DeepSeek R1…)
- **Mistral AI** (Mistral, Codestral…)
- **Together AI** (open models)
- **Local / Custom** (Ollama, LM Studio, or any OpenAI-compatible server)

**Step 2 — Enter your API key**

Paste your API key into the field and click **Connect**. A direct link to the provider's API key page is shown to make this easy. For local models, you will also be prompted for the base URL (e.g., `http://localhost:11434/v1`).

**Step 3 — Choose a model**

Once connected, AnnotateGPT fetches the list of available models automatically. Select the model you want to use from the dropdown.

That's it — your configuration is saved.

---

After setup, open the **Details** panel of the extension. Go to **Manage extensions**, find AnnotateGPT and click **Details**. On that page, enable **"Allow access to file URLs"**.

![allowaccess](https://github.com/onekin/AnnotateGPT/assets/31988855/22fa5dcd-0b8b-4336-a410-84a192ce0eb8)

Finally, open a PDF file from your local system in Chrome and click the AnnotateGPT icon. The extension will activate and you will see a sidebar on the left of the page.

![example](https://github.com/onekin/AnnotateGPT/assets/31988855/877a0eaf-392d-48b9-901b-3b60008f2643)

If you encounter any difficulties, please contact xabier.garmendiad@ehu.eus.

## Getting Started

You can create a new review criteria by clicking on the arrow shown in the next figure:

![review](https://github.com/onekin/AnnotateGPT/assets/31988855/5720b84a-a358-45b2-9d39-0e824943e5ca)

AnnotateGPT provides different options to create a new review criteria:
- **Create review model.** Creates an empty review criteria which you can complete by adding criteria with a name and description.
- **Import review model.** Imports a previously exported review criteria created in AnnotateGPT.
- **Standard review model.** Provides a set of review criteria templates derived from the [ACM SIGSOFT Empirical Standards for Software Engineering](https://www2.sigsoft.org/EmpiricalStandards/tools/).

Once you select one of the options, you will name your review criteria (e.g., the name of the conference or journal).

![caise](https://github.com/onekin/AnnotateGPT/assets/31988855/f0b3fa24-00b0-488a-9a09-f70c097cd337)

The new review criteria will then be displayed in the sidebar:

![caisecri](https://github.com/onekin/AnnotateGPT/assets/31988855/f8aceef7-5b87-449f-ae52-55ca631feb51)


## Features and Functionality
We distinguish three different components while reviewing with AnnotateGPT: Annotation, Review criteria and the Review.

### Annotation management
Annotations can be performed by two different actors: the reviewer and the LLM.
- **Annotations by the reviewer.** The user can create their own annotations by selecting text in the PDF and clicking on the criterion button in the sidebar.
![annotation](https://github.com/onekin/AnnotateGPT/assets/31988855/c5534a68-6d26-4794-ba68-9ce2acf24d1b)

- **Annotations by the LLM.** The user can ask the LLM to annotate a criterion automatically.
![LLMannotation](https://github.com/onekin/AnnotateGPT/assets/31988855/6b9fe204-5223-4cce-b36e-2a3845c2f9ce)

The number of LLM-generated annotations can be configured in the options page. Double-clicking an annotation shows its details, including the associated sentiment and a comment field.

![det](https://github.com/onekin/AnnotateGPT/assets/31988855/78e34a8a-006b-41a3-9118-c2880287ed67)

It is also possible to include sentiment and comments for reviewer-created annotations. Comments can be written manually or generated by the LLM. These operations are accessible via right-click on an annotation:

![annotation](https://github.com/onekin/AnnotateGPT/assets/31988855/b5f4a22e-ca81-487f-9b07-08a354bcd7d7)

Available annotation operations:
- **Clarify.** Ask an open question to the LLM to clarify some doubts about the annotation content.
- **Fact checking.** Ask the LLM about the veracity of the text in the annotation.
- **Social judging.** Ask the LLM to surface social concerns about the annotated text.
- **Render.** Display the annotation details.
- **Delete.** Remove the annotation.

The LLM response window offers:

![answer](https://github.com/onekin/AnnotateGPT/assets/31988855/e6c17a92-23b0-4945-b4fe-6a3e0eaa90ae)

- **Redo.** Repeats the question to the LLM.
- **Save.** Saves the answer as the annotation comment.

### Review Criteria management
Criteria can be created from the sidebar. The next figure shows button (1) to create a criteria group and button (2) to create a new criterion.
![criterion](https://github.com/onekin/AnnotateGPT/assets/31988855/a5129c63-2356-4654-b5a0-63439c869f65)

When creating a new criterion you must provide a name and a description, which are important for querying the LLM.

![new](https://github.com/onekin/AnnotateGPT/assets/31988855/22fdcdde-ddb5-473a-a754-62af86e80e33)

You can modify a criterion's name by double-clicking its button:
![modfi](https://github.com/onekin/AnnotateGPT/assets/31988855/9bbb9d8b-3214-4366-baca-1c480e3f3c05)

#### Operations with review criteria
Right-clicking a criterion button shows four options:

![newa](https://github.com/onekin/AnnotateGPT/assets/31988855/ceeeb2bd-caf6-4e33-8848-e2c3ecb23d8d)

- **Annotate.** Ask the LLM to create annotations for this criterion.
- **Compile.** Ask the LLM to provide a summary of the criterion using the PDF content and the annotations.
- **Viewpoints.** Ask the LLM to provide different viewpoints about the current criterion assessment.
- **Render.** Display the assessments made for the criterion (annotations, compilation and viewpoints).

Example of Compile:
![met](https://github.com/onekin/AnnotateGPT/assets/31988855/c1545e54-f193-42d9-8a14-50c4f6f72dc9)

- **Redo.** Repeats the question to the LLM.
- **Save answer.** Saves the answer, which is then included in the review draft.

![example](https://github.com/onekin/AnnotateGPT/assets/31988855/f2c9d53e-b0a1-423f-90f4-a874f7ae25fb)


### Review management

AnnotateGPT provides different tools for managing the review. While working you can also request review drafts or consult the current status through a Canvas view.
![toolbar](https://github.com/onekin/AnnotateGPT/assets/31988855/a82e4f62-986c-4b79-a78d-bec71cb297b6)

#### Review drafts
There are two types of review drafts: review by criteria and review by sentiment. They are exported in HTML format and can be visualised in a browser. [[Example](https://drive.google.com/file/d/1xcjVmIWyr9Gpu5A8FS065dTbCe9uHziE/view?usp=sharing)]

![review](https://github.com/onekin/AnnotateGPT/assets/31988855/e3f3edd6-583a-4c61-bb3f-71caf509097b)

#### Canvas view
The canvas view allows tracking the current status of the review by annotations and their sentiment.
![status](https://github.com/onekin/AnnotateGPT/assets/31988855/b1205497-1e44-4832-9640-40d741c5064f)

#### Delete all annotations
This option deletes all the annotations of the current manuscript.

#### Settings
Access the options page and the prompt configuration page to customise and adapt the prompts.

## Support and Resources
- Support e-mail: xabier.garmendiad@ehu.eus
- Video demo: [https://youtu.be/3FOdsqpyyDA?si=_rHj8NFvQ9eQhaL4](https://youtu.be/3FOdsqpyyDA?si=_rHj8NFvQ9eQhaL4)

## Supported AI Providers
AnnotateGPT supports any **OpenAI-compatible** API endpoint. Built-in presets:

| Provider | Models |
|---|---|
| [OpenAI](https://platform.openai.com) | GPT-4o, GPT-4, GPT-3.5-turbo… |
| [Google Gemini](https://aistudio.google.com) | Gemini 1.5 Pro/Flash… |
| [Groq](https://groq.com) | Llama 3, Mixtral (fast inference) |
| [OpenRouter](https://openrouter.ai) | 200+ models from multiple providers |
| [DeepSeek](https://deepseek.com) | DeepSeek R1, V3… |
| [Mistral AI](https://mistral.ai) | Mistral Large, Codestral… |
| [Together AI](https://together.ai) | Open-source models |
| Local / Custom | [Ollama](https://ollama.com), [LM Studio](https://lmstudio.ai), or any OpenAI-compatible server |

# DEVELOPERS MANUAL
## Architecture Overview
AnnotateGPT is a browser extension developed with web technologies: JavaScript, Node.js and Gulp.
It targets [Manifest Version 3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3).

The extension follows the standard MV3 architecture:
- **Content scripts** — manage PDF annotation within the browser tab
- **Service worker (background)** — handles storage, LLM communication, and message routing
- **Options page** — endpoint and model configuration

## Development Environment
To build from source you need:
- Node.js v18+ (tested on v26)
- npm v9+
- Gulp v4

## Library Documentation
- [LangChain JS](https://js.langchain.com/docs/get_started/introduction) — LLM communication (`ChatOpenAI` with configurable `baseURL`)
- [pdf.js](https://mozilla.github.io/pdf.js/) — bundled PDF viewer

## Code Structure

These are the main components:
- `images/` — extension images
- `pages/` — HTML files (options, popup, sidebar, PDF viewer)
- `scripts/` — main source code
  - `background.js` — service worker entry point
  - `contentScript.js` — content script entry point
  - `options.js` — options page entry point
  - `background/LLM_Manager.js` — all LLM operations (endpoint CRUD, model fetching, inference)
  - `llm/LLMManager.js` — content-script-side LLM caller
  - `contentScript/` — PDF annotation logic
  - `options/Options.js` — options page wizard logic
  - `utils/` — shared utilities

## Building and Testing
Make sure you have the Node.js version specified above, then:

$ npm install
$ gulp default

The compiled extension will be in the `dist/` directory. Load it in Chrome via `chrome://extensions` → **Load unpacked**.

## Usage

Run `$ gulp --watch` and load the `dist` directory into Chrome.

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