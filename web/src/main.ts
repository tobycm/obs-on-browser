import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";

// import interact from "interactjs";

// // Make the element draggable
// interact(".draggable").draggable({
//   listeners: {
//     start(event) {
//       console.log("Drag started:", event);
//     },
//     move(event) {
//       const target = event.target as HTMLElement;
//       const x = (parseFloat(target.dataset.x || "0") || 0) + event.dx;
//       const y = (parseFloat(target.dataset.y || "0") || 0) + event.dy;

//       target.style.transform = `translate(${x}px, ${y}px)`;
//       target.dataset.x = x.toString();
//       target.dataset.y = y.toString();
//     },
//     end(event) {
//       console.log("Drag ended:", event);
//     },
//   },
// });

const settings: {
  quality: keyof typeof resolutions;
  fps: number;
} = {
  quality: "720p",
  fps: 30,
};

const resolutions = {
  "240p": { width: 426, height: 240 },
  "360p": { width: 640, height: 360 },
  "480p": { width: 854, height: 480 },
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
  "2160p": { width: 3840, height: 2160 },
};

const streamQualitySelect = document.getElementById("streamQuality") as HTMLSelectElement;

streamQualitySelect.addEventListener("change", (event) => {
  const target = event.target as HTMLSelectElement;
  const quality = target.value as keyof typeof resolutions;

  console.log("Stream quality changed:", quality);

  settings.quality = quality;

  // updateStreamViewport();
});

const streamFpsSelect = document.getElementById("streamFps") as HTMLSelectElement;
streamFpsSelect.addEventListener("change", (event) => {
  const target = event.target as HTMLSelectElement;
  const fps = target.value;

  console.log("Stream FPS changed:", fps);

  settings.fps = parseInt(fps);
});

// const stream = document.getElementById("stream") as HTMLDivElement;

// function updateStreamViewport() {
//   const resolution = resolutions[settings.quality];

//   stream.style.width = `${resolution.width}px`;
//   stream.style.height = `${resolution.height}px`;
// }

streamQualitySelect.dispatchEvent(new Event("change"));

const videoElement = document.getElementById("stream") as HTMLVideoElement;

async function startStream(from: "camera" | "screen") {
  const stream = await navigator.mediaDevices[from === "camera" ? "getUserMedia" : "getDisplayMedia"]({
    video: {
      width: resolutions[settings.quality].width,
      height: resolutions[settings.quality].height,
      frameRate: { ideal: settings.fps },
    },
  });

  videoElement.srcObject = stream;
  videoElement.hidden = false;

  stream.addEventListener("inactive", () => {
    console.log("Stream ended");

    videoElement.srcObject = null;
    videoElement.hidden = true;
  });

  return stream;
}

let stream: MediaStream;

const goLiveButton = document.getElementById("goLive") as HTMLButtonElement;

const startStreamButton = document.getElementById("startStream") as HTMLButtonElement;
const sourceSelect = document.getElementById("streamSource") as HTMLSelectElement;

startStreamButton.addEventListener("click", async (event) => {
  const button = event.target as HTMLButtonElement;

  button.disabled = true;

  if (button.dataset.streaming === "false") {
    const source = sourceSelect.value as "camera" | "screen";

    stream = await startStream(source);

    button.textContent = "Stop Stream 🛑";
    button.dataset.streaming = "true";

    sourceSelect.disabled = true;

    streamQualitySelect.disabled = true;
    streamFpsSelect.disabled = true;

    goLiveButton.disabled = false;
  } else {
    stream.getTracks().forEach((track) => track.stop());

    stream.dispatchEvent(new Event("inactive"));

    button.textContent = "Stream";
    button.dataset.streaming = "false";

    sourceSelect.disabled = false;

    streamQualitySelect.disabled = false;
    streamFpsSelect.disabled = false;

    goLiveButton.disabled = true;
  }

  button.disabled = false;
});

let ws = new WebSocket("ws://localhost:5000");

function connectWs(url = "ws://localhost:5000") {
  ws = new WebSocket(url);

  ws.addEventListener("open", () => {
    console.log("WebSocket opened");
  });

  ws.addEventListener("message", async (event) => {
    console.log("WebSocket message:", event.data);
  });

  ws.addEventListener("close", (event) => {
    console.log("WebSocket closed:", event.code, event.reason);
  });
}

let mediaRecorder: MediaRecorder;

goLiveButton.addEventListener("click", async (event) => {
  const button = event.target as HTMLButtonElement;

  button.disabled = true;

  if (button.dataset.live === "false") {
    connectWs();

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp8",
    });

    mediaRecorder.ondataavailable = (event) => {
      console.log("MediaRecorder data available:", event.data.size);
      if (ws.readyState === WebSocket.OPEN && event.data.size > 0) ws.send(event.data);
    };

    mediaRecorder.start(166.67);

    button.textContent = "End Stream 🛑";
    button.dataset.live = "true";
  } else {
    mediaRecorder.stop();

    ws.close();

    button.textContent = "Go Live 🎥";
    button.dataset.live = "false";
  }

  button.disabled = false;
});
