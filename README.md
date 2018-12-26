# beamBouncer

a 2-player co-op radial pong game: https://beambouncer.herokuapp.com

---

## Launch
Every game has a unique 4-character id. Go to the homepage to start a new one - or join a friend's!

## Gameplay
In this real-time game, red and blue work together to keep the beams inside the arena. Rotating orbs can change the beam colors.

Red beams only bounce off the red player; blue beams off the blue player. Red and blue must overlap to capture and reset purple beams.


## Code
The app is powered by nodeJS and websockets, written in 100% raw javascript.

---
<pre>
beambouncer
|- package.json
|- index.js (handleRequest, parseRequest, routeRequest, \_302, \_403, \_404; handleSocket, parseSocket, routeSocket, \_400)
|- node_modules
|   |- websocket
|
|- main
|   |- logic.js (logError, logStatus, logMessage, logTime; getEnvironment, getAsset, getSchema; isNumLet, isBot; getDistance, getAngle, getMinimumAngle, getRadiansFromDegrees, getDegreesFromRadians, getCartesianFromPolar, getPolarFromCartesian; renderHTML; generateRandom, chooseRandom; determineSession)
|   |- stylesheet.css
|   |- draw.js (getCanvasFromWindow; clearCanvas; drawLine, drawCircle, drawText, drawGradient)
|   |- j.png
|   |- logo.png
|   |- \_404.html
|
|- home
|   |- logic.js (createGame, createPlayer; joinGame)
|   |- index.html
|   |- stylesheet.css
|   |- script.js (isNumLet, sendPost, displayMessage; createGame, joinGame)
|
|- game
    |- logic.js (addPlayer, removePlayer; submitStart, submitPosition; startGame, updateGame, scoreGame, endGame; updatePosition)
    |- index.html
    |- stylesheet.css
    |- script.js (createSocket, checkLoop; submitStart, submitPosition; receivePost; drawGame)
</pre>
