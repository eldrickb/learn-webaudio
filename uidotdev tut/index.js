// take uidotdev and guitr amp tut and make soemteing basic

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const buffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * 1,
    audioContext.sampleRate,
);

const channelData = buffer.getChannelData(0);

for (let i = 0; i < buffer.length; i++) {
    channelData[i] = Math.random() * 2 - 1;
}

// global dest chain

const primDest = audioContext.createGain();
primDest.gain.setValueAtTime(0.05, 0);
primDest.connect(audioContext.destination);

// noise

const noiseButton = document.querySelector(".whiteNoiseButton");

noiseButton.addEventListener("click", () => {
    const whiteNoiseSource = audioContext.createBufferSource();
    whiteNoiseSource.buffer = buffer;
    whiteNoiseSource.connect(primDest);

    whiteNoiseSource.start();
});

// snare

const snareFilter = audioContext.createBiquadFilter();
snareFilter.type = "highpass";
snareFilter.frequency.value = 1500;
snareFilter.connect(primDest);

const snareButton = document.querySelector(".snareButton");

snareButton.addEventListener("click", () => {
    // noise
    const whiteNoiseSource = audioContext.createBufferSource();
    whiteNoiseSource.buffer = buffer;

    // gain that falls off
    const whiteNoiseGain = audioContext.createGain();
    whiteNoiseGain.gain.setValueAtTime(1, audioContext.currentTime);
    whiteNoiseGain.gain.linearRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1,
    );

    whiteNoiseSource.connect(whiteNoiseGain).connect(snareFilter);
    whiteNoiseSource.start();

    // osc behind
    const snareOsc = audioContext.createOscillator();
    snareOsc.type = "triangle";
    snareOsc.frequency.setValueAtTime(250, audioContext.currentTime);

    const oscGain = audioContext.createGain();
    oscGain.gain.setValueAtTime(1, audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15,
    );

    // play
    snareOsc.connect(oscGain).connect(primDest);
    snareOsc.start();
    snareOsc.stop(audioContext.currentTime + 0.2);
});

const hhButton = document.querySelector(".hhButton");

// get high hat

let hhSource = await fetch("./hihat.wav");
hhSource = await hhSource.arrayBuffer();
const hhBuffer = audioContext.createBufferSource();
hhBuffer.buffer = await audioContext.decodeAudioData(hhSource);
hhBuffer.playbackRate.setValueAtTime(2, 0);

// set up hh instrumetn

hhButton.addEventListener("click", () => {
    hhBuffer.connect(primDest);
    hhBuffer.start();
    hhBuffer.stop(audioContext.currentTime + 0.2);
});

// piano

const notes = [
    { name: "C", frequency: 261.63 },
    { name: "C#", frequency: 277.18 },
    { name: "D", frequency: 293.66 },
    { name: "D#", frequency: 311.13 },
    { name: "E", frequency: 329.63 },
    { name: "F", frequency: 349.23 },
    { name: "F#", frequency: 369.99 },
    { name: "G", frequency: 392.0 },
    { name: "G#", frequency: 415.3 },
    { name: "A", frequency: 440.0 },
    { name: "A#", frequency: 466.16 },
    { name: "B", frequency: 493.88 },
    { name: "C", frequency: 523.25 },
];

const notesDiv = document.querySelector(".notesDiv");

notes.forEach(({ name, frequency }) => {
    // create osct
    // set osc to pitch
    // connect
    // play
    // pause

    // create a button
    const button = document.createElement("button");
    button.innerText = name;

    let osc, oscGain;

    // ADSR values
    const playTime = 2;
    const attackTime = 0.2 * playTime;
    const decayTime = 0.3 * playTime;
    const sustainLevel = 0.5;
    const sustainTime = 1 * playTime;
    const releaseTime = 2 * playTime;

    // add event listener
    button.addEventListener("mousedown", () => {
        // create osc
        osc = audioContext.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // create gain node
        oscGain = audioContext.createGain();

        // apply ADSR
        // ? how to test, observe, etc?

        // enter at 0

        let accum = attackTime;
        oscGain.gain.setValueAtTime(0, audioContext.currentTime);
        // ramp attack
        accum += attackTime;
        oscGain.gain.linearRampToValueAtTime(
            1,
            audioContext.currentTime + accum,
        );

        // ramp to sustain
        accum += decayTime;
        oscGain.gain.linearRampToValueAtTime(sustainLevel, accum);

        // stay level thru sustain
        accum += sustainTime;
        oscGain.gain.linearRampToValueAtTime(sustainLevel, accum);

        // ramp of for decay
        accum += decayTime;

        oscGain.gain.linearRampToValueAtTime(0.01, accum);

        // create vibrato
        const vibrato = audioContext.createOscillator();
        vibrato.frequency.setValueAtTime(10, 0);
        const vibratoGain = audioContext.createGain();
        vibratoGain.gain.setValueAtTime(1.5, 0);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start();

        // connect and play
        osc.connect(oscGain);
        oscGain.connect(primDest);
        osc.start();
        osc.stop(audioContext.currentTime + accum);
    });

    // button.addEventListener("mouseup", () => {
    //     console.log("mouse up");

    //     if (osc && oscGain) {
    //         console.log("osc true");
    //         // osc.stop();
    //         oscGain.gain.linearRampToValueAtTime(
    //             0,
    //             audioContext.currentTime + releaseTime,
    //         );

    //         osc.stop(audioContext.currentTime + releaseTime);
    //     }
    // });

    // append button
    notesDiv.appendChild(button);
});

/* 
	make an adsr?
*/
