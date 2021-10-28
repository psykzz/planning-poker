import React from "react"
import { resetScores } from "../../api/scores"

import * as styles from "./moderatorcontrols.module.css"

export const ModeratorControls = ({ session, showScores, toggleScores }) => {
  const [isModerator, setIsModerator] = React.useState(false)

  if (!isModerator) {
    return (
      <span
        className={styles.moderator_notice}
        onClick={() => setIsModerator(true)}
      >
        click to enable moderator controls
      </span>
    )
  }

  return (
    <div className={styles.actions}>
      <div
        className={styles.reveal}
        onClick={() =>
          window.confirm(`${showScores ? "Hide" : "Reveal"} all cards?`) &&
          toggleScores(session)
        }
      >
        {showScores ? "Hide" : "Reveal"}
      </div>
      <div
        className={styles.reset}
        onClick={() =>
          window.confirm("Reset all cards?") && resetScores(session)
        }
      >
        Reset
      </div>
    </div>
  )
}
