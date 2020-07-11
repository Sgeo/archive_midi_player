window.onhashchange = function() {
    window.location.reload();
};

let archive_location = window.location.hash.substring(1);
let domParser = new DOMParser();

function buttonHandler() {
    let url = `https://cors.archive.org/cors/${archive_location}/${this.dataset.filename}`;
    MIDIjs.play(url);
}

document.querySelector("#stop").addEventListener("click", function() {
    MIDIjs.stop();
});

(async function() {
    
    
    
    let filesDocument = await fetch(`https://cors.archive.org/cors/${archive_location}/${archive_location}_files.xml`)
                                .then(resp => resp.text())
                                .then(xml => domParser.parseFromString(xml, "text/xml"));
    let files = filesDocument.querySelectorAll("file[source='original']");
    let songsElement = document.querySelector("#songs");
    files.forEach(file => {
        let filename = file.getAttribute("name");

        let li = document.createElement("li");
        let button = document.createElement("button");

        button.textContent = filename;
        button.dataset.filename = filename;
        button.addEventListener("click", buttonHandler);

        li.append(button);
        songsElement.append(li);
    });
})();