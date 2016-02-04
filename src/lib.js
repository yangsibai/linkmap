;(function (global) {
    'use strict';
    function convertRelativePositionToAbsolute(elements) {
        elements.forEach(function (el) {
            el.links && el.links.forEach(function (link) {
                link.x = el.x + link.x;
                link.y = el.y + link.y;
            });
        });
    }

    function isSameRow(current, target) {
        return current.y === target.y;
    }

    function isSameColumn(current, target) {
        return current.x === target.x;
    }

    function isHorizontal(line) {
        return line.start.y === line.end.y;
    }

    function defaultStr(val, defau) {
        if (typeof val === 'string') {
            return val;
        }
        return defau;
    }

    function defaultNum(val, defau) {
        if (typeof val === 'number') {
            return val;
        }
        return defau;
    }

    function LinkMap(options) {
        if (!options.context) {
            throw new Error('require a 2d context');
        }
        this.context = options.context;
        this.channelWidth = defaultNum(options.channelWidth, 50);
        this.channelHeight = defaultNum(options.channelHeight, 50);
        this.borderColor = defaultStr(options.borderColor, '#F00');
        this.fillColor = defaultStr(options.fillColor, '');
        this.linkBorderColor = defaultStr(options.linkBorderColor, '#0F0');
        this.linkFillColor = defaultStr(options.linkFillColor, '');
        this.lineColor = defaultStr(options.lineColor, '#00F');
        this.textColor = defaultStr(options.textColor, '#000');
        this.fontSize = defaultNum(options.fontSize, 14);
        this.lineDelta = defaultNum(options.lineDelta, 4);
        this.lineWidth = defaultNum(options.lineWidth, 1);
        this.canvasWidth = options.canvasWidth;
        this.canvasHeight = options.canvasHeight;
    }

    LinkMap.prototype.isRowNeighbor = function (current, target) {
        return current.y === target.y && Math.abs(current.x - target.x) === (current.width + this.channelWidth);
    };

    LinkMap.prototype.isColumnNeighbor = function (current, target) {
        return current.x === target.x && Math.abs(current.y - target.y) === (current.height + this.channelHeight);
    };

    LinkMap.prototype.findIdealPaths = function (current, target, link) {
        var channelHeight, channelWidth, startPoint, endPoint, startPointOnChannel, endPointOnChannel, crossPoint;
        channelWidth = this.channelWidth;
        channelHeight = this.channelHeight;
        if (isSameRow(current, target)) { // same row
            if (this.isRowNeighbor(current, target)) { // neighborhood
                if (current.x < target.x) {
                    startPoint = {
                        x: link.x + link.width,
                        y: link.y + link.height / 2
                    };
                    endPoint = {
                        x: target.x,
                        y: startPoint.y
                    };
                    return [startPoint, endPoint];
                } else {
                    startPoint = {
                        x: link.x,
                        y: link.y + link.height / 2
                    };
                    endPoint = {
                        x: target.x + target.width,
                        y: startPoint.y
                    };
                }
                return [startPoint, endPoint];
            }
            // not neighbor
            startPoint = {
                x: link.x + link.width / 2,
                y: link.y + link.height
            };
            startPointOnChannel = {
                x: startPoint.x,
                y: current.y + current.height + channelHeight / 2
            };
            endPoint = {
                x: target.x + target.width / 2,
                y: target.y + target.height
            };
            endPointOnChannel = {
                x: endPoint.x,
                y: endPoint.y + channelHeight / 2
            };
            return [
                startPoint, startPointOnChannel, endPointOnChannel, endPoint
            ];
        }
        if (isSameColumn(current, target)) { // same column
            if (this.isColumnNeighbor(current, target)) { // neighborhood
                if (current.y < target.y) {
                    startPoint = {
                        x: link.x + link.width / 2,
                        y: link.y + link.height
                    };
                    endPoint = {
                        x: startPoint.x,
                        y: target.y
                    };
                } else {
                    startPoint = {
                        x: link.x + link.width / 2,
                        y: link.y
                    };
                    endPoint = {
                        x: startPoint.x,
                        y: target.y + target.height
                    };
                }
                return [startPoint, endPoint];
            }
            startPoint = {
                x: link.x + link.width,
                y: link.y + link.height / 2
            };
            startPointOnChannel = {
                x: current.x + current.width + channelWidth / 2,
                y: startPoint.y
            };
            endPointOnChannel = {
                x: startPointOnChannel.x,
                y: target.y + target.height / 2
            };
            endPoint = {
                x: target.x + target.width,
                y: target.y + target.height / 2
            };
            return [startPoint, startPointOnChannel, endPointOnChannel, endPoint];
        }
        if (current.x < target.x) {
            startPoint = {
                x: link.x + link.width,
                y: link.y + link.height / 2
            };
            startPointOnChannel = {
                x: current.x + current.width + channelWidth / 2,
                y: startPoint.y
            };
            if (current.y < target.y) {
                endPoint = {
                    x: target.x + target.width / 2,
                    y: target.y
                };
                endPointOnChannel = {
                    x: endPoint.x,
                    y: endPoint.y - channelHeight / 2
                };
            } else {
                endPoint = {
                    x: target.x + target.width / 2,
                    y: target.y + target.height
                };
                endPointOnChannel = {
                    x: endPoint.x,
                    y: endPoint.y + channelHeight / 2
                };
            }
            crossPoint = {
                x: startPointOnChannel.x,
                y: endPointOnChannel.y
            };
            return [startPoint, startPointOnChannel, crossPoint, endPointOnChannel, endPoint];
        } else {
            startPoint = {
                x: link.x,
                y: link.y + link.height / 2
            };
            startPointOnChannel = {
                x: current.x - channelWidth / 2,
                y: startPoint.y
            };
            if (current.y < target.y) {
                endPoint = {
                    x: target.x + target.width / 2,
                    y: target.y
                };
                endPointOnChannel = {
                    x: endPoint.x,
                    y: endPoint.y - channelHeight / 2
                }
            } else {
                endPoint = {
                    x: target.x + target.width / 2,
                    y: target.y + target.height
                };
                endPointOnChannel = {
                    x: endPoint.x,
                    y: endPoint.y + channelHeight / 2
                };
            }
            crossPoint = {
                x: startPointOnChannel.x,
                y: endPointOnChannel.y
            };
            return [startPoint, startPointOnChannel, crossPoint, endPointOnChannel, endPoint];
        }
    };

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var line = '';

        for (var n = 0; n < text.length; n++) {
            var testLine = line + text[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = text[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }

    LinkMap.prototype.drawElement = function (el) {
        var context = this.context;
        context.save();
        if (this.borderColor) {
            context.strokeStyle = this.borderColor;
            context.beginPath();
            context.strokeRect(el.x, el.y, el.width, el.height);
        }

        if (this.fillColor) {
            context.fillStyle = this.fillColor;
            context.fillRect(el.x, el.y, el.width, el.height);
        }

        if (el.name) {
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = this.fontSize + 'pt Calibri';
            context.fillStyle = this.textColor;
            wrapText(this.context, el.name, el.x + el.width / 2, el.y + el.height / 2, el.width * 0.8, parseInt(this.fontSize * 1.2));
        }
        context.restore();
    };

    LinkMap.prototype.drawLink = function (link) {
        var context = this.context;
        context.save();
        context.strokeStyle = this.linkBorderColor;
        context.strokeRect(link.x, link.y, link.width, link.height);

        if (this.linkFillColor) {
            context.fillStyle = this.linkFillColor;
            context.fillRect(link.x, link.y, link.width, link.height);
        }
        context.restore();
    };

    LinkMap.prototype.drawPaths = function (idealPaths, lineColor) {
        var context = this.context;
        context.save();
        if (lineColor) {
            context.strokeStyle = lineColor;
        } else {
            context.strokeStyle = this.lineColor;
        }
        context.lineWidth = this.lineWidth;
        context.beginPath();
        var startPoint = idealPaths[0];
        context.moveTo(startPoint.x, startPoint.y);
        var lastPoint = startPoint;
        var lineDelta = this.lineDelta;
        idealPaths.forEach(function (point, idx) {
            if (idx > 0) {
                context.lineTo(point.x, point.y);
                if (idx === idealPaths.length - 1) {
                    if (point.x === lastPoint.x) {
                        if (point.y < lastPoint.y) {
                            context.lineTo(point.x - lineDelta, point.y + lineDelta);
                            context.moveTo(point.x + lineDelta, point.y + lineDelta);
                        } else {
                            context.lineTo(point.x - lineDelta, point.y - lineDelta);
                            context.moveTo(point.x + lineDelta, point.y - lineDelta);
                        }
                        context.lineTo(point.x, point.y);
                    } else {
                        if (point.x < lastPoint.x) { // left arrow
                            context.lineTo(point.x + lineDelta, point.y - lineDelta);
                            context.moveTo(point.x + lineDelta, point.y + lineDelta);
                        } else {
                            context.lineTo(point.x - lineDelta, point.y - lineDelta);
                            context.moveTo(point.x - lineDelta, point.y + lineDelta);
                        }
                        context.lineTo(point.x, point.y);
                    }
                }
                lastPoint = point;
            }
        });
        context.stroke();
        context.restore();
    };

    /**
     * correct a path
     * @param paths
     * @param takedLines
     * @param lineDelta
     * @returns {*}
     */
    LinkMap.prototype.correctForPath = function (paths, el, link) {
        for (var i = 1; i < paths.length; i++) { // skip first line
            var line = {
                start: paths[i - 1],
                end: paths[i]
            };
            if (i === 1) { // head or tail lines
                if (isHorizontal(line)) {
                    var y = this.findABetterLine('y', line.start.y, parseInt(link.height / 4, 10));
                    paths[i - 1].y = y;
                    paths[i].y = y;
                } else {
                    var x = this.findABetterLine('x', line.start.x, parseInt(link.width / 4, 10));
                    paths[i - 1].x = x;
                    paths[i].x = x;
                }
            } else if (i === paths.length - 1) {
                if (isHorizontal(line)) {
                    var y = this.findABetterLine('y', line.start.y, parseInt(el.height / 4, 10));
                    paths[i - 1].y = y;
                    paths[i].y = y;
                } else {
                    var x = this.findABetterLine('x', line.start.x, parseInt(el.width / 4, 10));
                    paths[i - 1].x = x;
                    paths[i].x = x;
                }
            } else {
                if (isHorizontal(line)) {
                    var y = this.findABetterLine('y', line.start.y, parseInt(this.channelHeight / 4, 10));
                    paths[i - 1].y = y;
                    paths[i].y = y;
                } else {
                    var x = this.findABetterLine('x', line.start.x, parseInt(this.channelWidth / 4, 10));
                    paths[i - 1].x = x;
                    paths[i].x = x;
                }
            }
        }
    };

    LinkMap.prototype.fixALine = function (prop, val) {
        if (this.lines[prop][val]) {
            this.lines[prop][val]++;
            var consult = parseInt(this.lines[prop][val] / 2, 10);
            if (this.lines[prop][val] % 2 === 0) {
                return val + 4 * consult;
            }
            return val - 4 * consult;
        }
        this.lines[prop][val] = 1;
        return val;
    };

    LinkMap.prototype.findABetterLine = function (prop, val, offset) {
        if (!offset || offset < 4) {
            return val;
        }
        if (this.lines[prop][val]) {
            this.lines[prop][val]++;
            if (this.lines[prop][val] % 2 === 0) {
                return this.findABetterLine(prop, val - offset, parseInt(offset / 2, 10));
            }
            return this.findABetterLine(prop, val + offset, parseInt(offset / 2, 10));
        }
        this.lines[prop][val] = 1;
        return val;
    };

    LinkMap.prototype.draw = function (elements) {
        if (!elements || elements.length === 0) {
            return;
        }
        var context = this.context;
        var self = this;
        this.elements = elements;
        this.drawIndex = -1;

        this.lines = {
            x: {},
            y: {}
        };

        convertRelativePositionToAbsolute(elements);

        var pathArray = [];

        elements.forEach(function (el) {
            this.drawElement(el);
            context.lineWidth = 1;
            context.strokeWidth = 1;
            el.links && el.links.forEach(function (link) {
                this.drawLink(link);
                var target = findInArray(elements, function (item) {
                    return item.id === link.target;
                });
                if (target) {
                    (function () {
                        var idealPaths = self.findIdealPaths(el, target, link);
                        self.correctForPath(idealPaths, el, link);
                        pathArray.push({
                            lineColor: el.lineColor,
                            paths: idealPaths
                        });
                    }());
                }
            }.bind(this));
        }.bind(this));
        pathArray.forEach(function (item) {
            self.drawPaths(item.paths, item.lineColor);
        });
        this.paths = pathArray;
    };

    LinkMap.prototype.drawNext = function () {
        if (this.drawIndex === this.paths.length - 1) {
            return;
        }
        this.drawIndex = this.drawIndex + 1;
        for (var i = 0; i <= this.drawIndex; i++) {
            this.drawPaths(this.paths[i].paths, this.paths[i].lineColor);
        }
    };

    LinkMap.prototype.drawPrevious = function () {
        var drawIndexCache = this.drawIndex;
        if (drawIndexCache === -1) {
            return;
        }
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.draw(this.elements);
        this.drawIndex = drawIndexCache;
        this.drawIndex = this.drawIndex - 1;
        for (var i = 0; i <= this.drawIndex; i++) {
            this.drawPaths(this.paths[i].paths, this.paths[i].lineColor);
        }
    };

    function findInArray(arr, cb) {
        for (var i = 0; i < arr.length; i++) {
            if (cb(arr[i])) return arr[i];
        }
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LinkMap;
    } else {
        global.LinkMap = LinkMap;
    }
}(this));
