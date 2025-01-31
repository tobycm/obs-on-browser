import app from "./app";
import { StreamKeyChangeEvent } from "./events";

const streamKeyInput = document.getElementById("streamKey") as HTMLInputElement;
streamKeyInput.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;
  const streamKey = target.value;

  app.settings.streamKey = streamKey;

  app.emit("streamKeyChange", new StreamKeyChangeEvent(app.settings.streamKey));
});

const saveStreamKeyButton = document.getElementById("saveStreamKey") as HTMLButtonElement;

saveStreamKeyButton.addEventListener("click", () => {
  localStorage.setItem("streamKey", streamKeyInput.value);
});

const savedStreamKey = localStorage.getItem("streamKey");
if (savedStreamKey) {
  streamKeyInput.value = savedStreamKey;
  streamKeyInput.dispatchEvent(new Event("change"));
}
