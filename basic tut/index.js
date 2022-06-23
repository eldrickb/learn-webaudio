

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// 1 CONTEXT SETUP

// 1.1 SOURCE

// get the audio element
const audioElement = document.querySelector('audio');

// pass it into the audio context
const track = audioContext.createMediaElementSource(audioElement);


// 1.2 GAIN
const gainNode = audioContext.createGain();

// 1.3 PAN
const pannerOptions = { pan: 0 };
const panner = new StereoPannerNode(audioContext, pannerOptions);

// 1.4 DEST 

// connect to dest
track
    .connect(gainNode)
    .connect(panner)
    .connect(audioContext.destination);

// 2. CONTROLS

// 2.1 PLAY BUTTON

// select our play button
const playButton = document.querySelector('button');
playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audioElement.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
    }

}, false);

// 2.2 GAIN 
const volumeControl = document.querySelector('#volume');
volumeControl.addEventListener('input', function() {
    gainNode.gain.value = this.value;
}, false);

// 2.3 PAN
const pannerControl = document.querySelector('#panner');
pannerControl.addEventListener('input', function() {
    panner.pan.value = this.value;
}, false);