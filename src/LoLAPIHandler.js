//Contains all functions for interacting with the LoL API

//Send messages
function LoLApi (messageName, payloadObj) {
    let msg={
        "message": messageName,
        "payload": JSON.stringify(payloadObj)
    };

    parent.postMessage(msg,'*');
}

//Called when the game starts, tells LoL API game is ready
function gameStart()
{
    LoLApi("gameIsReady", 
    { 
        aspectRatio: "16:9",
        resolution: "880x660",
    });

	console.log("gameIsReady sent"); 
}

//Listen for messages
window.addEventListener("message", function (msg) {
    //console.log('[PARENT => UNITY]', msg);

    switch (msg.data.messageName) 
    {
        case 'pause':
            gameIsPaused = true;
            break;
        case 'resume':
            gameIsPaused = false;
            break;
    }
});

var gameIsPaused = false;
var sentComplete = false;

//Progress Handling
  var progArray = new Array(35).fill(0);
  var currProgress = 0;
  var maxProgress = 35;

  //Add tutorial progress
  function completeLevel(index)
  {
    if (progArray[index] == 0) //first time level is being completed
    {
      progArray[index] = 1;
      currProgress = Math.min(maxProgress, currProgress + 1);
      sendProgress();
      checkGameEnd();
    }
  }

  //Send new progress to LoL API
  function sendProgress()
  {
    LoLApi('progress', {score: 0, currentProgress: currProgress, maximumProgress: maxProgress});

    console.log("progress: " + currProgress + "/"+maxProgress);
  }

//Determine if progress points are maxed. If so, end the game
function checkGameEnd()
{
  if (currProgress >= maxProgress)
  {
    endGame();
  }
}

//Tell LoL API to end the game
function endGame()
{
  if (!sentComplete)
  {
    sentComplete = true;
    LoLApi('complete', {});
    console.log("Complete");
  }
}
