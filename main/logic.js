/*** modules ***/
	var http       = require("http")
	var fs         = require("fs")
	var debug      = getEnvironment("debug")
	module.exports = {}

/*** logs ***/
	/* logError */
		module.exports.logError = logError
		function logError(error) {
			if (debug) {
				console.log("\n*** ERROR @ " + new Date().toLocaleString() + " ***")
				console.log(" - " + error)
				console.dir(arguments)
			}
		}

	/* logStatus */
		module.exports.logStatus = logStatus
		function logStatus(status) {
			if (debug) {
				console.log("\n--- STATUS @ " + new Date().toLocaleString() + " ---")
				console.log(" - " + status)

			}
		}

	/* logMessage */
		module.exports.logMessage = logMessage
		function logMessage(message) {
			if (debug) {
				console.log(" - " + new Date().toLocaleString() + ": " + message)
			}
		}

	/* logTime */
		module.exports.logTime = logTime
		function logTime(flag, callback) {
			if (debug) {
				var before = process.hrtime()
				callback()
				
				var after = process.hrtime(before)[1] / 1e6
				if (after > 5) {
					logMessage(flag + " " + after)
				}
			}
			else {
				callback()
			}
		}

/*** maps ***/
	/* getEnvironment */
		module.exports.getEnvironment = getEnvironment
		function getEnvironment(index) {
			try {
				if (process.env.DOMAIN !== undefined) {
					var environment = {
						port:   process.env.PORT,
						domain: process.env.DOMAIN,
						debug:  (process.env.DEBUG || false)
					}
				}
				else {
					var environment = {
						port:   3000,
						domain: "localhost",
						debug:  true
					}
				}

				return environment[index]
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getAsset */
		module.exports.getAsset = getAsset
		function getAsset(index) {
			try {
				switch (index) {
					case "logo":
						return "logo.png"
					break
					case "meta":
						return '<meta charset="UTF-8"/>\
								<meta name="description" content="beambouncer is a 2-player co-op radial pong game."/>\
								<meta name="keywords" content="game,pong,laser,co-op,multiplayer,arcade,paddle,beam"/>\
								<meta name="author" content="James Mayr"/>\
								<meta property="og:title" content="beambouncer: a 2-player co-op radial pong game"/>\
								<meta property="og:url" content="https://beambouncer.onrender.com"/>\
								<meta property="og:description" content="beambouncer is a 2-player co-op radial pong game."/>\
								<meta property="og:image" content="https://beambouncer.onrender.com/logo.png"/>\
								<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>'
					break

					default:
						return null
					break
				}
			}
			catch (error) {logError(error)}
		}

	/* getSchema */
		module.exports.getSchema = getSchema
		function getSchema(index) {
			try {
				switch (index) {
					case "game":
						return {
							id: null,
							created: (new Date().getTime()),
							data: {
								state: {
									start:    null,
									end:      null,
									score:    0,
									rotation: 0
								},
								paddles:  {},
								beams:    [],
								orbs:     [],
							},
							players: {},
							loop:    null
						}
					break

					case "player":
						return {
							id:         null,
							created:    (new Date().getTime()),
							color:      null,
							ready: 		false,
							connected:  false,
							connection: null
						}
					break

					case "paddle":
						return {
							radius:   100,
							color:    null,
							angle:    null,
							distance: 500,
							x:        null,
							y:        null
						}
					break

					case "beam":
						var v = 10
						var a = Math.floor(Math.random() * 360)
						
						return {
							radius: 10,
							color: chooseRandom(["red","blue"]),
							angle: a,
							distance: 0,
							x:  null,
							y:  null,
							vx: v * Math.cos(getRadiansFromDegrees(a)),
							vy: v * Math.sin(getRadiansFromDegrees(a)),
							tx: null,
							ty: null
						}
					break

					case "orb":
						return {
							radius: 50,
							color: chooseRandom(["red","blue"]),
							distance: 100,
							x: null,
							y: null
						}
					break

					default:
						return null
					break
				}
			}
			catch (error) {logError(error)}
		}

/*** checks ***/
	/* isNumLet */
		module.exports.isNumLet = isNumLet
		function isNumLet(string) {
			try {
				return (/^[a-z0-9A-Z_\s]+$/).test(string)
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* isBot */
		module.exports.isBot = isBot
		function isBot(agent) {
			try {
				switch (true) {
					case (typeof agent == "undefined" || !agent):
						return "no-agent"
					break
					
					case (agent.indexOf("Googlebot") !== -1):
						return "Googlebot"
					break
				
					case (agent.indexOf("Google Domains") !== -1):
						return "Google Domains"
					break
				
					case (agent.indexOf("Google Favicon") !== -1):
						return "Google Favicon"
					break
				
					case (agent.indexOf("https://developers.google.com/+/web/snippet/") !== -1):
						return "Google+ Snippet"
					break
				
					case (agent.indexOf("IDBot") !== -1):
						return "IDBot"
					break
				
					case (agent.indexOf("Baiduspider") !== -1):
						return "Baiduspider"
					break
				
					case (agent.indexOf("facebook") !== -1):
						return "Facebook"
					break

					case (agent.indexOf("bingbot") !== -1):
						return "BingBot"
					break

					case (agent.indexOf("YandexBot") !== -1):
						return "YandexBot"
					break

					default:
						return null
					break
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** math ***/
	/* getDistance */
		module.exports.getDistance = getDistance
		function getDistance(x1, y1, x2, y2) {
			try {
				return Math.floor(Math.pow(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 0.5))
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getAngle */
		module.exports.getAngle = getAngle
		function getAngle(x1, y1, x2, y2) {
			try {
				return getMinimumAngle(getDegreesFromRadians(Math.atan2(y2 - y1, x2 - x1)))
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getMinimumAngle */
		module.exports.getMinimumAngle = getMinimumAngle
		function getMinimumAngle(angle) {
			try {
				return (angle + 360) % 360
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getRadiansFromDegrees */
		module.exports.getRadiansFromDegrees = getRadiansFromDegrees
		function getRadiansFromDegrees(degrees) {
			try {
				return (degrees * Math.PI / 180)
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getDegreesFromRadians */
		module.exports.getDegreesFromRadians = getDegreesFromRadians
		function getDegreesFromRadians(radians) {
			try {
				return getMinimumAngle(radians * 180 / Math.PI)
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getCartesianFromPolar */
		module.exports.getCartesianFromPolar = getCartesianFromPolar
		function getCartesianFromPolar(angle, distance) {
			try {
				return {
					x: distance * Math.cos(getRadiansFromDegrees(angle)),
					y: distance * Math.sin(getRadiansFromDegrees(angle))
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getPolarFromCartesian */
		module.exports.getPolarFromCartesian = getPolarFromCartesian
		function getPolarFromCartesian(x, y) {
			try {
				return {
					angle: getMinimumAngle(getDegreesFromRadians(Math.atan2(y, x))),
					distance: Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5)
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** tools ***/		
	/* renderHTML */
		module.exports.renderHTML = renderHTML
		function renderHTML(request, path, callback) {
			try {
				var html = {}
				fs.readFile(path, "utf8", function (error, file) {
					if (error) {
						logError(error)
						callback("")
					}
					else {
						html.original = file
						html.array = html.original.split(/<script\snode>|<\/script>node>/gi)

						for (html.count = 1; html.count < html.array.length; html.count += 2) {
							try {
								html.temp = eval(html.array[html.count])
							}
							catch (error) {
								html.temp = ""
								logError("<sn>" + Math.ceil(html.count / 2) + "</sn>\n" + error)
							}
							html.array[html.count] = html.temp
						}

						callback(html.array.join(""))
					}
				})
			}
			catch (error) {
				logError(error)
				callback("")
			}
		}

/*** randoms ***/
	/* generateRandom */
		module.exports.generateRandom = generateRandom
		function generateRandom(set, length) {
			try {
				set = set || "0123456789abcdefghijklmnopqrstuvwxyz"
				length = length || 32
				
				var output = ""
				for (var i = 0; i < length; i++) {
					output += (set[Math.floor(Math.random() * set.length)])
				}

				if ((/[a-zA-Z]/).test(set)) {
					while (!(/[a-zA-Z]/).test(output[0])) {
						output = (set[Math.floor(Math.random() * set.length)]) + output.substring(1)
					}
				}

				return output
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* chooseRandom */
		module.exports.chooseRandom = chooseRandom
		function chooseRandom(options) {
			try {
				if (!Array.isArray(options)) {
					return false
				}
				else {
					return options[Math.floor(Math.random() * options.length)]
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** database ***/
	/* determineSession */
		module.exports.determineSession = determineSession
		function determineSession(request, callback) {
			try {
				if (isBot(request.headers["user-agent"])) {
					request.session = null
				}
				else if (!request.cookie.session || request.cookie.session == null || request.cookie.session == 0) {
					request.session = {
						id: generateRandom(),
						updated: new Date().getTime(),
						info: {
							"ip":         request.ip,
				 			"user-agent": request.headers["user-agent"],
				 			"language":   request.headers["accept-language"],
						}
					}
				}
				else {
					request.session = {
						id: request.cookie.session,
						updated: new Date().getTime(),
						info: {
							"ip":         request.ip,
				 			"user-agent": request.headers["user-agent"],
				 			"language":   request.headers["accept-language"],
						}
					}
				}

				callback()
			}
			catch (error) {
				logError(error)
				callback(false)
			}
		}
