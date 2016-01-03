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

    function convertPathsToLines(paths) {
        var lines = [];
        for (var i = 1; i < paths.length; i++) {
            lines.push({
                start: paths[i - 1],
                end: paths[i]
            });
        }
        return lines;
    }

    function isHorizontal(line) {
        return line.start.y === line.end.y;
    }

    function isCoincide(line, takedLine) {
        if (isHorizontal(line)) {
            if (isHorizontal(takedLine)) {
                if (line.start.y === takedLine.start.y) {
                    return true; // TODO: fix this
                }
            }
        }
        if (!isHorizontal(takedLine)) {
            if (line.start.x === takedLine.start.x) {
                return true;
            }
        }
        return false;
    }

    function correctForPath(paths, takedLines) {
        for (var i = 1; i < paths.length; i++) {
            var line = {
                start: paths[i - 1],
                end: paths[i]
            };
            for (var j = 0; j < takedLines.length; j++) {
                var takedLine = takedLines[j];
                if (isCoincide(line, takedLine)) {
                    if (isHorizontal(line)) {
                        paths[i - 1].y -= 4;
                        paths[i].y -= 4;
                    } else {
                        paths[i - 1].x -= 4;
                        paths[i].x -= 4;
                    }
                }
            }
        }
        return paths;
    }

    function LinkMap(options) {
        this.context = options.context;
        this.channelWidth = options.channelWidth;
        this.channelHeight = options.channelHeight;
        this.borderColor = options.borderColor || '#F00';
        this.fillColor = options.fillColor || '';
        this.linkBorderColor = options.linkBorderColor || '#0F0';
        this.linkFillColor = options.linkFillColor || '';
        this.lineColor = options.lineColor || '#00F';
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

    LinkMap.prototype.drawElement = function (el) {
        var context = this.context;
        context.save();
        context.strokeStyle = this.borderColor;
        context.beginPath();
        context.strokeRect(el.x, el.y, el.width, el.height);

        if (this.fillColor) {
            context.fillStyle = this.fillColor;
            context.fillRect(el.x, el.y, el.width, el.height);
        }

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(el.name || el.id, el.x + el.width / 2, el.y + el.height / 2);
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

    LinkMap.prototype.drawPaths = function (idealPaths) {
        var context = this.context;
        context.save();
        context.strokeStyle = this.lineColor;
        context.beginPath();
        var startPoint = idealPaths[0];
        context.moveTo(startPoint.x, startPoint.y);
        var lastPoint = startPoint;
        idealPaths.forEach(function (point, idx) {
            if (idx > 0) {
                context.lineTo(point.x, point.y);
                if (idx === idealPaths.length - 1) {
                    if (point.x === lastPoint.x) {
                        if (point.y < lastPoint.y) {
                            context.lineTo(point.x - 4, point.y + 4);
                            context.moveTo(point.x + 4, point.y + 4);
                        } else {
                            context.lineTo(point.x - 4, point.y - 4);
                            context.moveTo(point.x + 4, point.y - 4);
                        }
                        context.lineTo(point.x, point.y);
                    } else {
                        if (point.x < lastPoint.x) { // left arrow
                            context.lineTo(point.x + 4, point.y - 4);
                            context.moveTo(point.x + 4, point.y + 4);
                        } else {
                            context.lineTo(point.x - 4, point.y - 4);
                            context.moveTo(point.x - 4, point.y + 4);
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

    LinkMap.prototype.draw = function (elements) {
        var context = this.context;
        var takeUpLines = [];

        convertRelativePositionToAbsolute(elements);

        function correctPaths(paths) {
            if (takeUpLines.length == 0) {
                takeUpLines.push(convertPathsToLines(paths));
                return paths;
            }
            for (var i = 0; i < takeUpLines.length; i++) {
                paths = correctForPath(paths, takeUpLines[i]);
            }
            takeUpLines.push(convertPathsToLines(paths));
            return paths;
        }

        elements.forEach(function (el) {
            this.drawElement(el);
            context.lineWidth = 1;
            context.strokeWidth = 1;
            el.links && el.links.forEach(function (link) {
                this.drawLink(link);
                var target = elements.find(function (item) {
                    return item.id === link.target;
                });
                if (target) {
                    var idealPaths = this.findIdealPaths(el, target, link);
                    var paths = correctPaths(idealPaths);
                    this.drawPaths(paths);
                }
            }.bind(this));
        }.bind(this));
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LinkMap;
    } else {
        global.LinkMap = LinkMap;
    }
}(this));
