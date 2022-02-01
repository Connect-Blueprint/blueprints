
// Set API base URL
const apiURL = "https://api.notion.com/";

// Set headers 
// Get API token with → Blueprint.userPreferences.notion_token
const headers = {
    "Authorization": "Bearer " + Blueprint.userPreferences.notion_token,
    "Notion-Version": "2021-08-16",
    "Content-Type": "application/json;charset=UTF-8",
};


// When interface request Blueprint inputs
Blueprint.onListInputs = async function() {
    
    // Set database input
    let database = Blueprint.newInput("database_id", "Database", "select")
    
    // List available databases when interface request database input options
    database.onListOptions = async function() {
        
        // Use `UrlFetch` to call Notion API and get databases
        let fetchedDatabases = await UrlFetch(apiURL + "v1/search", {
            method: "post",
            headers: headers,
            body: JSON.stringify({
                "sort": {
                    "direction": "descending",
                    "timestamp": "last_edited_time"
                },
                "filter": {
                    "value": "database",
                    "property": "object"
                }
            }),
        });
        
        // For each available databases...
        JSON.parse(fetchedDatabases).results.map(function(db) {
            // Create a new input iption
            database.newOption(db.id, (db.title[0].plain_text ? db.title[0].plain_text : "Untitled"), null)
        })
    }
    
    // Set page title input
    let title = Blueprint.newInput("page_title", "Page Title", "text")

    // If the user as selected a database...
    if (database.getValue()) {
        
        // Get database id
        const database_id = database.getValue()
        
        // Fetch database properties
        const response = await UrlFetch(apiURL + "v1/databases/" + database_id, {
            method: "get",
            headers: headers
        });
        const json = JSON.parse(response)

        const properties = json.properties
        const propertyNames = Object.keys(properties).reverse()
        
        // For each properties...
        propertyNames.forEach(function(name) {
            const property = properties[name];
            
            // Filter compatible properties
            if (["number", "rich_text", "url", "email", "phone_number", "date", "checkbox", "select", "multi_select"].includes(property.type)) {
                
                // Set input id with property ID and Type
                let inputId = "property::" + property.type + "::" + property.id
                
                // For property that can be set via a text input...
                if (["number", "rich_text", "url", "email", "phone_number"].includes(property.type)) {                    
                    // Create a text input
                    const propInput = Blueprint.newInput(inputId, name, "text")
                
                // For date property...
                } else if ("date" === property.type) {
                    // Create a date input
                    const propInput = Blueprint.newInput(inputId, name, "date")
                
                // For checkbox property...
                } else if ("checkbox" === property.type) {
                    // Create a select input...
                    const propInput = Blueprint.newInput(inputId, name, "select")
                    // With two input options: true and false
                    propInput.newOption("true", "Checked", null)
                    propInput.newOption("false", "Unhecked", null)
                
                // For property that can be set via a select input...
                } else if (["select", "multi_select"].includes(property.type)){
                    // Create a select input
                    const propInput = Blueprint.newInput(inputId, name, "select")
                    // With corresponding input options...
                    property[property.type].options.map(function(option) {
                        propInput.newOption(option.id, option.name, "https://raw.githubusercontent.com/HenriChabrand/ios-shortcut/main/extensions/notion/assets/ios_select_" + option.color + ".png")
                    })                    
                }
            }
        });
    }
}


Blueprint.onExecution = async function() {
   
  // Get user inputs
  const title = Blueprint.userInputs.page_title
  const database_id = Blueprint.userInputs.database_id
  
  // Set request body
  const requestBody = {
    parent: {
      database_id: database_id,
    },
    properties: {
      title: {
        title: [
            {
              text: {
                content: title
              }
            }
        ]
      }      
    }
  }
   
  const inputIds = Object.keys(Blueprint.userInputs)
  
  // For each input ids...
  inputIds.forEach(function (inputId) {
    
    if(inputId === "page_title" || inputId === "database_id")
      return 
      
    // Get input value
    const value = Blueprint.userInputs[inputId]
    
    // Extract property ID and Type
    const propIdAndType = inputId.replace("property::","").split("::")
    const type = propIdAndType[0]
    const propId = propIdAndType[1]
      
    if (value) {
      switch (type) {
        case "number":
        requestBody.properties[propId] = {
          number: parseFloat(value),
        };
        break;
        case "rich_text":
        requestBody.properties[propId] = {
          rich_text: [
          {
            text: {
              content: value,
            },
          },
          ],
        };
        break;
        case "url":
        requestBody.properties[propId] = {
          url: value,
        };
        break;
        case "email":
        requestBody.properties[propId] = {
          email: value,
        };
        break;
        case "phone_number":
        requestBody.properties[propId] = {
          phone_number: value,
        };
        break;
        case "date":
        requestBody.properties[propId] = {
          date: {
            start: value,
          },
        };
        break;
        case "checkbox":
        requestBody.properties[propId] = {
              checkbox: value === "true" ? true : false
          };
        break;
        case "select":
        requestBody.properties[propId] = {
          select: { id: value },
        };
        break;
        case "multi_select":
        requestBody.properties[propId] = {
          multi_select: [{ id: value }]
        };
        break;
      case "relation":
        requestBody.properties[propId] = {
          relation: [{ id: value }]
        };
        break;
      }
    }
  });
  
  // Create page
  const response = await UrlFetch(apiURL + "v1/pages", {
    method: "post",
    headers: headers,
    body: JSON.stringify(requestBody),
  });
  const json = JSON.parse(response)
  
  // Create result
  Blueprint.newResult(json.id,title)  
}
