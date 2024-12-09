import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";

import * as v from "valibot";
import { StartFFmpeg } from "../../server/schemas";
import { mimeType as bestMimeType, parseCodec } from "./mime";
import { settings } from "./settings";
import { getStreamKey } from "./streamKey";
import { getWs, setWs, TobyWebSocketAsync } from "./ws";

const videoElement = document.getElementById("stream") as HTMLVideoElement;

async function startSource(from: "camera" | "screen" | "mic"): Promise<MediaStream> {
  const options: Parameters<typeof navigator.mediaDevices.getDisplayMedia>[0] = {
    video: {
      ...settings.quality,
      frameRate: {
        // min: settings.fps * 0.9,
        ideal: settings.fps * 1.1,
      },
    },
    audio: {
      channelCount: 2,
      sampleRate: { ideal: 48000 },
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
    },
  };

  console.log("Starting source:", from, options);

  if (from === "mic") options.video = false;
  if (from === "camera") options.audio = false;

  let stream: MediaStream;
  if (from === "screen") stream = await navigator.mediaDevices.getDisplayMedia(options);
  else stream = await navigator.mediaDevices.getUserMedia(options);

  if (from !== "camera" && from !== "screen") return stream;

  videoElement.srcObject = stream;
  videoElement.hidden = false;

  stream.addEventListener("inactive", () => {
    videoElement.srcObject = null;
    videoElement.hidden = true;
  });

  return stream;
}

let video: MediaStream;
// const audioContext = new AudioContext();
// const audio = audioContext.createMediaStreamDestination();
let audio: MediaStream;

const goLiveButton = document.getElementById("goLive") as HTMLButtonElement;

const addSourceButton = document.getElementById("addSource") as HTMLButtonElement;
const sourceSelect = document.getElementById("source") as HTMLSelectElement;

const clearAllSourcesButton = document.getElementById("clearAllSources") as HTMLButtonElement;

addSourceButton.addEventListener("click", async (event) => {
  const button = event.target as HTMLButtonElement;

  button.disabled = true;

  const from = sourceSelect.value as "camera" | "screen" | "mic";

  try {
    const stream = await startSource(from);

    console.log(stream);

    if (from === "mic") audio = stream;
    if (from === "camera" || from === "screen") video = stream;
  } catch (error) {
    button.disabled = false;

    console.error("Failed to start stream:", error);
    return;
  }

  clearAllSourcesButton.disabled = false;
  goLiveButton.disabled = false;

  button.disabled = false;
});

clearAllSourcesButton.addEventListener("click", () => {
  video?.getTracks().forEach((track) => track.stop());
  audio?.getTracks().forEach((track) => track.stop());

  video?.dispatchEvent(new Event("inactive"));

  goLiveButton.disabled = true;
});

let mediaRecorder: MediaRecorder;

goLiveButton.addEventListener("click", async () => {
  goLiveButton.disabled = true;

  if (goLiveButton.dataset.live === "true") {
    mediaRecorder.stop();

    goLiveButton.textContent = "Go Live 🎥";
    goLiveButton.dataset.live = "false";

    goLiveButton.disabled = false;
    return;
  }

  try {
    setWs(
      await TobyWebSocketAsync({
        url: "ws://localhost:5000",
        open: () => console.log("WebSocket opened"),
        message: (message) => console.log(`WebSocket message: ${message.data}`),
        close: (event) => {
          console.log("WebSocket closed:", event.code, event.reason);

          mediaRecorder?.stop();

          goLiveButton.textContent = "Go Live 📺";
          goLiveButton.dataset.live = "false";
          goLiveButton.disabled = false;
        },
        error: (error) => {
          console.error("WebSocket error:", error);

          mediaRecorder?.stop();

          goLiveButton.textContent = "Go Live 📺";
          goLiveButton.dataset.live = "false";
          goLiveButton.disabled = false;
        },
      })
    );
  } catch (error) {
    goLiveButton.disabled = false;
    return;
  }

  // console.log([...video.getVideoTracks(), ...audio.getAudioTracks()]);

  mediaRecorder = new MediaRecorder(new MediaStream([...(video?.getVideoTracks() ?? []), ...(audio?.getAudioTracks() ?? [])]), {
    mimeType: bestMimeType,
    audioBitsPerSecond: 192000,
    videoBitsPerSecond: 2000000,

    // @ts-ignore
    videoKeyFrameIntervalDuration: 2000,
  });

  mediaRecorder.addEventListener("dataavailable", (event) => {
    console.debug("MediaRecorder data available:", event.data.type, event.data.size);
    const ws = getWs();
    if (ws.readyState === WebSocket.OPEN && event.data.size > 0) ws.send(event.data);
  });

  mediaRecorder.addEventListener("stop", () => getWs().close());
  mediaRecorder.addEventListener("error", (error) => console.error("MediaRecorder error:", error));

  goLiveButton.textContent = "End Stream 🛑";
  goLiveButton.dataset.live = "true";

  const startFfmpeg: v.InferOutput<typeof StartFFmpeg> = {
    streamKey: getStreamKey(),
    codec: parseCodec(bestMimeType),
    fps: settings.fps,
  };

  const ws = getWs();
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(startFfmpeg));

  mediaRecorder.start(1000 / 15);

  console.log("MediaRecorder started.", "Settings:", settings);

  goLiveButton.disabled = false;
});
