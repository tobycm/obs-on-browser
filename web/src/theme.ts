export function setTheme(theme?: string | null) {
  const css = document.getElementById("theme") as HTMLLinkElement;

  // no theme? toggle
  if (!theme) theme = css.href.endsWith("light.css") ? "/themes/dark.css" : "/themes/light.css";

  css.href = theme;

  console.log(css);

  localStorage.setItem("theme", theme);

  (document.getElementById("themeButton") as HTMLButtonElement).textContent = theme.endsWith("light.css") ? "🔆" : "🌙";
}

let theme = localStorage.getItem("theme");

const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

if (!theme && prefersDarkScheme.matches) theme = "/themes/dark.css";

console.log(theme);

setTheme(theme);

const themeButton = document.getElementById("themeButton") as HTMLButtonElement;
themeButton.addEventListener("click", () => setTheme());
