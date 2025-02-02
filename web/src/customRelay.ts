import app from "./app";
import { RelayChangeEvent } from "./events";

const customRelayInput = document.getElementById("customRelay") as HTMLInputElement;
customRelayInput.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;

  app.settings.customRelay = target.value;

  app.emit("relayChange", new RelayChangeEvent(app.settings.customRelay));
});

const saveCustomRelayButton = document.getElementById("saveCustomRelay") as HTMLButtonElement;

saveCustomRelayButton.addEventListener("click", () => {
  localStorage.setItem("customRelay", customRelayInput.value);
});

const savedCustomRelay = localStorage.getItem("customRelay");
if (savedCustomRelay != null) {
  customRelayInput.value = savedCustomRelay;
  customRelayInput.dispatchEvent(new Event("change"));
}
