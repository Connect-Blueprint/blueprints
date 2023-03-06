// When user request Blueprint inputs
Blueprint.onListInputs = async function() {
    
    // Create a `text` input for the message
    let messageText = Blueprint.newInput("message_text", "Message Text", "text")
    
    // Create a `select` input for the user...
    let recipientUser = Blueprint.newInput("recipient_user", "Recipient User", "select")
    
    // and when user requests recipientUser options...
    recipientUser.onListOptions = async function() {
      
      // Get user preference value with
      // Blueprint.userPreferences.preference_id
      const headers = {
        "Authorization": "Bearer " + Blueprint.userAuthentification.accessToken,
        "Content-Type": "application/json;charset=UTF-8",
      };
      
      // Call Slack API to list users with 
      // UrlFetch(url, options?)
      const response = await UrlFetch("https://slack.com/api/users.list", {
        method: "get",
        headers: headers,
      });
      
      const json = JSON.parse(response);
      
      // Create options from the list of users
      json.members.forEach(member => {
        // If the user has a profile picture, include it as an icon for the option
        let icon = null;
        if (member.profile && member.profile.image_48) {
          icon = member.profile.image_48;
        }
        recipientUser.newOption(member.id, member.name, icon);
      })
      
    }
    
}


// When user run the Blueprint
Blueprint.onExecution = async function() {
  
  // Get user input values with
  // Blueprint.userInputs.input_id
  const requestBody = {
      channel: Blueprint.userInputs.recipient_user,
      text: Blueprint.userInputs.message_text
  }
  
  // Get user preference value with
  // Blueprint.userPreferences.preference_id
  const headers = {
      "Authorization": "Bearer " + Blueprint.userAuthentification.accessToken,
      "Content-Type": "application/json;charset=UTF-8",
  };
  
  // Call API with 
  // UrlFetch(url, options?)
  const response = await UrlFetch("https://slack.com/api/chat.postMessage", {
    method: "post",
    headers: headers,
    body: JSON.stringify(requestBody),
  });
    
  // Use print(string) for debugging 
  print(response)
  
  const json = JSON.parse(response)
  
  // Create result
  Blueprint.newResult("success","Message Sent") 

}
