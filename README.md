# Blueprint
Everything you need to extend Apple Shortcut.


## Simple Framework
```javascript

// When user request Blueprint inputs
Blueprint.onListInputs = async function() {
    
    // Create an input with
    // Blueprint.newInput(id, name, type)
    
  
    // Create a `text` input
    let statusText = Blueprint.newInput("status_text", "Status Message", "text")
    
    // Create a `date` input
    let statusExpiration = Blueprint.newInput("status_expiration", "Status Expiration Date", "date")
    
    // Create a `select` input...
    let statusEmoji = Blueprint.newInput("status_emoji", "Status Emoji", "select")    
    // And when user request statusEmoji options...
    statusEmoji.onListOptions = async function() {        
        //  add some options with
        // .newOption(id, name, icon?)
        statusEmoji.newOption(":coffee:", "☕️ Coffee")
        statusEmoji.newOption(":croissant:", "🥐 Croissant")
    }
    
}


// When user run the Blueprint
Blueprint.onExecution = async function() {
  
  // Get user input values
  let statusTextValue = Blueprint.userInputs.status_text
  let statusExpirationValue = Blueprint.userInputs.status_expiration
  let statusEmojiValue = Blueprint.userInputs.status_emoji
  
  // Set request body
  const requestBody = {
      profile: {
          status_text: statusTextValue,          
          status_expiration: statusExpirationValue,
          status_emoji: statusEmojiValue
      }
  }
  
  // Set headers 
  // Get user preference value with
  // Blueprint.userPreferences.slack_token
  const headers = {
      "Authorization": "Bearer " + Blueprint.userPreferences.slack_token,
      "Content-Type": "application/json;charset=UTF-8",
  };
  
  // Call API with 
  // UrlFetch(url, options?)
  const response = await UrlFetch("https://slack.com/api/users.profile.set", {
    method: "post",
    headers: headers,
    body: JSON.stringify(requestBody),
  });
    
  // Use print() for debugging 
  print(response)
  
  const json = JSON.parse(response)
  
  // Create result
  Blueprint.newResult("success","Status Set") 

}
