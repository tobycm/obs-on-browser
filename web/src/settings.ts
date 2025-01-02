import app from "./app";
import { fpsOptions, resolutions } from "./common";
import { FPSChangeEvent, ResolutionChangeEvent } from "./events";

const streamQualitySelect = document.getElementById("streamQuality") as HTMLSelectElement;
streamQualitySelect.addEventListener("change", (event) => {
  const target = event.target as HTMLSelectElement;

  const resolution = target.value as keyof typeof resolutions;
  const { width, height } = resolutions[resolution];

  app.videoSettings.quality = { width, height };
  app.emit("resolutionChange", new ResolutionChangeEvent(resolution));
});

const streamFpsSelect = document.getElementById("streamFps") as HTMLSelectElement;
streamFpsSelect.addEventListener("change", (event) => {
  const target = event.target as HTMLSelectElement;
  const fps = parseInt(target.value);

  app.videoSettings.fps = fps;

  app.emit("fpsChange", new FPSChangeEvent(fps));
});

for (const resolution of Object.keys(resolutions).reverse()) {
  const option = document.createElement("option");
  option.value = resolution;
  option.textContent = resolution;

  option.selected = resolution === "720p";

  streamQualitySelect.appendChild(option);
}

for (const fps of fpsOptions.reverse()) {
  const option = document.createElement("option");
  option.value = fps.toString();
  option.textContent = fps.toString();

  option.selected = fps === 30;

  streamFpsSelect.appendChild(option);
}

streamQualitySelect.dispatchEvent(new Event("change"));
streamFpsSelect.dispatchEvent(new Event("change"));
