window.onhashchange = function() {
    window.location.reload();
};

let archive_location = window.location.hash.substring(1);
let domParser = new DOMParser();

function buttonHandlerMidiJSNet() {
    let url = `https://cors.archive.org/cors/${archive_location}/${this.dataset.filename}`;
    MIDI.Player.stop();
    MIDIjs.play(url);
}

const SOUNDFONT_CACHE = new Map();

const SOUNDFONT_MAPPING = {
    "Fluid": "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
    "Musyng Kite": "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/",
    "FatBoy": "https://gleitz.github.io/midi-js-soundfonts/FatBoy/"
};

async function buttonHandlerMidiJSSoundfont() {
    let url = `https://cors.archive.org/cors/${archive_location}/${this.dataset.filename}`;
    MIDIjs.stop();
    let soundfont = this.dataset.soundfont;
    MIDI.Soundfont = SOUNDFONT_CACHE.get(soundfont) || {};
    MIDI.soundfontUrl = soundfont;
    SOUNDFONT_CACHE.set(soundfont, MIDI.Soundfont);
    await new Promise((resolve, reject) => MIDI.Player.loadFile(url, resolve, x => x, reject));
    let instruments = MIDI.Player.getFileInstruments();
    await new Promise((resolve, reject) => MIDI.loadPlugin({instruments: instruments, onsuccess: resolve, onerror: reject}));
    MIDI.Player.start();

}

document.querySelector("#stop").addEventListener("click", function() {
    MIDIjs.stop();
});

(async function() {
    if(!archive_location) return;
    
    
    let filesDocument = await fetch(`https://cors.archive.org/cors/${archive_location}/${archive_location}_files.xml`)
                                .then(resp => resp.text())
                                .then(xml => domParser.parseFromString(xml, "text/xml"));
    let files = filesDocument.querySelectorAll("file[source='original']");
    let songsElement = document.querySelector("#songs");
    files.forEach(file => {
        let formatNode = file.querySelector("format");
        if(!formatNode || !formatNode.textContent || formatNode.textContent !== "MIDI") return;

        let filename = file.getAttribute("name");

        let li = document.createElement("li");
        li.textContent = `${filename}: `;


        let button = document.createElement("button");

        button.textContent = "midijs.net";
        button.dataset.filename = filename;
        button.addEventListener("click", buttonHandlerMidiJSNet);
        li.append(button);

        for(let [name, url] of Object.entries(SOUNDFONT_MAPPING)) {
            let button = document.createElement("button");
            button.textContent = name;
            button.dataset.filename = filename;
            button.dataset.soundfont = url;
            button.addEventListener("click", buttonHandlerMidiJSSoundfont);
            li.append(button);
        }

        songsElement.append(li);
    });
})();
