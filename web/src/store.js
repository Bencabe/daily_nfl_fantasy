import { configureStore } from '@reduxjs/toolkit'
import authReducer from './pages/Login/LoginReducer'
import teamSelectReducer from './pages/Team/TeamSelectReducer'

export default configureStore({
  reducer: {
    auth: authReducer,
    team: teamSelectReducer
  },
})