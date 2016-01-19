import URLHelper from './URLHelper';

class Player {

    constructor(options) {
        this.src = options.src;
        this.canvas = document.getElementById(options.canvas);
        this.context = this.canvas.getContext('2d');
        // requestAnimationFrame polyfill
        this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || setTimeout;

        this.urlHelper = new URLHelper();

        this.nextIndex = 0;
        this.sentVideos = 0;
        this.currentVideo = null;
        this.videos = [];
        this.lastOriginal = null;
    }

    start() {
        this.worker = new Worker('./dist/mpegts/worker.js');
        this.worker.addEventListener('message', this.workerMessage.bind(this));
    }

    workerMessage(event) {
        const self = this;
        let data = event.data, descriptor = '#' + data.index + ': ' + data.original;

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
                var video = document.createElement('video'), source = document.createElement('source');
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
    };


    // drawing new frame
    nextFrame() {
        if (this.currentVideo.paused || this.currentVideo.ended) {
            return;
        }
        this.context.drawImage(this.currentVideo, 0, 0);
        window.requestAnimationFrame(this.nextFrame.bind(this));
    };

    // loading more videos from manifest
    getMore() {
        var self = this;
        var ajax = new XMLHttpRequest();
        ajax.addEventListener('load', function () {
            var originals =
                this.responseText
                    .split(/\r?\n/)
                    .filter(RegExp.prototype.test.bind(/\.ts$/))
                    .map(self.urlHelper.resolveURL.bind(self.urlHelper, self.src));

            originals = originals.slice(originals.lastIndexOf(self.lastOriginal) + 1);
            self.lastOriginal = originals[originals.length - 1];

            self.worker.postMessage(originals.map(function (url, index) {
                return {url: url, index: self.sentVideos + index};
            }));

            self.sentVideos += originals.length;

            console.log('asked for ' + originals.length + ' more videos');
        });
        ajax.open('GET', this.src, true);
        ajax.send();
    }

}

export default Player;