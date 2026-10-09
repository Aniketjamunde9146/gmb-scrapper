/** Runs before first paint so there is never a light/dark flash. Saved choice wins, then the device setting. */
const code = `try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){document.documentElement.classList.add("dark")}`;
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
