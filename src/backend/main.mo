import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type Perk = {
    id : Text;
    name : Text;
    description : Text;
    usageTips : Text;
    characterId : Text;
    isUnique : Bool;
    rarity : Text;
  };

  public type Character = {
    id : Text;
    name : Text;
    role : { #killer; #survivor };
    bio : Text;
    difficulty : Text;
    power : Text;
    uniquePerks : [Text];
    isLicensed : Bool;
    releaseYear : Nat;
  };

  public type WikiEntry = {
    id : Text;
    title : Text;
    content : Text;
    section : Text;
    author : Text;
    lastUpdated : Text;
  };

  public type Build = {
    id : Text;
    name : Text;
    role : { #killer; #survivor };
    perks : [Text];
    character : Text;
    description : Text;
    tips : Text;
    creator : Text;
  };

  public type SavedBuild = {
    buildId : Text;
    buildName : Text;
    creator : Text;
    dateSaved : Text;
  };

  public type FavoriteData = {
    favoritePerks : [Text];
    favoriteCharacters : [Text];
    favoriteBuilds : [SavedBuild];
  };

  type SurvivorStats = {
    escapes : Nat;
    sacrifices : Nat;
    kills : Nat;
    deaths : Nat;
    generatorsRepaired : Nat;
    totemsCleansed : Nat;
    hooks : Nat;
    saves : Nat;
    stealthSuccesses : Nat;
    chasesWon : Nat;
    stealthFailiures : Nat;
    palletsStunned : Nat;
    escapesGate : Nat;
    escapesHatch : Nat;
    deathsFirst : Nat;
    deathsEndgame : Nat;
  };

  type KillerStats = {
    downs : Nat;
    chasesInitiated : Nat;
    evades : Nat;
    generatorsDefended : Nat;
    survivorsHooked : Nat;
    survivorsRescued : Nat;
    sluggedSurvivors : Nat;
    basementHooks : Nat;
    noedKills : Nat;
    endgameKills : Nat;
  };

  public type Match = {
    matchId : Text;
    matchType : { #killer; #survivor };
    datePlayed : Text;
    mainCharacter : Text;
    result : { #victory; #loss; #draw };
    map : Text;
    perksUsed : [Text];
    teammates : [Text];
    achievements : [Text];
    survivorStats : ?SurvivorStats;
    killerStats : ?KillerStats;
  };

  public type MatchHistory = {
    totalMatches : Nat;
    totalScore : Nat;
    matches : [Match];
  };

  public type NewsItem = {
    id : Text;
    title : Text;
    description : Text;
    itemType : { #update; #tip; #release; #generic };
    publishedAt : Text;
    author : Text;
  };

  public type GameState = {
    news : [NewsItem];
    perks : [Perk];
    characters : [Character];
    wikiEntries : [WikiEntry];
  };

  public type UserData = {
    builds : [Build];
    matchHistory : MatchHistory;
    favorites : FavoriteData;
  };

  public type StoredMatchHistory = {
    matches : List.List<Match>;
    totalMatches : Nat;
    totalScore : Nat;
  };

  module StoredMatchHistory {
    public func fromMatchHistory(history : MatchHistory) : StoredMatchHistory {
      {
        matches = List.fromArray(history.matches);
        totalMatches = history.totalMatches;
        totalScore = history.totalScore;
      };
    };

    public func toMatchHistory(stored : StoredMatchHistory) : MatchHistory {
      {
        matches = stored.matches.toArray();
        totalMatches = stored.totalMatches;
        totalScore = stored.totalScore;
      };
    };
  };

  public type StoredFavorites = {
    favoritePerks : List.List<Text>;
    favoriteCharacters : List.List<Text>;
    favoriteBuilds : List.List<SavedBuild>;
  };

  module StoredFavorites {
    public func fromFavoriteData(favorites : FavoriteData) : StoredFavorites {
      {
        favoritePerks = List.fromArray(favorites.favoritePerks);
        favoriteCharacters = List.fromArray(favorites.favoriteCharacters);
        favoriteBuilds = List.fromArray(favorites.favoriteBuilds);
      };
    };

    public func toFavoriteData(stored : StoredFavorites) : FavoriteData {
      {
        favoritePerks = stored.favoritePerks.toArray();
        favoriteCharacters = stored.favoriteCharacters.toArray();
        favoriteBuilds = stored.favoriteBuilds.toArray();
      };
    };
  };

  public type StoredBuilds = {
    builds : List.List<Build>;
  };

  module StoredBuilds {
    public func fromBuildsArray(builds : [Build]) : StoredBuilds {
      {
        builds = List.fromArray(builds);
      };
    };

    public func toBuildsArray(storedBuilds : StoredBuilds) : [Build] {
      storedBuilds.builds.toArray();
    };
  };

  public type StoredUserData = {
    builds : List.List<Build>;
    matchHistory : StoredMatchHistory;
    favorites : StoredFavorites;
  };

  module StoredUserData {
    public func fromUserData(data : UserData) : StoredUserData {
      {
        builds = List.fromArray(data.builds);
        matchHistory = StoredMatchHistory.fromMatchHistory(data.matchHistory);
        favorites = StoredFavorites.fromFavoriteData(data.favorites);
      };
    };

    public func toUserData(stored : StoredUserData) : UserData {
      {
        builds = stored.builds.toArray();
        matchHistory = StoredMatchHistory.toMatchHistory(stored.matchHistory);
        favorites = StoredFavorites.toFavoriteData(stored.favorites);
      };
    };
  };

  public type UserProfile = {
    name : Text;
  };

  public type BackendState = {
    globalData : GameState;
    userData : Map.Map<Principal, StoredUserData>;
  };

  // Game (Global) Data
  let perks : [Perk] = [
    {
      id = "perk1";
      name = "Dead Hard";
      description = "Avoid damage after a successful dash.";
      usageTips = "Use when chased to dodge.";
      characterId = "survivor1";
      isUnique = false;
      rarity = "rare";
    },
    {
      id = "perk2";
      name = "Barbecue & Chili";
      description = "Reveal survivors' auras after hooking.";
      usageTips = "Hook survivors frequently for better info.";
      characterId = "killer1";
      isUnique = true;
      rarity = "very rare";
    },
    {
      id = "perk3";
      name = "Sprint Burst";
      description = "Gain a temporary speed boost when running.";
      usageTips = "Save for chases or escapes.";
      characterId = "survivor2";
      isUnique = false;
      rarity = "rare";
    },
    {
      id = "perk4";
      name = "Hex: Ruin";
      description = "Regression on failed generator skill checks.";
      usageTips = "Protect your totem for maximum value.";
      characterId = "killer2";
      isUnique = true;
      rarity = "very rare";
    },
    {
      id = "perk5";
      name = "Borrowed Time";
      description = "Grants rescued survivors additional protection.";
      usageTips = "Time rescues carefully to optimize benefit.";
      characterId = "survivor3";
      isUnique = false;
      rarity = "rare";
    },
    {
      id = "perk6";
      name = "Nurse's Calling";
      description = "Reveal healing survivors' auras in a radius.";
      usageTips = "Check for survivors healing nearby.";
      characterId = "killer3";
      isUnique = false;
      rarity = "uncommon";
    },
  ];
  let characters : [Character] = [
    {
      id = "killer1";
      name = "The Trapper";
      role = #killer;
      bio = "The first killer with classic trapping mechanics.";
      difficulty = "medium";
      power = "Bear traps to catch survivors";
      uniquePerks = ["perk2", "perk3"];
      isLicensed = false;
      releaseYear = 2016;
    },
    {
      id = "survivor1";
      name = "Meg Thomas";
      role = #survivor;
      bio = "Meg is a popular and athletic survivor.";
      difficulty = "easy";
      power = "Agile movements, no unique powers.";
      uniquePerks = ["perk1", "perk5"];
      isLicensed = false;
      releaseYear = 2016;
    },
    {
      id = "killer2";
      name = "The Nurse";
      role = #killer;
      bio = "Infamous teleporting killer.";
      difficulty = "hard";
      power = "Blink ability to pass through objects.";
      uniquePerks = ["perk4", "perk6"];
      isLicensed = false;
      releaseYear = 2017;
    },
    {
      id = "survivor2";
      name = "Claudette Morel";
      role = #survivor;
      bio = "Stealthy healer.";
      difficulty = "medium";
      power = "Enhanced healing and stealth.";
      uniquePerks = ["perk3", "perk5"];
      isLicensed = false;
      releaseYear = 2017;
    },
    {
      id = "killer3";
      name = "The Huntress";
      role = #killer;
      bio = "Axe-throwing killer.";
      difficulty = "medium";
      power = "Throws hatchets for ranged attacks.";
      uniquePerks = ["perk6", "perk2"];
      isLicensed = false;
      releaseYear = 2018;
    },
    {
      id = "survivor3";
      name = "David King";
      role = #survivor;
      bio = "Tough and resilient.";
      difficulty = "hard";
      power = "Improved endurance and toughness.";
      uniquePerks = ["perk5", "perk1"];
      isLicensed = false;
      releaseYear = 2018;
    },
  ];
  let news : [NewsItem] = [
    {
      id = "news1";
      title = "Patch 1.0 Released!";
      description = "New content and bug fixes.";
      itemType = #update;
      publishedAt = "2023-12-01";
      author = "Dev Team";
    },
    {
      id = "news2";
      title = "Survivor Tips & Tricks";
      description = "Top 5 strategies for escaping.";
      itemType = #tip;
      publishedAt = "2023-12-02";
      author = "ExpertPlayer";
    },
    {
      id = "news3";
      title = "Killer Balance Patch";
      description = "Balance updates for killers.";
      itemType = #update;
      publishedAt = "2023-12-03";
      author = "Dev Team";
    },
    {
      id = "news4";
      title = "New Map Released";
      description = "Explore the latest map addition.";
      itemType = #release;
      publishedAt = "2023-12-04";
      author = "Map Designer";
    },
  ];
  let wikiEntries : [WikiEntry] = [
    {
      id = "wiki1";
      title = "Beginner's Guide";
      content = "Comprehensive overview for new players.";
      section = "guides";
      author = "ProGamer";
      lastUpdated = "2023-12-05";
    },
    {
      id = "wiki2";
      title = "Killer Strategies";
      content = "In-depth analysis of killer tactics.";
      section = "killer";
      author = "KillerExpert";
      lastUpdated = "2023-12-06";
    },
    {
      id = "wiki3";
      title = "Survivor Perks";
      content = "Detailed explanations and tier list.";
      section = "perks";
      author = "PerkMaster";
      lastUpdated = "2023-12-07";
    },
    {
      id = "wiki4";
      title = "Escaping Techniques";
      content = "Advanced maneuvers and paths.";
      section = "escapes";
      author = "EscapeArtist";
      lastUpdated = "2023-12-08";
    },
  ];

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Initialize user data store
  let userDataStore = Map.empty<Principal, StoredUserData>();

  // Initialize user profile store
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Admin Functions (game data)
  public shared ({ caller }) func getGlobalData() : async GameState {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage game data");
    };
    {
      news;
      perks;
      characters;
      wikiEntries;
    };
  };

  public query ({ caller }) func getNews() : async [NewsItem] {
    news;
  };

  public query ({ caller }) func getPerks() : async [Perk] {
    perks;
  };

  public query ({ caller }) func getCharacters() : async [Character] {
    characters;
  };

  public query ({ caller }) func getWikiEntries() : async [WikiEntry] {
    wikiEntries;
  };

  public shared ({ caller }) func getAllUserData() : async [(Principal, UserData)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage user data");
    };

    userDataStore.toArray().map(
      func((principal, storedUserData)) {
        (principal, StoredUserData.toUserData(storedUserData));
      }
    );
  };

  public query ({ caller }) func getUserDataByPrincipal(principal : Principal) : async UserData {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own data");
    };
    switch (userDataStore.get(principal)) {
      case (?userData) { StoredUserData.toUserData(userData) };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // User Functions (personal data)
  public shared ({ caller }) func saveUserData(data : UserData) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save personal data");
    };
    userDataStore.add(caller, StoredUserData.fromUserData(data));
  };

  public query ({ caller }) func getCallerData() : async UserData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their personal data");
    };
    switch (userDataStore.get(caller)) {
      case (?userData) { StoredUserData.toUserData(userData) };
      case (null) { Runtime.trap("No data found for user") };
    };
  };
};
