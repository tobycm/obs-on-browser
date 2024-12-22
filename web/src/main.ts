import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";

import * as v from "valibot";
import { StartFFmpeg } from "../../server/schemas";
import { createAudioMeter } from "../lib/volumeMeter";
import { getCustomRelay } from "./customRelay";
import { mimeType as bestMimeType, parseCodec } from "./mime";
import { settings } from "./settings";
import { getStreamKey } from "./streamKey";
import { getWs, setWs, TobyWebSocketAsync } from "./ws";

const videoElement = document.getElementById("stream") as HTMLVideoElement;

async function startSource(from: "camera" | "screen" | "mic"): Promise<[MediaStream, AudioWorkletNode?]> {
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

  if (from == "camera" || from == "screen") {
    videoElement.srcObject = stream;
    videoElement.hidden = false;

    stream.addEventListener("inactive", () => {
      videoElement.srcObject = null;
      videoElement.hidden = true;
    });

    return [stream];
  }

  if (!audioContext) {
    audioContext = new AudioContext();
    audio = audioContext.createMediaStreamDestination();
  }

  const source = audioContext.createMediaStreamSource(stream);

  const meter = await createAudioMeter(audioContext);

  source.connect(meter);
  source.connect(audio!);

  stream.addEventListener("inactive", () => {
    source.disconnect(meter);
  });

  return [stream, meter];
}

let video: MediaStream;
let audioContext: AudioContext | undefined;
let audio: MediaStreamAudioDestinationNode | undefined;

const goLiveButton = document.getElementById("goLive") as HTMLButtonElement;

const addSourceButton = document.getElementById("addSource") as HTMLButtonElement;
const sourceSelect = document.getElementById("source") as HTMLSelectElement;

const clearAllSourcesButton = document.getElementById("clearAllSources") as HTMLButtonElement;

addSourceButton.addEventListener("click", async (event) => {
  const button = event.target as HTMLButtonElement;

  button.disabled = true;

  const from = sourceSelect.value as "camera" | "screen" | "mic";

  try {
    const [stream, meter] = await startSource(from);

    if (from === "camera" || from === "screen") video = stream;
    if (meter) {
      volumeMeterBar.hidden = false;

      meter.port.onmessage = (event) => {
        const data = event.data as { volume: number; clipping: boolean };
        updateVolumeMeter(data.volume);
      };

      stream.addEventListener("inactive", () => {
        volumeMeterBar.hidden = true;
      });
    }
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
  if (audioContext) audioContext.close();

  video?.dispatchEvent(new Event("inactive"));

  goLiveButton.disabled = true;
  clearAllSourcesButton.disabled = true;
  volumeMeterBar.hidden = true;
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
        url: getCustomRelay() ?? `wss://obb-relay.tobycm.dev`,
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

  mediaRecorder = new MediaRecorder(
    new MediaStream([...(video?.getVideoTracks() ?? []), ...(audio?.stream.getAudioTracks() ?? video.getAudioTracks())]),
    {
      mimeType: bestMimeType,
      audioBitsPerSecond: 192000,
      videoBitsPerSecond: 2000000,
    }
  );

  mediaRecorder.addEventListener("dataavailable", (event) => {
    console.log("MediaRecorder data available:", event.data.type, event.data.size);
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

const volumeMeterBar = document.getElementById("volumeMeter") as HTMLProgressElement;

function updateVolumeMeter(volume: number) {
  volumeMeterBar.value = volume;

  if (volume > 0.8) volumeMeterBar.setAttribute("data-volume", "high");
  else volumeMeterBar.removeAttribute("data-volume");
}
