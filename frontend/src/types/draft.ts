import { User } from '../components/Login';

export interface Player {
    id: number;
    fantasy_id: number;
    firstName: string;
    lastName: string;
    positionId: number;
    teamId: number;
    positionCategory: string;
    cost: number;
    displayName: string;
    imagePath: string;
    nationality: string;
  }
  
  export interface LeagueTeam {
    teamId: number;
    leagueId: number;
    userId: number;
    teamName: string;
    goalkeepers: number[];
    defenders: number[];
    midfielders: number[];
    forwards: number[];
    subs: number[];
  }
  
  export interface LeagueTeams {
    [key: string]: LeagueTeam;
  }
  
  export interface WebSocketMessage {
    messageType: 'playerList' | 'turnChange' | 'playerSelected' | 'playerConnect' | 'startDraft' | 'draftStatus' | 'draftCompleted';
    playerList?: Player[];
    selectedPlayers?: Player[];
    user?: string;
    player?: Player;
    leagueUsers?: User[];
    usersConnected?: User[];
    draftState?: boolean;
    nextUserId?: number;
    playerId?: string;
    userTurn?: User;
    leagueTeams?: LeagueTeams;
  }