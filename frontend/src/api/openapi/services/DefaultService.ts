/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FootballTeam } from '../models/FootballTeam';
import type { Gameweek } from '../models/Gameweek';
import type { GameweekStats } from '../models/GameweekStats';
import type { LeagueFixtureResults } from '../models/LeagueFixtureResults';
import type { LeagueTeam } from '../models/LeagueTeam';
import type { Player } from '../models/Player';
import type { SeasonPlayerStats } from '../models/SeasonPlayerStats';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
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
     * @returns LeagueTeam Successful Response
     * @throws ApiError
     */
    public getLeagueTeams(
        leagueId: number,
    ): CancelablePromise<Array<LeagueTeam>> {
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
     * Get League Teams
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
     * Get League Teams
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
}
