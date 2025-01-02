import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";

import app from "./app";

function reevaluateLifeChoices() {
  const haveSources = app.audioDestination?.numberOfInputs === 0 || !!app.video;

  app.e.record.disabled = !haveSources;
  app.e.goLive.disabled = !haveSources;
  app.e.clearAllSources.disabled = !haveSources;
}

app.on("newSource", reevaluateLifeChoices);
app.on("stopSource", reevaluateLifeChoices);
app.on("videoStart", reevaluateLifeChoices);
app.on("videoStop", reevaluateLifeChoices);

app.e.clearAllSources.addEventListener("click", () => {
  app.emit("clearAllSources", new Event("clearAllSources"));
});

app.on("clearAllSources", () => {
  app.audioContext?.close();
  app.audioContext = undefined;
  app.audioDestination = undefined;
  app.video = undefined;
});
