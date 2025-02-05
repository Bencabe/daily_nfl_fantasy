/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeagueTypes } from './LeagueTypes';
export type League = {
    name: string;
    password: string;
    admin: number;
    private?: boolean;
    type?: LeagueTypes;
    playerLimit?: (number | null);
    draftStarted: boolean;
    draftCompleted: boolean;
    draftTurn: (number | null);
    draftOrder: (Array<number> | null);
    id: number;
};

