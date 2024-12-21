const customRelayInput = document.getElementById("customRelay") as HTMLInputElement;

const saveCustomRelayButton = document.getElementById("saveCustomRelay") as HTMLButtonElement;

saveCustomRelayButton.addEventListener("click", () => {
  localStorage.setItem("customRelay", customRelayInput.value);
});

const savedCustomRelay = localStorage.getItem("customRelay");
if (savedCustomRelay != null) customRelayInput.value = savedCustomRelay;

export const getCustomRelay = () => customRelayInput.value;
