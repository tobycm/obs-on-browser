import { createAudioMeter } from "lib/volumeMeter";
import app from "./app";
import { randomString } from "./common";
import { StopSourceEvent, VideoStartEvent } from "./events";

async function startSource<From = "camera" | "screen" | "mic">(from: From): Promise<{ meter: AudioWorkletNode; id: string } | undefined> {
  const options: Parameters<typeof navigator.mediaDevices.getDisplayMedia>[0] = {
    video: {
      ...app.videoSettings.quality,
      frameRate: { ideal: app.videoSettings.fps * 1.1 },
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

  if (options.video) {
    app.video = stream;
    app.emit("videoStart", new VideoStartEvent(stream));

    stream.addEventListener("inactive", () => {
      app.emit("videoStop", new Event("videoStop"));
    });

    app.on("clearAllSources", () => {
      stream.getTracks().forEach((track) => track.stop());
      app.emit("videoStop", new Event("videoStop"));
    });
  }

  let meter: AudioWorkletNode | undefined;
  const id = randomString(32);
  if (options.audio) {
    if (!app.audioContext) {
      app.audioContext = new AudioContext();
      app.audioDestination = app.audioContext.createMediaStreamDestination();
    }

    const source = app.audioContext.createMediaStreamSource(stream);
    app.on("stopSource", (event) => {
      if (event.id !== id) return;
      source.disconnect();
      meter?.disconnect();
    });

    meter = await createAudioMeter(app.audioContext);

    source.connect(meter);
    source.connect(app.audioDestination!);

    stream.addEventListener("inactive", () => {
      app.emit("stopSource", new StopSourceEvent(id));
    });

    app.on("clearAllSources", () => {
      app.emit("stopSource", new StopSourceEvent(id));
    });
  }

  app.emit("newSource", new Event("newSource"));

  if (meter) return { meter, id };
}

app.e.addSource.addEventListener("click", async (event) => {
  const button = event.target as HTMLButtonElement;

  button.disabled = true;

  const from = app.e.source.value as "camera" | "screen" | "mic";

  let audio: Awaited<ReturnType<typeof startSource>>;
  try {
    audio = await startSource(from);
  } catch (error) {
    button.disabled = false;

    console.error("Failed to start stream:", error);
    return;
  }

  if (audio) {
    const volumeMeter = app.e.volumeMeter.cloneNode(true) as HTMLProgressElement;
    volumeMeter.hidden = false;
    volumeMeter.id = `volumeMeter-${audio.id}`;

    audio.meter.port.onmessage = (event) => {
      const { volume } = event.data as { volume: number; clipping: boolean };
      volumeMeter.value = volume;

      if (volume > 0.8) volumeMeter.setAttribute("data-volume", "high");
      else volumeMeter.removeAttribute("data-volume");
    };

    const onSourceStop = (event: StopSourceEvent) => {
      if (event.id !== audio.id) return;

      app.off("stopSource", onSourceStop);
      volumeMeter.remove();
    };

    app.on("stopSource", onSourceStop);
  }

  button.disabled = false;
});
