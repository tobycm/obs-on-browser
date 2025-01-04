import app from "./app";

const goLiveButton = document.getElementById("goLive") as HTMLButtonElement;

const streamKeyInput = document.getElementById("streamKey") as HTMLInputElement;
streamKeyInput.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;
  const streamKey = target.value;

  goLiveButton.disabled = !streamKey;

  app.settings.streamKey = streamKey;
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
