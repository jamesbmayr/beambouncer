/*** globals ***/
	/* defaults */
		document.addEventListener("dblclick", function(event) {
			event.preventDefault()
		})

		document.addEventListener("contextmenu", function(event) {
			event.preventDefault()
		})

	/* triggers */
		if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
			var on = { click: "touchstart", mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }
		}
		else {
			var on = { click:      "click", mousedown:  "mousedown", mousemove: "mousemove", mouseup:  "mouseup" }
		}

	/* variables */
		var data        = window.data = {}
		var socket      = null

/*** websocket ***/
	/* socket */
		createSocket()
		function createSocket() {
			socket = new WebSocket(location.href.replace("http","ws"))
			socket.onopen = function() { socket.send(null) }
			socket.onerror = function(error) {}
			socket.onclose = function() {
				socket = null
				window.location = "../../../../"
			}

			socket.onmessage = function(message) {
				try {
					var post = JSON.parse(message.data)
					if (post && (typeof post == "object")) {
						receivePost(post)
					}
				}
				catch (error) {}
			}
		}

	/* checkLoop */
		var checkLoop = setInterval(function() {
			if (!socket) {
				try {
					createSocket()
				}
				catch (error) {}
			}
			else {
				clearInterval(checkLoop)
			}
		}, 5000)

/*** submit ***/
	/* submitStart */
		document.addEventListener(on.click, submitStart)
		function submitStart(event) {
			if (data && data.state && (!data.state.start || data.state.end) && socket) {
				// socket
					socket.send(JSON.stringify({
						action: "submitStart"
					}))
			}
		}

	/* submitPosition */
		document.addEventListener(on.mousemove, submitPosition)
		function submitPosition(event) {
			if (data && data.state && socket) {
				// coordinates
					var x = event.touches ? event.touches[0].clientX : event.clientX
					var y = event.touches ? event.touches[0].clientY : event.clientY
					var coords = getCanvasFromWindow(x, y)

				// socket
					socket.send(JSON.stringify({
						action: "submitPosition",
						x: coords.x,
						y: coords.y
					}))
			}
		}

	/* submitArrow */
		document.addEventListener("keydown", submitArrow)
		function submitArrow(event) {
			if (data && data.state && socket) {
				// arrow
					var arrow = null
					switch (event.key) {
						case "ArrowLeft":
						case "a":
							arrow = "left"
						break
						case "ArrowRight":
						case "d":
							arrow = "right"
						break
						case "ArrowUp":
						case "w":
							arrow = "up"
						break
						case "ArrowDown":
						case "s":
							arrow = "down"
						break
						default
							arrow = null
						break
					}

				// socket
					if (arrow) {
						socket.send(JSON.stringify({
							action: "submitArrow",
							arrow: arrow
						}))
					}
			}
		}

/*** receives ***/
	/* receivePost */
		function receivePost(post) {
			// redirect or update info
				if (post.location) {
					window.location = post.location
				}
				else {
					for (var k in post) {
						data[k] = post[k]
					}
				}

			// overlay or message
				if (post.message) {
					if (data.eraseTimer) {
						clearInterval(eraseTimer) 
					}

					data.eraseTimer = setTimeout(function() {
						clearInterval(data.eraseTimer)
						data.eraseTimer = null
						data.message    = null
					}, 5000)
				}

			// draw
				drawGame()
		}

/*** canvas ***/
	/* drawGame */
		function drawGame() {
			// clear
				clearCanvas()

			// message
				if (data.message) {
					drawText(500, 450, data.message, {size: 25, color: "white"})
				}
				else if (Object.keys(data.paddles).length < 2) {
					drawText(500, 450, "game code: " + window.location.pathname.slice(-4), {size: 25, color: "white"})
				}
				else if (!data.state.start || data.state.end) {
					drawText(500, 450, "click to play", {size: 25, color: "white"})
				}

			// score
				if (data.state.score) {
					drawText(500, 500, data.state.score, {size: 50, color: "white"})
				}

			// draw orbs
				for (var o in data.orbs) {
					var orb = data.orbs[o]
					if (orb.x !== null && orb.y !== null) {
						drawCircle(orb.x + 500, canvas.height - (orb.y + 500), orb.radius, {color: orb.color, opacity: 0.5, blur: 2, shadow: orb.color})
					}
				}

			// draw beams
				for (var b in data.beams) {
					var beam = data.beams[b]
					if (beam.x !== null && beam.y !== null) {
						drawCircle(beam.x + 500, canvas.height - (beam.y + 500), beam.radius, {color: beam.color, blur: 2, shadow: beam.color})
						drawLine(beam.x + 500, canvas.height - (beam.y + 500), beam.tx + 500, canvas.height - (beam.ty + 500), {color: beam.color, border: 8, opacity: 0.5, blur: 2, shadow: beam.color})
					}
				}

			// draw paddles
				for (var p in data.paddles) {
					var paddle = data.paddles[p]
					if (paddle.x !== null && paddle.y !== null) {
						drawCircle(paddle.x + 500, canvas.height - (paddle.y + 500), paddle.radius, {color: paddle.color, opacity: 0.5, blur: 2, shadow: paddle.color})
					}
				}
		}
