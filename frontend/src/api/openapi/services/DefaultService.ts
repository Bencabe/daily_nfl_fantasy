/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Fixture } from '../models/Fixture';
import type { FootballTeam } from '../models/FootballTeam';
import type { Gameweek } from '../models/Gameweek';
import type { GameweekStats } from '../models/GameweekStats';
import type { League } from '../models/League';
import type { LeagueFixtureResults } from '../models/LeagueFixtureResults';
import type { LeagueTeam } from '../models/LeagueTeam';
import type { LeagueTeamExtended } from '../models/LeagueTeamExtended';
import type { NewLeague } from '../models/NewLeague';
import type { Player } from '../models/Player';
import type { SeasonPlayerStats } from '../models/SeasonPlayerStats';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Health Check
     * @returns any Successful Response
     * @throws ApiError
     */
    public healthCheckHealthcheckGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/healthcheck',
        });
    }
    /**
     * Login
     * @param email
     * @param password
     * @returns any Successful Response
     * @throws ApiError
     */
    public loginLoginPost(
        email?: string,
        password?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/login',
            headers: {
                'email': email,
                'password': password,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Join League
     * @param leagueId
     * @param userId
     * @param password
     * @param teamName
     * @returns any Successful Response
     * @throws ApiError
     */
    public joinLeague(
        leagueId: number,
        userId: number,
        password: string,
        teamName: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/join_league',
            query: {
                'league_id': leagueId,
                'user_id': userId,
                'password': password,
                'team_name': teamName,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create League
     * @param teamName
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public createLeague(
        teamName: string,
        requestBody: NewLeague,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/create_league',
            query: {
                'team_name': teamName,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Change Active League
     * @param newLeagueId
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public changeActiveLeague(
        newLeagueId: number,
        userId: number,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/change_active_league',
            query: {
                'new_league_id': newLeagueId,
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Leagues
     * @param userId
     * @returns League Successful Response
     * @throws ApiError
     */
    public getUserLeagues(
        userId: number,
    ): CancelablePromise<Array<League>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/user_leagues',
            query: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Whoami
     * @returns any Successful Response
     * @throws ApiError
     */
    public whoamiWhoamiPost(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/whoami',
        });
    }
    /**
     * Get Gameweek Stats
     * @param leagueId
     * @param userId
     * @param gameweekId
     * @param currentGameweek
     * @returns GameweekStats Successful Response
     * @throws ApiError
     */
    public getGameweekStats(
        leagueId: number,
        userId: number,
        gameweekId: number,
        currentGameweek: boolean,
    ): CancelablePromise<GameweekStats> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/gameweek_stats',
            query: {
                'league_id': leagueId,
                'user_id': userId,
                'gameweek_id': gameweekId,
                'current_gameweek': currentGameweek,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Gameweek Team
     * @param gameweekNumber
     * @returns Gameweek Successful Response
     * @throws ApiError
     */
    public getGameweekByNumber(
        gameweekNumber: number,
    ): CancelablePromise<Gameweek> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/gameweek_by_number',
            query: {
                'gameweek_number': gameweekNumber,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Current Gameweek
     * @returns Gameweek Successful Response
     * @throws ApiError
     */
    public getCurrentGameweek(): CancelablePromise<Gameweek> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/gameweek_current_gameweek',
        });
    }
    /**
     * Get Current Gameweek
     * @returns Gameweek Successful Response
     * @throws ApiError
     */
    public getAllGameweeks(): CancelablePromise<Array<Gameweek>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/all_gameweeks',
        });
    }
    /**
     * Update Team
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public updateTeam(
        requestBody: LeagueTeam,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/team',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get All Players
     * @returns Player Successful Response
     * @throws ApiError
     */
    public getAllPlayers(): CancelablePromise<Array<Player>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/players',
        });
    }
    /**
     * Get Season Player Stats
     * @returns SeasonPlayerStats Successful Response
     * @throws ApiError
     */
    public getSeasonPlayerStats(): CancelablePromise<Array<SeasonPlayerStats>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/season_player_stats',
        });
    }
    /**
     * Get League Teams
     * @param leagueId
     * @returns LeagueTeamExtended Successful Response
     * @throws ApiError
     */
    public getLeagueTeams(
        leagueId: number,
    ): CancelablePromise<Array<LeagueTeamExtended>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/league_teams',
            query: {
                'league_id': leagueId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Football Teams
     * @returns FootballTeam Successful Response
     * @throws ApiError
     */
    public getFootballTeams(): CancelablePromise<Array<FootballTeam>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/football_teams',
        });
    }
    /**
     * Get League Fixture Results
     * @param leagueId
     * @returns LeagueFixtureResults Successful Response
     * @throws ApiError
     */
    public getLeagueFixtureResults(
        leagueId: number,
    ): CancelablePromise<LeagueFixtureResults> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/league_fixture_results',
            query: {
                'league_id': leagueId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Gameweek Fixtures
     * @param gameweekId
     * @returns Fixture Successful Response
     * @throws ApiError
     */
    public getGameweekFixtures(
        gameweekId: number,
    ): CancelablePromise<Array<Fixture>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/gameweek_fixtures',
            query: {
                'gameweek_id': gameweekId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
