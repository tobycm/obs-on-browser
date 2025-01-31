import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";

import "./style.css";

import app from "./app";

function reevaluateLifeChoices() {
  const haveSources = app.audioDestination?.numberOfInputs === 0 || !!app.video;

  app.e.record.disabled = !haveSources;
  app.e.goLive.disabled = !haveSources || !app.settings.streamKey || !app.settings.customRelay;
  app.e.clearAllSources.disabled = !haveSources;

  if (!haveSources) {
    app.e.error.textContent = "You need to add a source before you can record or go live.";
    return;
  }

  if (!app.settings.streamKey) {
    app.e.error.textContent = "You need to set a stream key before you can go live.";
    return;
  }

  if (!app.settings.customRelay) {
    app.e.error.textContent = "You need to set a custom relay before you can go live.";
    return;
  }

  app.e.error.textContent = "";
}

app.on("newSource", reevaluateLifeChoices);
app.on("stopSource", reevaluateLifeChoices);
app.on("videoStart", reevaluateLifeChoices);
app.on("videoStop", reevaluateLifeChoices);
app.on("clearAllSources", reevaluateLifeChoices);
app.on("streamKeyChange", reevaluateLifeChoices);
app.on("relayChange", reevaluateLifeChoices);

app.e.clearAllSources.addEventListener("click", () => {
  app.emit("clearAllSources", new Event("clearAllSources"));
});

app.on("clearAllSources", () => {
  app.audioContext?.close();
  app.audioContext = undefined;
  app.audioDestination = undefined;
  app.video = undefined;
});
