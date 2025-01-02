import app from "./app";

app.on("videoStart", (event) => {
  app.e.video.srcObject = event.stream;
  app.e.video.hidden = false;
});

app.on("videoStop", () => {
  app.video?.getTracks().forEach((track) => track.stop());
  app.video = undefined;

  app.e.video.srcObject = null;
  app.e.video.hidden = true;
});
