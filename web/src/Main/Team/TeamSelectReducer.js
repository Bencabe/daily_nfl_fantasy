import { createSlice } from '@reduxjs/toolkit'

export const addPlayerSlice = createSlice({
    name: 'addPlayer',
    initialState: {
        team: null,
        players: {
            goalkeepers: [],
            defenders: [],
            midfielders: [],
            forwards: []
        },
        allGoalkeepers: []
    },
    reducers: {
        pickTeam: (state, leagueId) => {
            state.leagueId = leagueId.payload
        },
        addGoalkeeper: (state, goalkeeper) => {
            state.players.goalkeepers = [...state.players.goalkeepers, parseInt(goalkeeper.payload)]
        },
        addGoalkeepers: (state, goalkeepers) => {
            state.players.goalkeepers = goalkeepers.payload
        },
        allGoalkeepers: (state, goalkeepers) => {
            state.allGoalkeepers = goalkeepers.payload
        }
    }
  })
  
  // Action creators are generated for each case reducer function
  export const { pickTeam, addGoalkeeper, addGoalkeepers, allGoalkeepers } = addPlayerSlice.actions
  
  export default addPlayerSlice.reducer