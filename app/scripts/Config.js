const Config = {
  review: {
    groupName: 'AnnotatorGPT',
    namespace: 'review',
    urlParamName: 'rag',
    defaultLLM: 'anthropic',
    defaultQuery: 'Research Paper Context: [The research paper is provided above]\n' +
    'Criterion for Evaluation: [C_NAME]\n' + 'Criterion Description: [C_DESCRIPTION]\n' +
'Based on the above, please analyze the full research paper and generate a JSON response. The JSON should list THREE paragraphs of the paper that are associated with the criterion for evaluation and indicate whether it meets the specified criterion ("Met"), (“Partially Met”) or not ("Not Met"). The format should be as follows:\n' +
'{\n' +
  '"name": "[Criterion Name]",\n' +
  '"paragraphs": [\n' +
  '{\n' +
    '"text": "[Text of the first significant paragraph]",\n' +
    '"sentiment": "[Met/Partially Met/Not met]"\n' +
  '},\n' +
  '{\n' +
    '"text": "[Text of the second significant paragraph]",\n' +
    '"sentiment": "[Met/Partially met/Not met]"\n' +
  '},\n' +
  '{\n' +
    '"text": "[Text of the third significant paragraph]",\n' +
    '"sentiment": "[Met/Partially met/Not met]"\n' +
  '},\n' +
']\n' +
'}\n' +
'When using this prompt, replace the placeholders with the actual content of the research paper and the specific criterion details.\n',
    resumeQuery: 'I will provide you the content of a research paper. Then, you have to act as an academic reviewer and assess ' +
      ' the criterion <criterion> [C_NAME] </criterion> which description is <description>[C_DESCRIPTION]</description>. For the criterion, you have to assess if it is met considering these possible results:' +
      ' Met, Partially met, or Not met. Then, you have to explain  why it is met or not met.' +
      ' Based your opinion mainly in the following paragraphs: <paragraphs>[C_PARAGRAPHS]</paragraphs>' +
      ' You have to provide the response in JSON format with' +
      ' the following keys: -"name" (contains the criteria name), -"sentiment" (met, partially met or not met), -"comment" (the reason of the results, if you mention one of the paragraphs in your comment reference the full paragraphs instead of the paragraph number),',
    alternativeQuery: 'I will provide you the content of a research paper. Then, you have to act as an academic reviewer and generate ' +
      ' alternative view points for the <name>[C_NAME]</name> criterion which description is separated by <description>[C_DESCRIPTION]</description>.' +
      ' Based your opinion mainly in the following paragraphs: <paragraphs>[C_PARAGRAPHS]</paragraphs>' +
      ' You have to provide the response in JSON format with' +
      ' the following keys: -"name" (contains the criteria name), -"answer" (the different viewpoints in different bullet points with dashes. all the content must be specified in the answer key, without creating keys inside, if you mention one of the paragraphs in your answer reference the full paragraphs instead of the paragraph number),',
    factCheckingQuery: 'Fack check the following text <text>[C_TEXT]</text>.' +
      ' You have to provide the response in JSON format with' +
      ' the following key: -"answer" (the answer to the question. all the content must be specified in the answer key, without creating keys inside),',
    socialJudgeQuery: 'Is it socially appropriate to say the following text? <text>[C_TEXT]<text> as important.' +
      ' You have to provide the response in JSON format with' +
      ' the following keys: -"name" (contains the criteria name), -"answer" (the answer to the question. all the content must be specified in the answer key, without creating keys inside),',
    clarificationQuery: 'I asked you to assess the following criterion for the provided research paper <criterion>[C_NAME]</criterion> and your considered the text excerpt found in triple quoted text <criterion>[C_TEXT]</criterion> as important. Therefore, now I would like to ask you [C_QUESTION]?' +
      ' You have to provide the response only in JSON format with a single key, which is answer' +
      ' the following keys: -"answer" (the answer to the question. all the content must be specified in the answer key, without creating keys inside),' +
      ' do not add more text to your answer apart from the json with the answer in the "answer key"',
    llmReviewQuery: 'Please rewrite the following provided review along the guidelines provided before <review>[C_REVIEW]</review>. ' +
      'Your answer only has to be provided in JSON format, that is it must start with a { and end with }' +
      'The JSON only has to contain a single key called "answer": The key named "answer" has to contain the rewritten review based on the provided guidelines the answer to the question.',
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
