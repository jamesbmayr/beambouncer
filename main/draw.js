/*** globals ***/
	/* canvas */
		var canvas  = window.canvas  = document.getElementById("canvas")
		var context = window.context = canvas.getContext("2d")

/*** math ***/
	/* getCanvasFromWindow */
		window.getCanvasFromWindow = function(x, y) {
			var rect = canvas.getBoundingClientRect()
			return {
				x: (((x - rect.left) * 1000 / rect.width) - 500),
				y: (((y - rect.top) * 1000 / rect.height) - 500)
			}
		}

/*** canvas tools ***/	
	/* clearCanvas */
		window.clearCanvas = function() {
			context.clearRect(0, 0, canvas.width, canvas.height)
		}

/*** draw ***/
	/* drawLine */
		window.drawLine = function(x1, y1, x2, y2, options) {
			// parameters
				options = options || {}
				context.beginPath()
				context.strokeStyle = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1
				
			// draw
				context.moveTo(x1, canvas.height - y1)
				context.lineTo(x2, canvas.height - y2)
				context.stroke()
		}

	/* drawCircle */
		window.drawCircle = function(x, y, radius, options) {
			// parameters
				options = options || {}
				context.beginPath()
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.strokeStyle = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.lineWidth   = options.border || 1
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1

			// draw
				if (options.border) {
					context.arc(x, canvas.height - y, radius, (options.start || 0), (options.end || (2 * Math.PI)))
					context.stroke()
				}
				else {
					context.moveTo(x, canvas.height - y)
					context.arc(x, canvas.height - y, radius, (options.start || 0), (options.end || (2 * Math.PI)), true)
					context.closePath()
					context.fill()
				}
		}

	/* drawText */
		window.drawText = function(x, y, text, options) {
			// variables
				options = options || {}
				context.font = (options.style ? options.style + " " : "") + (options.size || 32) + "px " + (options.font || "monospace")
				context.fillStyle   = options.gradient ? drawGradient(options) : (options.color || "transparent")
				context.textAlign   = options.alignment || "center"
				context.shadowBlur  = options.blur ? options.blur : 0
				context.shadowColor = options.shadow ? options.shadow : "transparent"
				context.globalAlpha = options.opacity || 1


			// draw
				context.fillText((text || ""), x, canvas.height - y)
		}

	/* drawGradient */
		window.drawGradient = function(options) {
			// radial
				if (options.gradient.r1 || options.gradient.r2) {
					var gradient = context.createRadialGradient(options.gradient.x1, options.gradient.y1, options.gradient.r1, options.gradient.x2, options.gradient.y2, options.gradient.r2)
				}

			// linear
				else {
					var gradient = context.createLinearGradient(options.gradient.x1, canvas.height - options.gradient.y1, options.gradient.x2, canvas.height - options.gradient.y2)
				}

			// colors
				var gradientColors = Object.keys(options.gradient.colors)
				for (var c in gradientColors) {
					gradient.addColorStop(Number(gradientColors[c]), options.gradient.colors[gradientColors[c]])
				}

			return gradient
		}
