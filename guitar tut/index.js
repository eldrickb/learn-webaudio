const volume = document.getElementById("volume");
const bass = document.getElementById("bass");
const mid = document.getElementById("mid");
const treble = document.getElementById("treble");
const visualizer = document.getElementById("visualizer");

const context = new AudioContext();
// !!! analyzer node
const analyserNode = new AnalyserNode(context, {
    fftSize: 256,
});

const gainNode = new GainNode(context, { gain: volume.value });
const bassEq = new BiquadFilterNode(context, {
    type: "lowshelf",
    frequency: 500,
    gain: bass.value,
});
const midEq = new BiquadFilterNode(context, {
    type: "peaking",
    Q: Math.sqrt(1 / 2),
    frequency: 1500,
    gain: bass.value,
});
const trebleEq = new BiquadFilterNode(context, {
    type: "highshelf",
    frequency: 3000,
    gain: treble.value,
});

function setupEventListeners() {
    window.addEventListener("resize", resize);

    volume.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        gainNode.gain.setTargetAtTime(value, context.currentTime, 0.01);
    });
    bass.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        bassEq.gain.setTargetAtTime(value, context.currentTime, 0.01);
    });
    mid.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        midEq.gain.setTargetAtTime(value, context.currentTime, 0.01);
    });
    treble.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        trebleEq.gain.setTargetAtTime(value, context.currentTime, 0.01);
    });
}

async function setupContext() {
    const guitar = await getGuitar();

    if (context.state === "suspended") {
        await context.resume();
    }
    const source = context.createMediaStreamSource(guitar);
    source
        .connect(bassEq)
        .connect(midEq)
        .connect(trebleEq)
        .connect(gainNode)
        .connect(analyserNode)
        .connect(context.destination);
}

function getGuitar() {
    // !!! media
    // Navigator gets user media.
    // Settings disable mic processing features in favor of raw output
    return navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 0,
        },
    });
}

function drawVisualizer() {
    // !!! visualizer
    // !!! using web canvas to draw it
    requestAnimationFrame(drawVisualizer);

    // Take input as data array
    // get length
    const bufferLength = analyserNode.frequencyBinCount;

    // clear canvas

    const width = visualizer.width,
        height = visualizer.height,
        barWidth = width / bufferLength;

    const canvasContext = visualizer.getContext("2d");
    canvasContext.clearRect(0, 0, width, height);

    // save buffer as data
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    console.log(dataArray);

    dataArray.forEach((item, index) => {
        const y = ((item / 255) * height) / 2;
        const x = barWidth * index;

        canvasContext.fillStyle = `hsl(${(y / height) * 2 * 200}, 100%, 50%)`;
        canvasContext.fillRect(x, height - y, barWidth, y);
    });
}

function resize() {
    visualizer.width = visualizer.clientWidth * window.devicePixelRatio;
    visualizer.height = visualizer.clientHeight * window.devicePixelRatio;
}

setupContext();
drawVisualizer();
setupEventListeners();
resize();
