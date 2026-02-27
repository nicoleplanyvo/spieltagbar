// Team-Logo-Mapping und Länderflaggen-Utility
// Verwendet die kostenlose API von transfermarkt-images via logo.clearbit.com Fallback
// und Emoji-Flaggen für Nationalmannschaften

// Mapping: Team-Name -> Logo-URL (Bundesliga, 2. Bundesliga, Top-Clubs)
// Logos via api.sofascore.app (öffentlich zugängliche Team-Logos)
const TEAM_LOGOS: Record<string, string> = {
  // Bundesliga
  "FC Bayern München": "https://tmssl.akamaized.net/images/wappen/head/27.png",
  "Bayern München": "https://tmssl.akamaized.net/images/wappen/head/27.png",
  "Borussia Dortmund": "https://tmssl.akamaized.net/images/wappen/head/16.png",
  "BVB": "https://tmssl.akamaized.net/images/wappen/head/16.png",
  "Bayer Leverkusen": "https://tmssl.akamaized.net/images/wappen/head/15.png",
  "Bayer 04 Leverkusen": "https://tmssl.akamaized.net/images/wappen/head/15.png",
  "RB Leipzig": "https://tmssl.akamaized.net/images/wappen/head/23826.png",
  "VfB Stuttgart": "https://tmssl.akamaized.net/images/wappen/head/79.png",
  "Eintracht Frankfurt": "https://tmssl.akamaized.net/images/wappen/head/24.png",
  "SC Freiburg": "https://tmssl.akamaized.net/images/wappen/head/60.png",
  "VfL Wolfsburg": "https://tmssl.akamaized.net/images/wappen/head/82.png",
  "1. FC Union Berlin": "https://tmssl.akamaized.net/images/wappen/head/89.png",
  "Union Berlin": "https://tmssl.akamaized.net/images/wappen/head/89.png",
  "TSG Hoffenheim": "https://tmssl.akamaized.net/images/wappen/head/533.png",
  "1899 Hoffenheim": "https://tmssl.akamaized.net/images/wappen/head/533.png",
  "SV Werder Bremen": "https://tmssl.akamaized.net/images/wappen/head/86.png",
  "Werder Bremen": "https://tmssl.akamaized.net/images/wappen/head/86.png",
  "FC Augsburg": "https://tmssl.akamaized.net/images/wappen/head/167.png",
  "1. FSV Mainz 05": "https://tmssl.akamaized.net/images/wappen/head/39.png",
  "Mainz 05": "https://tmssl.akamaized.net/images/wappen/head/39.png",
  "Borussia Mönchengladbach": "https://tmssl.akamaized.net/images/wappen/head/18.png",
  "Gladbach": "https://tmssl.akamaized.net/images/wappen/head/18.png",
  "1. FC Heidenheim": "https://tmssl.akamaized.net/images/wappen/head/2036.png",
  "FC St. Pauli": "https://tmssl.akamaized.net/images/wappen/head/35.png",
  "St. Pauli": "https://tmssl.akamaized.net/images/wappen/head/35.png",
  "Holstein Kiel": "https://tmssl.akamaized.net/images/wappen/head/510.png",
  // 2. Bundesliga & bekannte Clubs
  "Fortuna Düsseldorf": "https://tmssl.akamaized.net/images/wappen/head/38.png",
  "1. FC Köln": "https://tmssl.akamaized.net/images/wappen/head/3.png",
  "FC Köln": "https://tmssl.akamaized.net/images/wappen/head/3.png",
  "Schalke 04": "https://tmssl.akamaized.net/images/wappen/head/33.png",
  "FC Schalke 04": "https://tmssl.akamaized.net/images/wappen/head/33.png",
  "Hamburger SV": "https://tmssl.akamaized.net/images/wappen/head/41.png",
  "HSV": "https://tmssl.akamaized.net/images/wappen/head/41.png",
  "Hertha BSC": "https://tmssl.akamaized.net/images/wappen/head/44.png",
  "1. FC Nürnberg": "https://tmssl.akamaized.net/images/wappen/head/4.png",
  "Hannover 96": "https://tmssl.akamaized.net/images/wappen/head/42.png",
  "SV Darmstadt 98": "https://tmssl.akamaized.net/images/wappen/head/105.png",
  "Karlsruher SC": "https://tmssl.akamaized.net/images/wappen/head/37.png",
  "SC Paderborn 07": "https://tmssl.akamaized.net/images/wappen/head/127.png",
  "SpVgg Greuther Fürth": "https://tmssl.akamaized.net/images/wappen/head/110.png",
  "1. FC Kaiserslautern": "https://tmssl.akamaized.net/images/wappen/head/2.png",
  "Eintracht Braunschweig": "https://tmssl.akamaized.net/images/wappen/head/12.png",
  // 3. Liga
  "SV Sandhausen": "https://tmssl.akamaized.net/images/wappen/head/3800.png",
  "Dynamo Dresden": "https://tmssl.akamaized.net/images/wappen/head/68.png",
  "SG Dynamo Dresden": "https://tmssl.akamaized.net/images/wappen/head/68.png",
  "1860 München": "https://tmssl.akamaized.net/images/wappen/head/72.png",
  "TSV 1860 München": "https://tmssl.akamaized.net/images/wappen/head/72.png",
  "Hansa Rostock": "https://tmssl.akamaized.net/images/wappen/head/128.png",
  "FC Hansa Rostock": "https://tmssl.akamaized.net/images/wappen/head/128.png",
  "MSV Duisburg": "https://tmssl.akamaized.net/images/wappen/head/8.png",
  "SV Wehen Wiesbaden": "https://tmssl.akamaized.net/images/wappen/head/294.png",
  "VfL Osnabrück": "https://tmssl.akamaized.net/images/wappen/head/71.png",
  "Rot-Weiss Essen": "https://tmssl.akamaized.net/images/wappen/head/54.png",
  "SC Verl": "https://tmssl.akamaized.net/images/wappen/head/3753.png",
  "Erzgebirge Aue": "https://tmssl.akamaized.net/images/wappen/head/61.png",
  "FC Erzgebirge Aue": "https://tmssl.akamaized.net/images/wappen/head/61.png",
  "SV Waldhof Mannheim": "https://tmssl.akamaized.net/images/wappen/head/209.png",
  "Waldhof Mannheim": "https://tmssl.akamaized.net/images/wappen/head/209.png",
  "FC Ingolstadt 04": "https://tmssl.akamaized.net/images/wappen/head/2839.png",
  "Borussia Dortmund II": "https://tmssl.akamaized.net/images/wappen/head/16.png",
  "Arminia Bielefeld": "https://tmssl.akamaized.net/images/wappen/head/10.png",
  "DSC Arminia Bielefeld": "https://tmssl.akamaized.net/images/wappen/head/10.png",
  "FC Viktoria Köln": "https://tmssl.akamaized.net/images/wappen/head/995.png",
  "Viktoria Köln": "https://tmssl.akamaized.net/images/wappen/head/995.png",
  "SV 07 Elversberg": "https://tmssl.akamaized.net/images/wappen/head/3271.png",
  "SV Elversberg": "https://tmssl.akamaized.net/images/wappen/head/3271.png",
  "SpVgg Unterhaching": "https://tmssl.akamaized.net/images/wappen/head/330.png",
  "Energie Cottbus": "https://tmssl.akamaized.net/images/wappen/head/159.png",
  "FC Energie Cottbus": "https://tmssl.akamaized.net/images/wappen/head/159.png",
  "Alemannia Aachen": "https://tmssl.akamaized.net/images/wappen/head/52.png",
  // International (Champions League, Europa League etc.)
  "Real Madrid": "https://tmssl.akamaized.net/images/wappen/head/418.png",
  "FC Barcelona": "https://tmssl.akamaized.net/images/wappen/head/131.png",
  "Barcelona": "https://tmssl.akamaized.net/images/wappen/head/131.png",
  "Manchester City": "https://tmssl.akamaized.net/images/wappen/head/281.png",
  "Man City": "https://tmssl.akamaized.net/images/wappen/head/281.png",
  "Manchester United": "https://tmssl.akamaized.net/images/wappen/head/985.png",
  "Man United": "https://tmssl.akamaized.net/images/wappen/head/985.png",
  "Liverpool FC": "https://tmssl.akamaized.net/images/wappen/head/31.png",
  "Liverpool": "https://tmssl.akamaized.net/images/wappen/head/31.png",
  "Arsenal FC": "https://tmssl.akamaized.net/images/wappen/head/11.png",
  "Arsenal": "https://tmssl.akamaized.net/images/wappen/head/11.png",
  "Chelsea FC": "https://tmssl.akamaized.net/images/wappen/head/631.png",
  "Chelsea": "https://tmssl.akamaized.net/images/wappen/head/631.png",
  "Tottenham Hotspur": "https://tmssl.akamaized.net/images/wappen/head/148.png",
  "Tottenham": "https://tmssl.akamaized.net/images/wappen/head/148.png",
  "Newcastle United": "https://tmssl.akamaized.net/images/wappen/head/762.png",
  "Newcastle": "https://tmssl.akamaized.net/images/wappen/head/762.png",
  "Aston Villa": "https://tmssl.akamaized.net/images/wappen/head/405.png",
  "West Ham United": "https://tmssl.akamaized.net/images/wappen/head/379.png",
  "West Ham": "https://tmssl.akamaized.net/images/wappen/head/379.png",
  "Brighton & Hove Albion": "https://tmssl.akamaized.net/images/wappen/head/1237.png",
  "Brighton": "https://tmssl.akamaized.net/images/wappen/head/1237.png",
  "Wolverhampton Wanderers": "https://tmssl.akamaized.net/images/wappen/head/543.png",
  "Wolverhampton": "https://tmssl.akamaized.net/images/wappen/head/543.png",
  "Nottingham Forest": "https://tmssl.akamaized.net/images/wappen/head/703.png",
  "Fulham FC": "https://tmssl.akamaized.net/images/wappen/head/931.png",
  "Fulham": "https://tmssl.akamaized.net/images/wappen/head/931.png",
  "Everton FC": "https://tmssl.akamaized.net/images/wappen/head/29.png",
  "Everton": "https://tmssl.akamaized.net/images/wappen/head/29.png",
  "Crystal Palace": "https://tmssl.akamaized.net/images/wappen/head/873.png",
  "Brentford FC": "https://tmssl.akamaized.net/images/wappen/head/1148.png",
  "Brentford": "https://tmssl.akamaized.net/images/wappen/head/1148.png",
  "AFC Bournemouth": "https://tmssl.akamaized.net/images/wappen/head/989.png",
  "Bournemouth": "https://tmssl.akamaized.net/images/wappen/head/989.png",
  // Spanien (La Liga)
  "Atlético Madrid": "https://tmssl.akamaized.net/images/wappen/head/13.png",
  "Atletico Madrid": "https://tmssl.akamaized.net/images/wappen/head/13.png",
  "Real Sociedad": "https://tmssl.akamaized.net/images/wappen/head/681.png",
  "Real Betis": "https://tmssl.akamaized.net/images/wappen/head/150.png",
  "Athletic Bilbao": "https://tmssl.akamaized.net/images/wappen/head/621.png",
  "FC Villarreal": "https://tmssl.akamaized.net/images/wappen/head/1050.png",
  "Villarreal": "https://tmssl.akamaized.net/images/wappen/head/1050.png",
  "FC Sevilla": "https://tmssl.akamaized.net/images/wappen/head/368.png",
  "Sevilla": "https://tmssl.akamaized.net/images/wappen/head/368.png",
  "FC Valencia": "https://tmssl.akamaized.net/images/wappen/head/1049.png",
  "Valencia": "https://tmssl.akamaized.net/images/wappen/head/1049.png",
  "RC Celta Vigo": "https://tmssl.akamaized.net/images/wappen/head/940.png",
  "Celta Vigo": "https://tmssl.akamaized.net/images/wappen/head/940.png",
  "RCD Mallorca": "https://tmssl.akamaized.net/images/wappen/head/237.png",
  "FC Girona": "https://tmssl.akamaized.net/images/wappen/head/12321.png",
  "Girona": "https://tmssl.akamaized.net/images/wappen/head/12321.png",
  // Italien (Serie A)
  "Paris Saint-Germain": "https://tmssl.akamaized.net/images/wappen/head/583.png",
  "PSG": "https://tmssl.akamaized.net/images/wappen/head/583.png",
  "AC Milan": "https://tmssl.akamaized.net/images/wappen/head/5.png",
  "AC Mailand": "https://tmssl.akamaized.net/images/wappen/head/5.png",
  "Inter Mailand": "https://tmssl.akamaized.net/images/wappen/head/46.png",
  "Inter Milan": "https://tmssl.akamaized.net/images/wappen/head/46.png",
  "Juventus Turin": "https://tmssl.akamaized.net/images/wappen/head/506.png",
  "Juventus": "https://tmssl.akamaized.net/images/wappen/head/506.png",
  "SSC Neapel": "https://tmssl.akamaized.net/images/wappen/head/6195.png",
  "Napoli": "https://tmssl.akamaized.net/images/wappen/head/6195.png",
  "AS Rom": "https://tmssl.akamaized.net/images/wappen/head/12.png",
  "AS Roma": "https://tmssl.akamaized.net/images/wappen/head/12.png",
  "Lazio Rom": "https://tmssl.akamaized.net/images/wappen/head/398.png",
  "SS Lazio": "https://tmssl.akamaized.net/images/wappen/head/398.png",
  "Atalanta Bergamo": "https://tmssl.akamaized.net/images/wappen/head/800.png",
  "Atalanta": "https://tmssl.akamaized.net/images/wappen/head/800.png",
  "AC Florenz": "https://tmssl.akamaized.net/images/wappen/head/430.png",
  "ACF Fiorentina": "https://tmssl.akamaized.net/images/wappen/head/430.png",
  "FC Bologna": "https://tmssl.akamaized.net/images/wappen/head/1025.png",
  "FC Turin": "https://tmssl.akamaized.net/images/wappen/head/416.png",
  "Torino": "https://tmssl.akamaized.net/images/wappen/head/416.png",
  // Frankreich (Ligue 1)
  "Olympique Marseille": "https://tmssl.akamaized.net/images/wappen/head/244.png",
  "AS Monaco": "https://tmssl.akamaized.net/images/wappen/head/162.png",
  "OGC Nizza": "https://tmssl.akamaized.net/images/wappen/head/417.png",
  "OGC Nice": "https://tmssl.akamaized.net/images/wappen/head/417.png",
  "Olympique Lyon": "https://tmssl.akamaized.net/images/wappen/head/1041.png",
  "Stade Rennais": "https://tmssl.akamaized.net/images/wappen/head/273.png",
  "LOSC Lille": "https://tmssl.akamaized.net/images/wappen/head/1082.png",
  "RC Lens": "https://tmssl.akamaized.net/images/wappen/head/826.png",
  "Stade Brest": "https://tmssl.akamaized.net/images/wappen/head/3911.png",
  // Niederlande (Eredivisie)
  "Ajax Amsterdam": "https://tmssl.akamaized.net/images/wappen/head/610.png",
  "PSV Eindhoven": "https://tmssl.akamaized.net/images/wappen/head/383.png",
  "PSV": "https://tmssl.akamaized.net/images/wappen/head/383.png",
  "Feyenoord Rotterdam": "https://tmssl.akamaized.net/images/wappen/head/234.png",
  "Feyenoord": "https://tmssl.akamaized.net/images/wappen/head/234.png",
  "AZ Alkmaar": "https://tmssl.akamaized.net/images/wappen/head/1090.png",
  "FC Twente Enschede": "https://tmssl.akamaized.net/images/wappen/head/317.png",
  "FC Twente": "https://tmssl.akamaized.net/images/wappen/head/317.png",
  // Österreich
  "Red Bull Salzburg": "https://tmssl.akamaized.net/images/wappen/head/409.png",
  "RB Salzburg": "https://tmssl.akamaized.net/images/wappen/head/409.png",
  "SK Sturm Graz": "https://tmssl.akamaized.net/images/wappen/head/302.png",
  "Sturm Graz": "https://tmssl.akamaized.net/images/wappen/head/302.png",
  "SK Rapid Wien": "https://tmssl.akamaized.net/images/wappen/head/336.png",
  "Rapid Wien": "https://tmssl.akamaized.net/images/wappen/head/336.png",
  "FK Austria Wien": "https://tmssl.akamaized.net/images/wappen/head/142.png",
  "Austria Wien": "https://tmssl.akamaized.net/images/wappen/head/142.png",
  "LASK": "https://tmssl.akamaized.net/images/wappen/head/1107.png",
  // Schweiz
  "BSC Young Boys": "https://tmssl.akamaized.net/images/wappen/head/2466.png",
  "Young Boys": "https://tmssl.akamaized.net/images/wappen/head/2466.png",
  "FC Basel": "https://tmssl.akamaized.net/images/wappen/head/26.png",
  "FC Zürich": "https://tmssl.akamaized.net/images/wappen/head/995.png",
  "Servette FC": "https://tmssl.akamaized.net/images/wappen/head/396.png",
  "FC Lugano": "https://tmssl.akamaized.net/images/wappen/head/2753.png",
  "FC St. Gallen": "https://tmssl.akamaized.net/images/wappen/head/1733.png",
  // Weitere Europäische Top-Clubs
  "Benfica Lissabon": "https://tmssl.akamaized.net/images/wappen/head/294.png",
  "SL Benfica": "https://tmssl.akamaized.net/images/wappen/head/294.png",
  "FC Porto": "https://tmssl.akamaized.net/images/wappen/head/720.png",
  "Sporting Lissabon": "https://tmssl.akamaized.net/images/wappen/head/336.png",
  "Sporting CP": "https://tmssl.akamaized.net/images/wappen/head/336.png",
  "Celtic Glasgow": "https://tmssl.akamaized.net/images/wappen/head/371.png",
  "Celtic FC": "https://tmssl.akamaized.net/images/wappen/head/371.png",
  "Rangers FC": "https://tmssl.akamaized.net/images/wappen/head/124.png",
  "Glasgow Rangers": "https://tmssl.akamaized.net/images/wappen/head/124.png",
  "Galatasaray Istanbul": "https://tmssl.akamaized.net/images/wappen/head/141.png",
  "Galatasaray": "https://tmssl.akamaized.net/images/wappen/head/141.png",
  "Fenerbahçe Istanbul": "https://tmssl.akamaized.net/images/wappen/head/36.png",
  "Fenerbahçe": "https://tmssl.akamaized.net/images/wappen/head/36.png",
  "Beşiktaş Istanbul": "https://tmssl.akamaized.net/images/wappen/head/114.png",
  "Club Brügge": "https://tmssl.akamaized.net/images/wappen/head/137.png",
  "Club Brugge": "https://tmssl.akamaized.net/images/wappen/head/137.png",
  "RSC Anderlecht": "https://tmssl.akamaized.net/images/wappen/head/58.png",
  "Anderlecht": "https://tmssl.akamaized.net/images/wappen/head/58.png",
  "FC Kopenhagen": "https://tmssl.akamaized.net/images/wappen/head/1075.png",
  "Roter Stern Belgrad": "https://tmssl.akamaized.net/images/wappen/head/159.png",
  "Roter Stern": "https://tmssl.akamaized.net/images/wappen/head/159.png",
  "Schachtar Donezk": "https://tmssl.akamaized.net/images/wappen/head/660.png",
  "Shakhtar Donetsk": "https://tmssl.akamaized.net/images/wappen/head/660.png",
};

// Nationalmannschaften -> Emoji-Flaggen
const COUNTRY_FLAGS: Record<string, string> = {
  "Deutschland": "🇩🇪",
  "Frankreich": "🇫🇷",
  "Spanien": "🇪🇸",
  "Italien": "🇮🇹",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Niederlande": "🇳🇱",
  "Holland": "🇳🇱",
  "Portugal": "🇵🇹",
  "Belgien": "🇧🇪",
  "Kroatien": "🇭🇷",
  "Schweiz": "🇨🇭",
  "Österreich": "🇦🇹",
  "Polen": "🇵🇱",
  "Dänemark": "🇩🇰",
  "Schweden": "🇸🇪",
  "Norwegen": "🇳🇴",
  "Tschechien": "🇨🇿",
  "Türkei": "🇹🇷",
  "Ukraine": "🇺🇦",
  "Schottland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Irland": "🇮🇪",
  "Serbien": "🇷🇸",
  "Ungarn": "🇭🇺",
  "Rumänien": "🇷🇴",
  "Griechenland": "🇬🇷",
  "Slowakei": "🇸🇰",
  "Slowenien": "🇸🇮",
  "Albanien": "🇦🇱",
  "Georgien": "🇬🇪",
  "Finnland": "🇫🇮",
  "Island": "🇮🇸",
  "Nordmazedonien": "🇲🇰",
  "Bosnien-Herzegowina": "🇧🇦",
  "Montenegro": "🇲🇪",
  "Bulgarien": "🇧🇬",
  "Argentinien": "🇦🇷",
  "Brasilien": "🇧🇷",
  "Uruguay": "🇺🇾",
  "Kolumbien": "🇨🇴",
  "Mexiko": "🇲🇽",
  "USA": "🇺🇸",
  "Japan": "🇯🇵",
  "Südkorea": "🇰🇷",
  "Australien": "🇦🇺",
  "Marokko": "🇲🇦",
  "Senegal": "🇸🇳",
  "Nigeria": "🇳🇬",
  "Kamerun": "🇨🇲",
  "Ghana": "🇬🇭",
  "Ägypten": "🇪🇬",
  "Tunesien": "🇹🇳",
  "Saudi-Arabien": "🇸🇦",
};

// Ligen die auf Länderspiele hinweisen
const INTERNATIONAL_LEAGUES = [
  "EM",
  "WM",
  "EM-Quali",
  "WM-Quali",
  "Nations League",
  "Freundschaftsspiel",
  "Länderspiel",
  "UEFA Nations League",
  "FIFA WM",
  "UEFA EM",
];

/**
 * Prüft ob ein Spiel ein Länderspiel ist (anhand der Liga)
 */
export function isLaenderspiel(liga: string): boolean {
  return INTERNATIONAL_LEAGUES.some(
    (l) => liga.toLowerCase().includes(l.toLowerCase())
  );
}

/**
 * Gibt die Logo-URL für ein Team zurück, oder null wenn nicht gefunden
 */
export function getTeamLogo(teamName: string): string | null {
  return TEAM_LOGOS[teamName] || null;
}

/**
 * Gibt die Emoji-Flagge für eine Nationalmannschaft zurück, oder null
 */
export function getCountryFlag(teamName: string): string | null {
  return COUNTRY_FLAGS[teamName] || null;
}

/**
 * Gibt entweder ein Logo-URL oder eine Emoji-Flagge zurück
 * Logik: Bei Länderspielen (anhand Liga) -> Flagge, sonst -> Logo
 */
export function getTeamBadge(
  teamName: string,
  liga?: string
): { type: "logo"; url: string } | { type: "flag"; emoji: string } | null {
  // Bei Länderspielen: Flagge bevorzugen
  if (liga && isLaenderspiel(liga)) {
    const flag = getCountryFlag(teamName);
    if (flag) return { type: "flag", emoji: flag };
  }

  // Vereins-Logo
  const logo = getTeamLogo(teamName);
  if (logo) return { type: "logo", url: logo };

  // Fallback: Vielleicht ist es eine Nationalmannschaft auch ohne "Länderspiel"-Liga
  const flag = getCountryFlag(teamName);
  if (flag) return { type: "flag", emoji: flag };

  return null;
}
