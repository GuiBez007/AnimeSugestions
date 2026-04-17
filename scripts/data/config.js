// Status Map for Icons and Labels (Global)
export const DEFAULT_ICONS = {
    'all': '🌐',
    'seen': '✔',
    'watched': '✔',
    'played': '✔',
    'read': '✔',
    'listened': '✔',
    'to-watch': '⏳',
    'to-play': '🎮',
    'to-read': '📖',
    'to-listen': '🎧',
    'hyped': '🔥',
    // YouTube Specific
    'channel': '📺',
    'react-channel': '🎭',
    'playlist': '📜',
    'react-playlist': '🍿',
    'interesting': '💡',
    'favorite': '⭐',
    'singleplayer': '👤',
    'multiplayer': '👥',
    'mobile': '📱',
    'endless': '∞'
};

export const DEFAULT_LABELS = {
    'all': 'All Items',
    'seen': 'Finished',
    'watched': 'Watched',
    'played': 'Played',
    'read': 'Read',
    'listened': 'Listened',
    'to-watch': 'To Watch',
    'to-play': 'To Play',
    'to-read': 'To Read',
    'to-listen': 'To Listen',
    'hyped': 'Hyped',
    // YouTube Specific
    'channel': 'Channels',
    'react-channel': 'React Channels',
    'playlist': 'Playlists',
    'react-playlist': 'React Playlists',
    'interesting': 'Interesting',
    'favorite': 'Favorites',
    'singleplayer': 'Singleplayer',
    'multiplayer': 'Multiplayer',
    'mobile': 'Mobile',
    'endless': 'Endless Gameplay'
};

export const PT_LABELS = {
    'all': 'Todos',
    'seen': 'Finalizados',
    'watched': 'Assistidos',
    'played': 'Jogados',
    'read': 'Lidos',
    'listened': 'Ouvidos',
    'to-watch': 'Para Assistir',
    'to-play': 'Para Jogar',
    'to-read': 'Para Ler',
    'to-listen': 'Para Ouvir',
    'hyped': 'No Hype',
    // YouTube Specific
    'channel': 'Canais',
    'react-channel': 'Canais de React',
    'playlist': 'Playlists',
    'react-playlist': 'Playlists de React',
    'interesting': 'Interessantes',
    'favorite': 'Favoritos',
    'singleplayer': 'Singleplayer',
    'multiplayer': 'Multiplayer',
    'mobile': 'Mobile',
    'endless': 'Gameplay Infinita'
};

// Define which status keys are active/visible per category
export const CATEGORY_FILTERS = {
    'games': ['all', 'played', 'to-play', 'hyped', 'favorite', 'singleplayer', 'multiplayer', 'mobile', 'endless'],
    'anime': ['all', 'watched', 'to-watch', 'hyped', 'favorite'],
    'series': ['all', 'watched', 'to-watch', 'hyped', 'favorite'],
    'movies': ['all', 'watched', 'to-watch', 'hyped', 'favorite'],
    'books': ['all', 'read', 'to-read', 'hyped', 'favorite'],
    'music': ['all', 'listened', 'to-listen', 'hyped', 'favorite'],
    'youtube': ['all', 'channel', 'react-channel', 'playlist', 'react-playlist', 'interesting', 'favorite']
};
