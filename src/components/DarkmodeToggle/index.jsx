import React from "react"
import * as styles from "./styles.module.css"

export const DarkmodeToggle = () => {
  const [prefersDarkmode, setPrefersDarkmode] = React.useState(true);
  React.useEffect(() => {
    let shouldUseDarkmode = JSON.parse(
      window.localStorage.getItem("prefers-dark-mode")
    );
    if (shouldUseDarkmode === null) {
      shouldUseDarkmode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    }
    setPrefersDarkmode(shouldUseDarkmode)
  }, []);

  React.useEffect(() => {
    if (prefersDarkmode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute('data-theme', 'dark');

    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [prefersDarkmode]);

  const handleClick = () => {
    setPrefersDarkmode(!prefersDarkmode)
    window.localStorage.setItem(
      "prefers-dark-mode",
      JSON.stringify(!prefersDarkmode)
    )
  }

  return (
    <div
      id="dm-toggle"
      className={`${styles.darkmode_toggle} ${
        prefersDarkmode ? styles.is_dark : ""
      }`}
      onClick={() => handleClick()}
      onKeyPress={() => handleClick()}
      tabIndex="0"
      aria-label="Toggle darkmode"
      role="button"
    ></div>
  )
}
