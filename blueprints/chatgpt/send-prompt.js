// When user request Blueprint inputs
Blueprint.onListInputs = async function() {

  // Create inputs with
  // Blueprint.newInput(id, name, type)

  // Create a `text` input for question
  let question = Blueprint.newInput("question", "What's your question?", "text")

  // Create a `text` input for max_tokens
  let maxTokens = Blueprint.newInput("max_tokens", "Max Tokens", "text")
  maxTokens.value = "60"

  // Create a `select` input for temperature
  let temperature = Blueprint.newInput("temperature", "Temperature", "select")
  temperature.newOption("0.1", "0.1")
  temperature.newOption("0.2", "0.2")
  temperature.newOption("0.3", "0.3")
  temperature.newOption("0.4", "0.4")
  temperature.newOption("0.5", "0.5")
  temperature.newOption("0.6", "0.6")
  temperature.newOption("0.7", "0.7")
  temperature.newOption("0.8", "0.8")
  temperature.newOption("0.9", "0.9")
  temperature.value = "0.5"

}

// When user run the Blueprint
Blueprint.onExecution = async function() {

  // Get user input values with
  // Blueprint.userInputs.input_id
  const requestBody = {
      prompt: Blueprint.userInputs.question,
      max_tokens: parseInt(Blueprint.userInputs.max_tokens),
      temperature: parseFloat(Blueprint.userInputs.temperature)
  }

  // Call OpenAI API with
  // UrlFetch(url, options?)
  const response = await UrlFetch("https://api.openai.com/v1/engines/gpt-3.5-turbo/completions", {
    method: "post",
    headers: {
      "Authorization": "Bearer " + Blueprint.userPreferences.openai_access_token,
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(requestBody),
  });

  // Use print(string) for debugging
  print(response)

  const json = JSON.parse(response)

  // Create result
  Blueprint.newResult("success", json.choices[0].text.trim())

}
