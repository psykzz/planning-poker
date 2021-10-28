import React from "react"

import * as styles from "./userlist.module.css"

export const UserList = ({ me, users, scores }) => {
  const scoreByUser = {}
  scores?.forEach(score => {
    scoreByUser[score.user_id] = score
  })

  // Stops the user list jumping around
  users?.sort((a, b) => a.id.localeCompare(b.id))

  const Score = ({ user }) => {
    const isMe = user.id === me?.id
    const score = scoreByUser[user.id]
    if (!score) {
      return <div className={styles.score}>-</div>
    }
    if (!score.revealed && !isMe) {
      return <div className={styles.score}>?</div>
    }
    return <div className={styles.score}>{score.score}</div>
  }

  return (
    <div className={styles.user_list}>
      {users?.map(user => (
        <div key={user.id} className={styles.user}>
          <div className={styles.name}>{user.name}</div>
          <div className={`${styles.card} ${styles.no_hover}`}>
            <Score user={user} />
          </div>
        </div>
      ))}
    </div>
  )
}
