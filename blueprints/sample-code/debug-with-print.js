
// You can use print() to log variable while developing.
print("My first log !")

// All log can be found in the Blueprint iOS App > "Your Blueprint Name".
// You need to be in developer mode to see the logs.


// When interface request Blueprint inputs
Blueprint.onListInputs = async function() {
    
    print("User request inputs")
    
    // Create an input text
    let textToPrint = Blueprint.newInput("text_to_print", "Text to Print", "text")
    
}


Blueprint.onExecution = async function() {
  
  print("User run blueprint")
  
  print(JSON.stringify(Blueprint.userInputs))
  
  print("Print \"" + Blueprint.userInputs.text_to_print + "\"")
  
  
  // Create dummy result
  Blueprint.newResult("result_1", "I printed \"" + Blueprint.userInputs.text_to_print + "\"")  
}
