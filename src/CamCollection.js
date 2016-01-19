import Player from './libs/player/Player';

class CamCollection {
    constructor() {
        const src='//d3sporhxbkob1v.cloudfront.net/bill/vod/sample-video/400k.m3u8';
        this.player = new Player({
            src: src,
            canvas: 'vid'
        });
    }

    render() {
        this.player.start();
    }
}

export default CamCollection;