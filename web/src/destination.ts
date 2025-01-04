import app from "./app";

const destinationSelect = document.getElementById("destination") as HTMLSelectElement;
destinationSelect.addEventListener("change", (event) => {
  const target = event.target as HTMLSelectElement;
  const destination = target.value;

  if (destination !== "twitch" && destination !== "youtube") return;

  app.settings.destination = destination;

  localStorage.setItem("destination", destination);
});

const savedDestination = localStorage.getItem("destination");
if (savedDestination) {
  destinationSelect.value = savedDestination;
  destinationSelect.dispatchEvent(new Event("change"));
}
