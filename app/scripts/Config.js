const Config = {
  review: {
    groupName: 'ReviewAndGo',
    namespace: 'review',
    urlParamName: 'rag',
    defaultLLM: 'anthropic',
    defaultQuery: 'I will provide you the content of a research paper. ' +
      'Then, you have to act as an academic reviewer and assess  the [C_NAME] criterion which description is separated by triple backticks ```[C_DESCRIPTION]```.' +
      ' For the criterion, you have to provide THREE text fragments as pieces of evidence from the provided article that can help to assess the given criterion.' +
      ' You have to provide the response in JSON format with the following keys: -name (contains the criteria name), -paragraphs (an array with THREE objects with two keys (text and sentiment).' +
      ' The key "text" provide the text fragment written in the same way as in the article that can be useful to assess the criterion).' +
      ' The key "sentiment" assess if the given "text" support whether the criterion is "Met", "Partially met" or "Not met". ' +
      'The sentiment key only has to include one of the last three values, but it can be different for each object',
    resumeQuery: 'I will provide you the content of a research paper. Then, you have to act as an academic reviewer and assess ' +
      ' the [C_NAME] criterion which description is separated by triple backticks ```[C_DESCRIPTION]```. For the criterion, you have to assess if it is met considering these possible results:' +
      ' Met, Partially met, or Not met. Then, you have to explain  why it is met or not met' +
      ' You have to provide the response in JSON format with' +
      ' the following keys: -name (contains the criteria name), -sentiment (met, partially met or not met), -comment (the reason of the results),',
    alternativeQuery: 'I will provide you the content of a research paper. Then, you have to act as an academic reviewer and generate ' +
      ' alternative view points for the [C_NAME] criterion which description is separated by triple backticks ```[C_DESCRIPTION]```.' +
      ' You have to provide the response in JSON format with' +
      ' the following keys: -name (contains the criteria name), -answer (the different viewpoints in different bullet points with dashes. all the content must be specified in the answer key, without creating keys inside),',
    factCheckingQuery: 'Fack check the following triple quoted text ```[C_TEXT]``` .' +
      ' You have to provide the response in JSON format with' +
      ' the following key: -answer (the answer to the question. all the content must be specified in the answer key, without creating keys inside),',
    socialJudgeQuery: 'Is it socially appropriate to say the following triple-quoted text? ```[C_TEXT]``` as important.' +
      ' You have to provide the response in JSON format with' +
      ' the following keys: -name (contains the criteria name), -answer (the answer to the question. all the content must be specified in the answer key, without creating keys inside),',
    clarificationQuery: 'I asked you to assess the following criterion for the provided research paper: [C_NAME] and your considered the text excerpt found in triple quoted text ```[C_TEXT]``` as important. Therefore, now i would like to ask you [C_QUESTION]?' +
      ' You have to provide the response only in JSON format with a single key, which is answer' +
      ' the following keys: -answer (the answer to the question. all the content must be specified in the answer key, without creating keys inside),' +
      ' do not add more text to your answer apart from the json with the answer in the "answer key"',
    tags: { // Defined tags for the domain
      grouped: { // Grouped annotations
        group: 'criteria',
        subgroup: 'level',
        relation: 'isCriteriaOf'
      }
    }
  }
}

export default Config
