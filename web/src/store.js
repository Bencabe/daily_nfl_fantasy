import { configureStore } from '@reduxjs/toolkit'
import authReducer from './Login/LoginReducer'
import teamSelectReducer from './Main/Team/TeamSelectReducer'

export default configureStore({
  reducer: {
    auth: authReducer,
    team: teamSelectReducer
  },
})