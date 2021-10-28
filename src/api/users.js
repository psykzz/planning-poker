import { supabase } from "./client"

export const createUser = async (username, session) => {
  const { data: newUser, error } = await supabase
    .from("users")
    .insert([{ name: username, session_name: session }])

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error))
  }

  return newUser[0]
}

export const updateUserPresence = async (userId, session, last_presence) => {
  if (!userId) return
  const { error } = await supabase
    .from("users")
    .update({ last_presence, session_name: session })
    .eq("id", userId)

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error))
  }
}

export const getAllUsers = async session => {
  let { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("session_name", session)

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error))
  }

  return users
}

export const getUser = async userId => {
  if (!userId) return

  let { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)

  if (error && !Array.isArray(error)) {
    throw new Error(JSON.stringify(error))
  }

  if (user?.length > 0) {
    return user[user?.length - 1] // get latest user
  }
  return
}
