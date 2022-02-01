
const apiURL = "https://api.notion.com/";
const headers = {
    "Authorization": "Bearer " + Blueprint.userPreferences.notion_token,
    "Notion-Version": "2021-08-16",
    "Content-Type": "application/json;charset=UTF-8",
};

Blueprint.onListInputs = async function() {

    let database = Blueprint.newInput("database_id", "Database", "select")
    database.onListOptions = async function() {
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
        JSON.parse(fetchedDatabases).results.map(function(db) {
            database.newOption(db.id, (db.title[0].plain_text ? db.title[0].plain_text : "Untitled"), null)
        })
    }

    let title = Blueprint.newInput("page_title", "Page Title", "text")

    if (database.getValue()) {
        const database_id = database.getValue()

        const response = await UrlFetch(apiURL + "v1/databases/" + database_id, {
            method: "get",
            headers: headers
        });
        const json = JSON.parse(response)

        const properties = json.properties
        const propertyNames = Object.keys(properties).reverse()

        propertyNames.forEach(function(name) {
            const property = properties[name];

            if (["number", "rich_text", "url", "email", "phone_number", "date", "checkbox", "select", "multi_select", "relation"].includes(property.type)) {

                let inputId = "property::" + property.type + "::" + property.id
                
                if (["number", "rich_text", "url", "email", "phone_number"].includes(property.type)) {
                    const propInput = Blueprint.newInput(inputId, name, "text")
                    
                } else if (["date"].includes(property.type)) {
                    const propInput = Blueprint.newInput(inputId, name, "date")
                
                } else if (["checkbox"].includes(property.type)) {
                    const propInput = Blueprint.newInput(inputId, name, "select")
                    propInput.newOption("true", "Checked", null)
                    propInput.newOption("false", "Unhecked", null)
                    
                } else if (["select", "multi_select"].includes(property.type)){
                    const propInput = Blueprint.newInput(inputId, name, "select")
                    propInput.onListOptions = async function() {
                        property[property.type].options.map(function(option) {
                            propInput.newOption(option.id, option.name, "https://raw.githubusercontent.com/HenriChabrand/ios-shortcut/main/extensions/notion/assets/ios_select_" + option.color + ".png")
                        })
                    }
                }
            }
        });
    }
}


Blueprint.onExecution = async function() {
    print("Distant onExecution")
    print(JSON.stringify(Blueprint.userInputs))
   
  const title = Blueprint.userInputs.page_title
  const database_id = Blueprint.userInputs.database_id

  print("title : "+ title)
  print("database_id : "+ database_id)

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
  
  print(JSON.stringify(requestBody))
   
  const inputIds = Object.keys(Blueprint.userInputs)
  print(inputIds)
  inputIds.forEach(function (inputId) {
    const input = Blueprint.userInputs[inputId]
    print(input)
    if(inputId === "page_title" || inputId === "database_id")
      return 
    
    print("Is Property")
    print(inputId)
    const propIdAndType = inputId.replace("property::","").split("::")
    print(propIdAndType)
    const propId = propIdAndType[0];
    print(propId)
    const type = propIdAndType[1];
       print(type)
    const value = input; 
      
      
       print(value)
      
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
        case "select":
        if (value !== "_select_null_") {
          requestBody.properties[propId] = {
            select: { id: value },
          };
        }
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
    
    print(JSON.stringify(requestBody))

  const response = await UrlFetch(apiURL + "v1/pages", {
    method: "post",
    headers: headers,
    body: JSON.stringify(requestBody),
  });
  const json = JSON.parse(response)
  Blueprint.newResult(json.id,title)
  print(JSON.stringify(json))
  
}
