
import saw from "./wave-tables/01_Saw.js"
console.log("loaded")

// 1 CONTEXT SETUP

// 1.1 SOURCE
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();


// 1.2 SWEEP

const wave = audioCtx.createPeriodicWave(saw.real, saw.imag);

let sweepLength = 2;
function playSweep(time) {
    // init osc 
    let osc = audioCtx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = 440;

    // sweep gain environment
    let sweepEnv = audioCtx.createGain();
    sweepEnv.gain.cancelScheduledValues(time);
    sweepEnv.gain.setValueAtTime(0, time);
    // set our attack
    sweepEnv.gain.linearRampToValueAtTime(1, time + attackTime);
    // set our release
    sweepEnv.gain.linearRampToValueAtTime(0, time + sweepLength - releaseTime);

    // osc -> env -> dest
    osc.connect(sweepEnv).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + sweepLength);
}

// 1.3 Pulse
let pulseTime = 1;
function playPulse(time) {
    // sine pulse wave 
    let osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = pulseHz;

    // amp env for pulse
    let amp = audioCtx.createGain();
    amp.gain.value = 1;

    // lfo to modulate amp
    let lfo = audioCtx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = lfoHz;

    // connect gain lfo
    lfo.connect(amp.gain);
    // connect osc to amp to dest
    osc.connect(amp).connect(audioCtx.destination);
    lfo.start();
    osc.start(time);
    osc.stop(time + pulseTime);
}

// 2. CONTROLS

// !!! basic adsr attempt 
// 2.1 ATTACK 

let attackTime = 0.2;
const attackControl = document.querySelector('#attack');
attackControl.addEventListener('input', function () {
    attackTime = Number(this.value);
}, false);

// 2.2 RELEASE
let releaseTime = 0.5;
const releaseControl = document.querySelector('#release');
releaseControl.addEventListener('input', function () {
    releaseTime = Number(this.value);
}, false);

// 2.3 pulse
let pulseHz = 880;
const hzControl = document.querySelector('#hz');
hzControl.addEventListener('input', function () {
    pulseHz = Number(this.value);
}, false);

// 2.4 lfo
let lfoHz = 30;
const lfoControl = document.querySelector('#lfo');
lfoControl.addEventListener('input', function () {
    lfoHz = Number(this.value);
}, false);