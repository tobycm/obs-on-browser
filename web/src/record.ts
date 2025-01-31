import app from "./app";

app.on("recordingStart", () => {
  app.e.record.textContent = "Recording 🔴";
  app.e.record.dataset.recording = "true";

  app.e.record.disabled = true;

  if (!app.settings.useSameEncoder) {
    app.mediaRecorder = new MediaRecorder(
      new MediaStream([...(app.video?.getVideoTracks() ?? []), ...(app.audioInputs > 0 ? app.audioDestination?.stream.getAudioTracks() ?? [] : [])]),
      {
        mimeType: app.bestMime,
        audioBitsPerSecond: 192000,
        videoBitsPerSecond: app.videoSettings.quality.width < 1920 ? 5000000 : 10000000,
      }
    );
  }

  if (!app.mediaRecorder) return console.error("MediaRecorder not initialized somehow????");

  app.mediaRecorder!.addEventListener("dataavailable", (event) => {
    console.debug("MediaRecorder data available:", event.data.type, event.data.size);

    app._recordingBuffer.push(event.data);
  });

  app.mediaRecorder!.addEventListener("stop", () => {
    app.emit("recordingStop", new Event("recordingStop"));
  });

  app.mediaRecorder!.addEventListener("error", (error) => {
    console.error("MediaRecorder error:", error);

    app.emit("recordingStop", new Event("recordingStop"));
  });

  app.mediaRecorder!.start(1000 / 15);

  console.log("MediaRecorder started.", "Settings:", app.videoSettings);

  if (!app.settings.useSameEncoder) {
    app.e.record.disabled = false;
  }

  app.state.recording = true;
});

app.on("recordingStop", () => {
  app.e.record.textContent = "Start Recording 🎥";
  app.e.record.dataset.recording = "false";

  app.e.record.disabled = false;

  const blob = new Blob(app._recordingBuffer, { type: "video/webm" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `recording-${new Date().toISOString()}.webm`;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);

  app._recordingBuffer = [];

  app.state.recording = false;
});

app.e.record.addEventListener("click", () => {
  if (app.state.recording) {
    app.mediaRecorder?.stop();
  } else {
    app.emit("recordingStart", new Event("recordingStart"));
  }
});
