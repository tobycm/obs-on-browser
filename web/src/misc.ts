import app from "./app";

const useSameEncoder = document.getElementById("useSameEncoder") as HTMLInputElement;

useSameEncoder.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;

  app.settings.useSameEncoder = target.checked;
});
