import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
    name: 'loggedIn',
    initialState: {
      loggedIn: false,
      user: {}
    },
    reducers: {
      logIn: (state) => {
        state.loggedIn = true;
        window.localStorage.setItem('loggedIn', true)
      },
      logOut: (state) => {
        state.loggedIn = false;
        window.localStorage.setItem('loggedIn', false)
      },
      setUser: (state, user) => {
        state.user = user
        window.localStorage.setItem('user', JSON.stringify(user))
      },
    },
  })
  
  // Action creators are generated for each case reducer function
  export const { logIn, logOut, setUser } = authSlice.actions
  
  export default authSlice.reducer