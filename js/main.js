//Global functions
window.random = function (max, min) {
    if(min === undefined)
        min = 0;
    return Math.random() * (max - min) + min;
};

window.clamp = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
};

window.mobilecheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

var images = [];
window.preload = function(urls) {
    for (var i = 0; i < urls.length; i++) {
        images[i] = new Image();
        images[i].src = urls[i];
    }
}

//World Generation LandPage
const World = {

    create: function() {


        const BLOCK_SIZE = mobilecheck()? 5 : 2;
        const windowFactor = function() {
            return window.innerHeight / window.innerWidth;
        };
        const MAX_TERRAIN_HEIGHT = windowFactor() * 40 / BLOCK_SIZE;
        const START_TERRAIN_HEIGHT = windowFactor() * 20 / BLOCK_SIZE;
        const MIN_TERRAIN_HEIGHT = 2;

        const Block = function(x, y) {

            const place = function(n) {
                return (n * BLOCK_SIZE) + "vw";
            };

            let element = $('<div />', {
                class: 'block',
            })
            .css('width', BLOCK_SIZE+'vw')
            .css('height', BLOCK_SIZE+'vw')
            .css('bottom', place(y))
            .css('left', place(x));


            this.x = x;
            this.y = y;

            this.getElement = function() {
                return element;
            };

            this.fall = function(delay) {
                element.addClass('falling-block');
                element.css('animation-delay', delay + 's');
            };

            this.setSurfaceBlock = function() {
                element.addClass('surface-block');
            }

            this.setType = function(type) {
                element.addClass(type+'-block');
            }

        };

        const TerrainGenerator = function(start, min, max) {

            this.currentHeight = start;
            this.minHeight = min;
            this.maxHeight = max;

            this.col = 0;
            this.perlin = new SimplexNoise();

            this.getNextHeight = function(softness, amplitude) {
                this.col += softness;
                const offset = this.perlin.noise(this.col, 0) * amplitude;
                this.currentHeight = clamp(offset + this.currentHeight, this.minHeight, this.maxHeight);
                return this.currentHeight;
            }

        };

        let elements = [];

        let terrainGenerator = new TerrainGenerator(START_TERRAIN_HEIGHT, MIN_TERRAIN_HEIGHT, MAX_TERRAIN_HEIGHT);
        let rockGenerator = new TerrainGenerator(START_TERRAIN_HEIGHT / 2, MIN_TERRAIN_HEIGHT, MAX_TERRAIN_HEIGHT / 2);
        for(let col = 0; col < 100/BLOCK_SIZE; col++) {

            const currentHeight = Math.floor(terrainGenerator.getNextHeight(0.2, 2));
            const currentRockHeight = Math.floor(rockGenerator.getNextHeight(0.5, 2));

            for(let h = 0; h < currentHeight; h++) {
                let block = new Block(col, h);
                block.fall(col * 0.2
                    + h * 0.3
                    + Math.random() * 0.2);

                if(h == currentHeight - 1)
                    block.setSurfaceBlock()

                if(h < currentHeight- currentRockHeight)
                    block.setType("rock");

                elements.push(block.getElement());
            }

        }

        return elements;

    }

};

$(function() {
    $("#start_section").append(new World.create());
});

//Select Jam Vue
var app = new Vue({
    el: '#jams',

    data: {
        jams: [
            {
                title: "Muppet",
                jam: "Audio Game Jam 3",
                img: "https://m.gjcdn.net/game-header/800/374683-crop0_27_2000_527-fxrzdemd-v3.jpg",
                description: "Tu misión es encontrar los juguetes que te han encargado en tu reunión tuppersex",
                url: "https://gamejolt.com/games/muppet/374683"
            },
            {
                title: "Mad Chicken",
                jam: "Island Jam 3",
                img: "img/game%20jam.jpg",
                description: "Shooter de pollos en una carrera en silla de ruedas",
                url: "https://equipo-10.itch.io/mad-chickenx"
            },
            {
                title: "Ulsen",
                jam: "Global Game Jam 2018",
                img: "https://ggj.s3.amazonaws.com/styles/feature_image__normal/games/screenshots/screenshot_001_0.png?itok=2hF4SK8b&timestamp=1517158398",
                description: "Desencripta el mensaje para poder decidir a que planeta ir",
                url: "https://globalgamejam.org/2018/games/ulsen"
            },
            {
                title: "Die Or Run",
                jam: "Island Jam 2",
                img: "https://lh5.googleusercontent.com/XgwWHGRA3sc-eIIukACxcREUiSW-trRDmJQ-_yQr4FsZgWQvJvHS6-1GECYnsenC_Z-QjBeDwiC2jCjHxsPuYFh8OAiNNQRLh37jyiMSlR1fPzx7UfxAeE8CgmFyfo9pnl7ATPgn",
                description: "Es un Runner de scroll lateral con moraleja, lo que lo convierte en un runner no al uso. No promete nada y sin embargo ofrece un disfrutable buen rato. ",
                url: "https://xirzag.itch.io/dor-die-or-run"
            },
            {
                title: "Jamer Jump",
                jam: "Island Jam",
                img: "https://img.itch.zone/aW1hZ2UvMTcxMzY1Lzc5NjU0MC5wbmc=/347x500/WQKo2d.png",
                description: "Protege tu ordenador de las oleadas de bugs para terminar la Jam en este juego de plataformas.",
                url: "https://xirzag.itch.io/jamer-jump"
            },
            {
                title: "Blues Mobile Last Mission",
                jam: "Movie Game Jam",
                img: "https://img.itch.zone/aW1nLzEwNjA3NjcucG5n/original/Iaa0gU.png",
                description: "Evita que los policias destruyan tu bluesmovil antes de alcanzar la meta",
                url: "https://xirzag.itch.io/blues-mobile-last-mission"
            },
            {
                title: "Moving Platforms",
                jam: "Game Maker's Toolkit Jam",
                img: "https://img.itch.zone/aW1hZ2UvMTU5NjA1LzczMjAwNS5wbmc=/347x500/hVBOl9.png",
                description: "Pequeño juego de plataformas donde puedes mover las propias plataformas. No pude terminarlo del todo.",
                url: "https://xirzag.itch.io/moving-platforms"
            },
        ],
        index: 0
    },
    computed:{
        game: function() {
            preload(this.jams.map(function(e) { return e.img; }));
            return this.jams[this.index];
        }
    },
    methods: {
        selectJam: function(offset) {
            this.index = (this.index + offset);
            if(this.index < 0)
                this.index = this.index % this.jams.length + this.jams.length;
            else if(this.index >= this.jams.length)
                this.index = this.index % this.jams.length;

            this.game = this.jams[this.index];
        }
    }
})


//Back
$(function() {
    var config = {
        type: Phaser.AUTO,
        width: $("#jams").width(),
        height:  $("#jams").height(),
        /*backgroundColor: '#000000',*/
        transparent: true,
        backgroundColor: 'rgba(0,0,0,0)',
        parent: 'phaser-bg',
        scene: {
            create: create,
            update: update
        }
    };

    var graphics;

    var game = new Phaser.Game(config);


    function create() {
        graphics = this.add.graphics();
        window.addEventListener('resize', () => {
            game.resize($("#jams").width(), $("#jams").height());
        });
    }

    function update() {
        let dim = {width: this.sys.game.config.width, height: this.sys.game.config.height};
        let color = 0x6666FF;

        graphics.clear();
        graphics.lineStyle(2, color, 1.0);


        //Horizontal lines
        let horizontalLines = 15;
        let h;
        for(var i = 0; i < horizontalLines; i++) {
            graphics.beginPath();
            let time = (this.time.now * 0.005) % 1;
            //let time = 0;
            h = dim.height / 2.0 + dim.height / (2.0 * (i + 2 - time));
            graphics.moveTo(0, h);
            graphics.lineTo(dim.width, h);
            graphics.closePath();
            graphics.strokePath();
        }

        //Vertical lines
        let verticalLines = 20;
        for(var i = 0; i < verticalLines; i++) {
            let perspectiveFactor = 5;
            let offsetAmplitude = 0.1;
            let offsetSlowness= 0.002;

            graphics.beginPath();
            let x1 = i / (verticalLines - 1) * dim.width;
            graphics.moveTo(x1, h);
            let offset = Math.sin(this.time.now * offsetSlowness) * offsetAmplitude;
            let x = (i / (verticalLines - 1) - 1 / (2.6 - offset))  * dim.width * perspectiveFactor;
            graphics.lineTo(x, dim.height);
            graphics.closePath();
            graphics.strokePath();
        }

    }

});