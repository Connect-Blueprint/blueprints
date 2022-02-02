
// Set API base URL
const apiURL = "https://slack.com/api/";

// Set headers 
// Get API token with → Blueprint.userPreferences.slack_token
const headers = {
    "Authorization": "Bearer " + Blueprint.userPreferences.slack_token,
    "Content-Type": "application/json;charset=UTF-8",
};

// Set status_text input
let statusText = Blueprint.newInput("status_text", "Status Text", "text")
let statusEmoji = Blueprint.newInput("status_emoji", "Status :emoji:", "text")



Blueprint.onExecution = async function() {
  
  // Set request body
  const requestBody = {
      profile: {
          status_text: ( statusText.getValue() ? statusText.getValue() : "" ),
          status_emoji: ( statusEmoji.getValue() ? statusText.getValue() : "" ),
          status_expiration: 0
      }
  }
   
  
  // Call set Satus Endpoint
  const response = await UrlFetch(apiURL + "users.profile.set", {
    method: "post",
    headers: headers,
    body: JSON.stringify(requestBody),
  });
  const json = JSON.parse(response)
  
  // Create result
  Blueprint.newResult("success","Status Set")  
}
