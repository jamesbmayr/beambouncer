/*** tools ***/
	/* isNumLet */
		function isNumLet(string) {
			return (/^[a-z0-9A-Z_\s]+$/).test(string)
		}

	/* sendPost */
		function sendPost(post, callback) {
			var request = new XMLHttpRequest()
				request.open("POST", location.pathname, true)
				request.onload = function() {
					if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
						callback(JSON.parse(request.responseText) || {success: false, message: "unknown error"})
					}
					else {
						callback({success: false, readyState: request.readyState, message: request.status})
					}
				}
				request.send(JSON.stringify(post))
		}

	/* displayMessage */
		var message = document.getElementById("message")
		var messageFadein = null
		var messageFadeout = null

		function displayMessage(text) {
			message.textContent = text || "unknown error"
			message.className = ""
			message.style.opacity = 0
			
			if (typeof messageFadein  !== "undefined") { clearInterval(messageFadein)  }
			if (typeof messageFadeout !== "undefined") { clearInterval(messageFadeout) }

			messageFadein = setInterval(function() { // fade in
				message.className = ""
				var opacity = Number(message.style.opacity) * 100

				if (opacity < 100) {
					message.style.opacity = Math.ceil( opacity + ((100 - opacity) / 10) ) / 100
				}
				else {
					clearInterval(messageFadein)
					if (typeof messageFadeout !== "undefined") { clearInterval(messageFadeout) }
					
					messageFadeout = setInterval(function() { // fade out
						var opacity = Number(message.style.opacity) * 100

						if (opacity > 0.01) {
							message.style.opacity = Math.floor(opacity - ((101 - opacity) / 10) ) / 100
						}
						else {
							clearInterval(messageFadeout)
							if (typeof messageFadein !== "undefined") { clearInterval(messageFadein) }

							message.className = "hidden"
							message.style.opacity = 0
						}
					}, 100)
				}
			}, 100)
		}

/*** actions ***/
	/* createGame */
		document.getElementById("createGame").addEventListener("click", createGame)
		function createGame() {
			// data
				var post = {
					action: "createGame"
				}

			// submit
				sendPost(post, function(data) {
					if (!data.success) {
						displayMessage(data.message || "Unable to create a game...")
					}
					else {
						window.location = data.location
					}
				})
		}

	/* joinGame */
		document.getElementById("joinGame").addEventListener("click", joinGame)
		document.getElementById("gameCode").addEventListener("keyup", function (event) { if (event.which == 13) { joinGame() } })
		function joinGame() {
			// get values
				var gameCode = document.getElementById("gameCode").value.replace(" ","").trim().toLowerCase() || false

			if (gameCode.length !== 4) {
				displayMessage("The game code must be 4 letters.")
			}
			else if (!isNumLet(gameCode)) {
				displayMessage("The game code can be letters only.")
			}
			else {
				// data
					var post = {
						action: "joinGame",
						gameid: gameCode
					}

				// submit
					sendPost(post, function(data) {
						if (!data.success) {
							displayMessage(data.message || "Unable to join this game...")
						}
						else {
							window.location = data.location
						}
					})
			}
		}
