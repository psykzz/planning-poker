import React from "react"
import { nanoid } from "nanoid"
import { PlanningPoker } from "../PlanningPoker"
import * as styles from "./hero.module.css"

export const Hero = () => {
  const [session, setSession] = React.useState("")
  const [user, setUser] = React.useState({})

  const onHashChange = () => {
    setSession(window.location.hash.slice(1))
  }

  const createOrRestoreUser = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (storedUser) {
      setUser(storedUser)
      return
    }
    let name = ""
    while (name === "" || !name) {
      name = prompt("Please enter your name")
    }
    setUser({ name })
  }

  React.useEffect(() => {
    window.addEventListener("hashchange", onHashChange)
    onHashChange()
    createOrRestoreUser()

    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  React.useEffect(() => {
    if (user === {}) {
      return
    }

    localStorage.setItem("user", JSON.stringify(user))
  }, [user])

  const createSession = () => {
    if (typeof window === "undefined") {
      return
    }
    window.location.href += `#${nanoid(7)}`;
  }

  return (
    <div className={`${styles.content} ${session ? styles.has_session : ''}`}>
      <h1>Planning Poker</h1>
      {!session ? (
        <a onClick={createSession} className={styles.new_session}>
          Start new session
        </a>
      ) : (
        <PlanningPoker {...{ user, session }}></PlanningPoker>
      )}
    </div>
  )
}
