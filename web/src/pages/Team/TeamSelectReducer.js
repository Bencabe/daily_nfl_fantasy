import { createSlice } from '@reduxjs/toolkit'
import Gameweek from '../../classes/Gameweek'

export const setPlayerslice = createSlice({
    name: 'addPlayer',
    initialState: {
        team: null,
        gameweekSelected: {},
        curGameweek: {},
        gameweekScore: 0,
        playerStats: {},
        leagueId: null,
        teamPlayers: {
            goalkeepers: [],
            defenders: [],
            midfielders: [],
            forwards: [],
            subs: []
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
            if (player.payload.isSub){
                state.teamPlayers.subs = [...state.teamPlayers.subs, parseInt(player.payload.id)]
            }
        },
        setPlayers: (state, players) => {
            state.teamPlayers[players.payload.position] = players.payload.players
        },
        setSubs: (state, players) => {
            state.teamPlayers[players.payload.position] = players.payload.players
        },
        loadPlayers: (state, playersPerPosition) => {
            const position = playersPerPosition.payload[0][6] + 's'
            state.allPlayers[position] = playersPerPosition.payload
        },
        setSelectedGameweek: (state, gameweek) => {
            state.gameweekSelected = gameweek.payload
        },
        setCurrentGameweek: (state, gameweek) => {
            const gameweekArr = [gameweek.id,gameweek.number,gameweek.seasonId,gameweek.startDate,gameweek.endDate,gameweek.current]
            state.curGameweek = gameweekArr
        },
        setPlayerStats: (state, stats) => {
            state.playerStats = stats.payload
        }
    }
  })
  
  export const { pickTeam, addPlayer, setPlayers, loadPlayers, setSelectedGameweek, setCurrentGameweek, setPlayerStats} = setPlayerslice.actions
  
  export default setPlayerslice.reducer