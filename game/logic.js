/*** modules ***/
	var main       = require("../main/logic")
	module.exports = {}

/*** players ***/
	/* addPlayer */
		module.exports.addPlayer = addPlayer
		function addPlayer(request, callback) {
			try {
				if (!request.game) {
					callback([request.session.id], {success: false, message: "unable to find game"})
				}
				else if (!request.game.players[request.session.id]) {
					callback([request.session.id], {success: false, message: "unable to find player in game"})
				}
				else {
					// connection
						request.game.players[request.session.id].connected  = true
						request.game.players[request.session.id].connection = request.connection

					callback([request.session.id], {success: true, message: "connected"})
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to add player"})
			}
		}

	/* removePlayer */
		module.exports.removePlayer = removePlayer
		function removePlayer(request, callback) {
			try {
				main.logStatus("[CLOSED]: " + request.path.join("/") + " @ " + (request.ip || "?"))
				if (request.game) {
					// remove player or connection?
						if (request.game.data.state.end) {
							delete request.game.players[request.session.id]
						}
						else if (request.game.players[request.session.id]) {
							request.game.players[request.session.id].connected = false
						}

					// player count
						var playerCount = 0
						for (var p in request.game.players) {
							if (request.game.players[p].connected) {
								playerCount++
							}
						}

					// delete game?
						if (!playerCount) {
							callback([], {success: true, delete: true, location: "../../../../"})
						}
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to remove player"})
			}
		}

/*** submits ***/
	/* submitStart */
		module.exports.submitStart = submitStart
		function submitStart(request, callback) {
			try {
				if (request.game.data.state.start && !request.game.data.state.end) {
					callback([request.session.id], {success: false, message: "game already started"})
				}
				else {
					request.game.players[request.session.id].ready = true
					
					// partner ready?
						var readyCount = 0
						for (var p in request.game.players) {
							if (request.game.players[p].ready) {
								readyCount++
							}
						}

					// start ?
						if (readyCount !== 2) {
							callback([request.session.id], {success: true, message: "waiting..."})
						}
						else {
							startGame(request, callback)
						}
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to submit start"})
			}
		}

	/* submitPosition */
		module.exports.submitPosition = submitPosition
		function submitPosition(request, callback) {
			try {
				updatePosition(request, callback)
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to submit position"})
			}
		}

/*** game ***/
	/* startGame */
		module.exports.startGame = startGame
		function startGame(request, callback) {
			try {
				// countdown
					setTimeout(function() {
						callback(Object.keys(request.game.players), {success: true, message: "3..."})
					}, 0)

					setTimeout(function() {
						callback(Object.keys(request.game.players), {success: true, message: "2..."})
					}, 1000)

					setTimeout(function() {
						callback(Object.keys(request.game.players), {success: true, message: "1..."})
					}, 2000)

				// reset
					setTimeout(function() {
						// set starting beam
							request.game.data.beams = []
							request.game.data.beams.push(main.getSchema("beam"))

						// set starting orbs
							request.game.data.orbs = []

						// set game state
							request.game.data.state.score = 0
							request.game.data.state.rotation = 0
							request.game.data.state.start = (new Date().getTime())
							request.game.data.state.end = null
							callback(Object.keys(request.game.players), {success: true, message: "begin!"})
					}, 3000)
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to start game"})
			}
		}

	/* updateGame */
		module.exports.updateGame = updateGame
		function updateGame(request, callback) {
			try {
				// update values
					if (request.game.data.state.start && !request.game.data.state.end) {
						// rotation
							request.game.data.state.rotation = main.getMinimumAngle(request.game.data.state.rotation + 1)

						// orbs
							for (var o in request.game.data.orbs) {
								// move
									var orb = request.game.data.orbs[o]
									var coords = main.getCartesianFromPolar(main.getMinimumAngle((360 / request.game.data.orbs.length * o) + request.game.data.state.rotation), 250)
										orb.x = coords.x
										orb.y = coords.y
							}

						// beams
							for (var b = 0; b < request.game.data.beams.length; b++) {
								// move
									var beam = request.game.data.beams[b]
										beam.tx = beam.x - (4 * beam.vx)
										beam.ty = beam.y - (4 * beam.vy)
										beam.x = beam.x + beam.vx
										beam.y = beam.y + beam.vy

									var coords = main.getPolarFromCartesian(beam.x, beam.y)
										beam.angle = coords.angle
										beam.distance = coords.distance

								// edge collisions
									if (beam.distance > 500) {
										request.game.data.beams.splice(b, 1)
										b--
										break
									}

								// orb collisions
									for (var o in request.game.data.orbs) {
										var orb = request.game.data.orbs[o]
										var distance = main.getDistance(beam.x, beam.y, orb.x, orb.y)
										var futureDistance = main.getDistance(beam.x + beam.vx, beam.y + beam.vy, orb.x, orb.y)

										if (distance < (beam.radius + orb.radius) && distance > futureDistance) {
											// change color
												beam.color = orb.color
										}
									}

								// purple collisions
									if (beam.color == "purple") {
										var red  = request.game.data.paddles.red
										var blue = request.game.data.paddles.blue

										// 5 points
											if ((main.getDistance(beam.x, beam.y,  red.x,  red.y) < (beam.radius +  red.radius))
											 && (main.getDistance(beam.x, beam.y, blue.x, blue.y) < (beam.radius + blue.radius))) {
											 	// remove beam
													request.game.data.beams.splice(b, 1)
													b--
													callback(Object.keys(request.game.players), {success: true, message: "+5!"})

												// update score
												 	for (var i = 0; i < 5; i++) {
														scoreGame(request, callback)
													}
											}
									}

								// paddle collisions
									else {
										var paddle = request.game.data.paddles[beam.color]
										if (beam.color == paddle.color) {
											var distance = main.getDistance(beam.x, beam.y, paddle.x, paddle.y)
											var futureDistance = main.getDistance(beam.x + beam.vx, beam.y + beam.vy, paddle.x, paddle.y)
											
											if (distance < (beam.radius + paddle.radius) && distance > futureDistance) {
												// tangent
													var radialAngle = main.getAngle(paddle.x, paddle.y, beam.x, beam.y)
													var tangentAngle = main.getMinimumAngle(radialAngle + 90)
												
												// initial
													var initialAngle = main.getDegreesFromRadians(Math.atan2(beam.vy, beam.vx))

												// final
													var v = main.getDistance(0, 0, beam.vx, beam.vy)
														v = Math.sign(v) * (Math.abs(v) + 0.5)
													var finalAngle = main.getMinimumAngle(tangentAngle + tangentAngle - initialAngle)
												
												// update data
													beam.vx = v * Math.cos(main.getRadiansFromDegrees(finalAngle))
													beam.vy = v * Math.sin(main.getRadiansFromDegrees(finalAngle))
													beam.x = beam.x + beam.vx
													beam.y = beam.y + beam.vy

												// increase score
													scoreGame(request, callback)
											}
										}
									}
							}

						// end game ?
							if (!request.game.data.beams.length) {
								endGame(request, callback)
							}
					}

				// data
					callback(Object.keys(request.game.players), request.game.data)
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to update game"})
			}
		}

	/* scoreGame */
		module.exports.scoreGame = scoreGame
		function scoreGame(request, callback) {
			try {
				// increase score
					request.game.data.state.score++

				// new beam
					if (request.game.data.state.score % 5 == 0 && request.game.data.beams.length < 25) {
						var counts = {
							red: 0,
							blue: 0,
							purple: 0
						}

						for (var b in request.game.data.beams) {
							counts[request.game.data.beams[b].color]++
						}

						var beam = main.getSchema("beam")
							beam.color = (counts.red > counts.blue) ? "blue" : (counts.blue > counts.red) ? "red" : beam.color
							var v = 10
							beam.vx = v * Math.cos(main.getRadiansFromDegrees(beam.angle)),
							beam.vy = v * Math.sin(main.getRadiansFromDegrees(beam.angle)),
						request.game.data.beams.push(beam)
					}

				// new orb
					if (request.game.data.state.score % 10 == 0 && request.game.data.orbs.length < 10) {
						var counts = {
							red: 0,
							blue: 0,
							purple: 0
						}

						for (var o in request.game.data.orbs) {
							counts[request.game.data.orbs[o].color]++
						}

						var orb = main.getSchema("orb")
							orb.color = (counts.red == counts.blue && counts.purple < counts.red - 1) ? "purple" : (counts.red > counts.blue) ? "blue" : (counts.blue > counts.red) ? "red" : orb.color
						request.game.data.orbs.push(orb)
					}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to score game"})
			}
		}

	/* endGame */
		module.exports.endGame = endGame
		function endGame(request, callback) {
			try {
				if (request.game.data.state.end) {
					callback([request.session.id], {success: false, message: "game already ended"})
				}
				else {
					request.game.data.state.end = (new Date().getTime())
					callback(Object.keys(request.game.players), {success: true, message: "game over"})
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to end game"})
			}
		}

/*** position ***/
	/* updatePosition */
		module.exports.updatePosition = updatePosition
		function updatePosition(request, callback) {
			try {
				if (request.post.x === undefined || request.post.y === undefined) {
					callback([request.session.id], {success: false, message: "invalid position"})
				}
				else {
					// paddle
						var color = request.game.players[request.session.id].color
						var paddle = request.game.data.paddles[color]

					// angle
						paddle.angle = main.getPolarFromCartesian(request.post.x, request.post.y).angle

					// coordinates
						var coords = main.getCartesianFromPolar(paddle.angle, paddle.distance)
							paddle.x = coords.x
							paddle.y = coords.y
				}
			}
			catch (error) {
				main.logError(error)
				callback([request.session.id], {success: false, message: "unable to update position"})
			}
		}
