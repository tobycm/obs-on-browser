export const fpsOptions = [5, 10, 12, 15, 24, 30, 45, 50, 60];

export const resolutions = {
  "240p": { width: 426, height: 240 },
  "360p": { width: 640, height: 360 },
  "480p": { width: 854, height: 480 },
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
  "2160p": { width: 3840, height: 2160 },
};

export const settings: {
  quality: (typeof resolutions)[keyof typeof resolutions];
  fps: number;
} = {
  quality: resolutions["720p"],
  fps: 30,
};

const streamQualitySelect = document.getElementById("streamQuality") as HTMLSelectElement;
streamQualitySelect.addEventListener("change", (event) => {
  const target = event.target as HTMLSelectElement;

  const resolution = target.value;
  const { width, height } = resolutions[resolution as keyof typeof resolutions];

  console.log("Stream quality changed:", resolution);

  settings.quality = { width, height };
});

const streamFpsSelect = document.getElementById("streamFps") as HTMLSelectElement;
streamFpsSelect.addEventListener("change", (event) => {
  const target = event.target as HTMLSelectElement;
  const fps = target.value;

  console.log("Stream FPS changed:", fps);

  settings.fps = parseInt(fps);
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
