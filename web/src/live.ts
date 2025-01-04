import * as v from "valibot";
import { StartFFmpeg } from "../../server/schemas";
import app from "./app";
import { parseCodec } from "./mime";
import { TobyWebSocketAsync } from "./ws";

app.e.goLive.addEventListener("click", async () => {
  app.e.goLive.disabled = true;

  if (!app.state.live) {
    app.emit("liveStart", new Event("liveStart"));
    return;
  }

  app.emit("liveStop", new Event("liveStop"));

  app.e.goLive.disabled = false;
});

app.on("liveStart", async () => {
  try {
    app.ws = await TobyWebSocketAsync({
      url: app.settings.customRelay,
      open: () => console.log("WebSocket opened"),
      message: (message) => console.log(`WebSocket message: ${message.data}`),
      close: (event) => {
        console.log("WebSocket closed:", event.code, event.reason);

        if (app.state.live) app.emit("liveStop", new Event("liveStop"));
      },
      error: (error) => {
        console.error("WebSocket error:", error);

        if (app.state.live) app.emit("liveStop", new Event("liveStop"));
      },
    });
  } catch (error) {
    app.e.goLive.disabled = false;
    return;
  }

  app.mediaRecorder = new MediaRecorder(
    new MediaStream([...(app.video?.getVideoTracks() ?? []), ...(app.audioDestination?.stream.getAudioTracks() ?? [])]),
    {
      mimeType: app.bestMime,
      audioBitsPerSecond: 192000,
      videoBitsPerSecond: app.videoSettings.quality.width < 1920 ? 5000000 : 10000000,
    }
  );

  app.mediaRecorder.addEventListener("dataavailable", (event) => {
    console.debug("MediaRecorder data available:", event.data.type, event.data.size);
    if (app.ws?.readyState === WebSocket.OPEN && event.data.size > 0) app.ws.send(event.data);
  });

  app.mediaRecorder.addEventListener("stop", () => app.state.live && app.ws?.close()); // edge case?
  app.mediaRecorder.addEventListener("error", (error) => console.error("MediaRecorder error:", error));

  app.e.goLive.textContent = "End Stream 🛑";
  app.e.goLive.dataset.live = "true";

  const startFfmpeg: v.InferOutput<typeof StartFFmpeg> = {
    destination: "twitch",
    streamKey: app.settings.streamKey,
    codec: parseCodec(app.bestMime),
    fps: app.videoSettings.fps,
  };

  if (app.ws?.readyState === WebSocket.OPEN) app.ws.send(JSON.stringify(startFfmpeg));

  app.mediaRecorder.start(1000 / 15);

  console.log("MediaRecorder started.", "Settings:", app.videoSettings);

  app.e.goLive.disabled = false;
});

app.on("liveStop", () => {
  app.state.live = false;

  app.ws?.close();
  app.ws = undefined;

  app.mediaRecorder?.stop();
  app.mediaRecorder = undefined;

  app.e.goLive.textContent = "Go Live 📺";
});
