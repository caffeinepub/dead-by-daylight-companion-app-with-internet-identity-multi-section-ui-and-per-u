import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MatchHistory {
    totalMatches: bigint;
    totalScore: bigint;
    matches: Array<Match>;
}
export interface Perk {
    id: string;
    name: string;
    description: string;
    usageTips: string;
    rarity: string;
    isUnique: boolean;
    characterId: string;
}
export interface FavoriteData {
    favoritePerks: Array<string>;
    favoriteCharacters: Array<string>;
    favoriteBuilds: Array<SavedBuild>;
}
export interface KillerStats {
    noedKills: bigint;
    survivorsHooked: bigint;
    generatorsDefended: bigint;
    endgameKills: bigint;
    evades: bigint;
    basementHooks: bigint;
    chasesInitiated: bigint;
    sluggedSurvivors: bigint;
    downs: bigint;
    survivorsRescued: bigint;
}
export interface WikiEntry {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
    section: string;
    author: string;
}
export interface GameState {
    news: Array<NewsItem>;
    characters: Array<Character>;
    wikiEntries: Array<WikiEntry>;
    perks: Array<Perk>;
}
export interface Character {
    id: string;
    bio: string;
    uniquePerks: Array<string>;
    difficulty: string;
    name: string;
    role: Variant_survivor_killer;
    isLicensed: boolean;
    power: string;
    releaseYear: bigint;
}
export interface SavedBuild {
    creator: string;
    dateSaved: string;
    buildId: string;
    buildName: string;
}
export interface SurvivorStats {
    chasesWon: bigint;
    stealthSuccesses: bigint;
    hooks: bigint;
    escapesHatch: bigint;
    generatorsRepaired: bigint;
    palletsStunned: bigint;
    deaths: bigint;
    escapesGate: bigint;
    saves: bigint;
    deathsFirst: bigint;
    deathsEndgame: bigint;
    escapes: bigint;
    totemsCleansed: bigint;
    stealthFailiures: bigint;
    kills: bigint;
    sacrifices: bigint;
}
export interface Match {
    map: string;
    matchType: Variant_survivor_killer;
    result: Variant_draw_loss_victory;
    teammates: Array<string>;
    achievements: Array<string>;
    matchId: string;
    perksUsed: Array<string>;
    datePlayed: string;
    killerStats?: KillerStats;
    mainCharacter: string;
    survivorStats?: SurvivorStats;
}
export interface UserData {
    favorites: FavoriteData;
    builds: Array<Build>;
    matchHistory: MatchHistory;
}
export interface NewsItem {
    id: string;
    title: string;
    publishedAt: string;
    description: string;
    author: string;
    itemType: Variant_tip_release_update_generic;
}
export interface Build {
    id: string;
    creator: string;
    character: string;
    name: string;
    role: Variant_survivor_killer;
    tips: string;
    description: string;
    perks: Array<string>;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_draw_loss_victory {
    draw = "draw",
    loss = "loss",
    victory = "victory"
}
export enum Variant_survivor_killer {
    survivor = "survivor",
    killer = "killer"
}
export enum Variant_tip_release_update_generic {
    tip = "tip",
    release = "release",
    update = "update",
    generic = "generic"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllUserData(): Promise<Array<[Principal, UserData]>>;
    getCallerData(): Promise<UserData>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacters(): Promise<Array<Character>>;
    getGlobalData(): Promise<GameState>;
    getNews(): Promise<Array<NewsItem>>;
    getPerks(): Promise<Array<Perk>>;
    getUserDataByPrincipal(principal: Principal): Promise<UserData>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWikiEntries(): Promise<Array<WikiEntry>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveUserData(data: UserData): Promise<void>;
}
