import { createSlice } from '@reduxjs/toolkit'

export const addPlayerSlice = createSlice({
    name: 'addPlayer',
    initialState: {
        team: null,
        teamPlayers: {
            goalkeepers: [],
            defenders: [],
            midfielders: [],
            forwards: []
        },
        allPlayers: {
            goalkeepers: [],
            defenders: [],
            midfielders: [],
            forwards: []
        }
    },
    reducers: {
        pickTeam: (state, leagueId) => {
            state.leagueId = leagueId.payload
        },
        addPlayer: (state, player) => {
            state.teamPlayers[player.payload.position] = [...state.teamPlayers[player.payload.position], parseInt(player.payload.id)]
        },
        addPlayers: (state, players) => {
            state.teamPlayers[players.payload.position] = players.payload.players
        },
        loadPlayers: (state, playersPerPosition) => {
            const position = playersPerPosition.payload[0][6] + 's'
            state.allPlayers[position] = playersPerPosition.payload
        }
    }
  })
  
  // Action creators are generated for each case reducer function
  export const { pickTeam, addPlayer, addPlayers, loadPlayers } = addPlayerSlice.actions
  
  export default addPlayerSlice.reducer