import React from "react"

import * as styles from "./userlist.module.css"

export const UserList = ({ me, users, scores }) => {
  const scoreByUser = {}
  scores?.forEach(score => {
    scoreByUser[score.user_id] = score
  })

  // Stops the user list jumping around
  users?.sort((a, b) => a.id.localeCompare(b.id))

  const resetName = () => {
    if (typeof window === "undefined") {
      return
    }
    localStorage.removeItem("user")
    window.location.reload()
  }

  const Score = ({ isMe, score }) => {
    if (!score) {
      return <div className={styles.score}>-</div>
    }
    if (!score.revealed && !isMe) {
      return <div className={styles.score}>?</div>
    }
    return <div className={styles.score}>{score.score}</div>
  }

  const User = ({ user }) => {
    const isMe = user.id === me?.id
    const score = scoreByUser[user.id]
    return (
      <div key={user.id} className={styles.user}>
        <div
          className={`${styles.name} ${isMe && styles.me}`}
          onClick={() => isMe && window.confirm("Reset your name?") && resetName()}
        >
          {user.name} {isMe && "(You)"}
        </div>
        <div className={`${styles.card} ${styles.no_hover}`}>
          <Score {...{ isMe, score }} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.user_list}>
      {users?.map(user => (
        <User key={user.id} user={user} />
      ))}
    </div>
  )
}
