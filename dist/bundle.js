/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _CamCollection = __webpack_require__(1);

	var _CamCollection2 = _interopRequireDefault(_CamCollection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var c = new _CamCollection2.default();

	console.log('Rendering cam collection');
	c.render();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _Player = __webpack_require__(2);

	var _Player2 = _interopRequireDefault(_Player);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var CamCollection = function () {
	    function CamCollection() {
	        _classCallCheck(this, CamCollection);

	        var src = '//d3sporhxbkob1v.cloudfront.net/bill/vod/sample-video/400k.m3u8';
	        this.player = new _Player2.default({
	            src: src,
	            canvas: 'vid'
	        });
	    }

	    _createClass(CamCollection, [{
	        key: 'render',
	        value: function render() {
	            this.player.start();
	        }
	    }]);

	    return CamCollection;
	}();

	exports.default = CamCollection;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _URLHelper = __webpack_require__(3);

	var _URLHelper2 = _interopRequireDefault(_URLHelper);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Player = function () {
	    function Player(options) {
	        _classCallCheck(this, Player);

	        this.src = options.src;
	        this.canvas = document.getElementById(options.canvas);
	        this.context = this.canvas.getContext('2d');
	        // requestAnimationFrame polyfill
	        this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || setTimeout;

	        this.urlHelper = new _URLHelper2.default();

	        this.nextIndex = 0;
	        this.sentVideos = 0;
	        this.currentVideo = null;
	        this.videos = [];
	        this.lastOriginal = null;
	    }

	    _createClass(Player, [{
	        key: 'start',
	        value: function start() {
	            this.worker = new Worker('./dist/mpegts/worker.js');
	            this.worker.addEventListener('message', this.workerMessage.bind(this));
	        }
	    }, {
	        key: 'workerMessage',
	        value: function workerMessage(event) {
	            var self = this;
	            var data = event.data,
	                descriptor = '#' + data.index + ': ' + data.original;

	            switch (data.type) {
	                // worker is ready to convert
	                case 'ready':
	                    this.getMore();
	                    return;

	                // got debug message from worker
	                case 'debug':
	                    Function.prototype.apply.call(console[data.action], console, data.args);
	                    return;

	                // got new converted MP4 video data
	                case 'video':
	                    var video = document.createElement('video'),
	                        source = document.createElement('source');
	                    source.type = 'video/mp4';
	                    video.appendChild(source);

	                    video.addEventListener('loadedmetadata', function () {
	                        if (self.canvas.width !== this.videoWidth || self.canvas.height !== this.videoHeight) {
	                            self.canvas.width = this.width = this.videoWidth;
	                            self.canvas.height = this.height = this.videoHeight;
	                        }
	                    });

	                    video.addEventListener('play', function () {
	                        if (self.currentVideo !== this) {
	                            console.log('playing ' + descriptor);
	                            self.currentVideo = this;
	                            self.nextIndex++;
	                            if (self.sentVideos - self.nextIndex <= 1) {
	                                self.getMore();
	                            }
	                        }
	                        self.nextFrame();
	                    });

	                    video.addEventListener('ended', function () {
	                        delete self.videos[self.nextIndex - 1];
	                        if (self.nextIndex in self.videos) {
	                            self.videos[self.nextIndex].play();
	                        }
	                    });
	                    if (video.src.slice(0, 5) === 'blob:') {
	                        video.addEventListener('ended', function () {
	                            URL.revokeObjectURL(this.src);
	                        });
	                    }

	                    video.src = source.src = data.url;
	                    video.load();

	                    (function canplaythrough() {
	                        console.log('converted ' + descriptor);
	                        self.videos[data.index] = this;
	                        if ((!self.currentVideo || self.currentVideo.ended) && data.index === self.nextIndex) {
	                            this.play();
	                        }
	                    }).call(video);

	                    return;
	            }
	        }
	    }, {
	        key: 'nextFrame',

	        // drawing new frame
	        value: function nextFrame() {
	            if (this.currentVideo.paused || this.currentVideo.ended) {
	                return;
	            }
	            this.context.drawImage(this.currentVideo, 0, 0);
	            window.requestAnimationFrame(this.nextFrame.bind(this));
	        }
	    }, {
	        key: 'getMore',

	        // loading more videos from manifest
	        value: function getMore() {
	            var self = this;
	            var ajax = new XMLHttpRequest();
	            ajax.addEventListener('load', function () {
	                var originals = this.responseText.split(/\r?\n/).filter(RegExp.prototype.test.bind(/\.ts$/)).map(self.urlHelper.resolveURL.bind(self.urlHelper, self.src));

	                originals = originals.slice(originals.lastIndexOf(self.lastOriginal) + 1);
	                self.lastOriginal = originals[originals.length - 1];

	                self.worker.postMessage(originals.map(function (url, index) {
	                    return { url: url, index: self.sentVideos + index };
	                }));

	                self.sentVideos += originals.length;

	                console.log('asked for ' + originals.length + ' more videos');
	            });
	            ajax.open('GET', this.src, true);
	            ajax.send();
	        }
	    }]);

	    return Player;
	}();

	exports.default = Player;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var URLHelper = function () {
	    function URLHelper() {
	        _classCallCheck(this, URLHelper);

	        this.doc = document;
	        this.old_base = this.doc.getElementsByTagName('base')[0];
	        this.old_href = this.old_base && this.old_base.href;
	        this.doc_head = this.doc.head || this.doc.getElementsByTagName('head')[0];
	        this.our_base = this.old_base || this.doc.createElement('base');
	        this.resolver = this.doc.createElement('a');
	    }

	    _createClass(URLHelper, [{
	        key: 'resolveURL',
	        value: function resolveURL(base_url, url) {
	            this.old_base || this.doc_head.appendChild(this.our_base);

	            this.our_base.href = base_url;
	            this.resolver.href = url;
	            var resolved_url = this.resolver.href; // browser magic at work here

	            this.old_base ? this.old_base.href = this.old_href : this.doc_head.removeChild(this.our_base);

	            return resolved_url;
	        }
	    }]);

	    return URLHelper;
	}();

	exports.default = URLHelper;

/***/ }
/******/ ]);