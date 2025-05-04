// IMPORTANT: In a real production application, NEVER expose your clientSecret in client-side JavaScript.
// This key should be kept secret on a backend server that proxies requests to the Spotify API.
// For this example project, we are including placeholders, but you MUST replace them AND
// understand the security implications. Consider using the Authorization Code Flow with PKCE
// and a backend if you need user-specific playlist creation.
const clientId = 'YOUR_SPOTIFY_CLIENT_ID'; // Replace with your Spotify Client ID
const clientSecret = 'YOUR_SPOTIFY_CLIENT_SECRET'; // Replace with your Spotify Client Secret

let accessToken = null;
let tokenExpiryTime = 0;

// Function to get Spotify Access Token (Client Credentials Flow)
async function getAccessToken() {
    // If we have a valid token, return it
    if (accessToken && Date.now() < tokenExpiryTime) {
        return accessToken;
    }

    // Otherwise, fetch a new token
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Spotify Auth Error:', errorData);
        throw new Error(`Spotify authentication failed: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry time slightly earlier than actual expiry to be safe (e.g., 5 minutes buffer)
    tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000;
    return accessToken;
}

// Maps moods to Spotify recommendation parameters
function mapMoodToParameters(mood) {
    const mappings = {
        happy: { seed_genres: ['pop', 'dance', 'happy'], target_valence: 0.8, target_energy: 0.7, target_danceability: 0.7 },
        sad: { seed_genres: ['sad', 'acoustic', 'blues', 'rainy-day'], target_valence: 0.2, target_energy: 0.3, target_mode: 0 },
        energetic: { seed_genres: ['electronic', 'rock', 'hip-hop', 'power-pop'], target_energy: 0.9, target_danceability: 0.8, min_tempo: 120 },
        relaxed: { seed_genres: ['chill', 'ambient', 'acoustic', 'sleep'], target_valence: 0.5, target_energy: 0.2, target_acousticness: 0.8 },
        focused: { seed_genres: ['ambient', 'classical', 'instrumental', 'study'], target_energy: 0.3, target_instrumentalness: 0.8, target_speechiness: 0.1 },
        romantic: { seed_genres: ['r-n-b', 'soul', 'romance', 'love'], target_valence: 0.6, target_energy: 0.5, target_mode: 1 },
        angry: { seed_genres: ['metal', 'hard-rock', 'punk', 'industrial'], target_energy: 0.9, target_valence: 0.2, max_loudness: -5 },
        chill: { seed_genres: ['chill', 'lo-fi', 'jazz', 'trip-hop'], target_energy: 0.4, target_danceability: 0.5, target_acousticness: 0.6 }
    };
    return mappings[mood.toLowerCase()] || { seed_genres: ['pop'], target_valence: 0.5, target_energy: 0.5 }; // Default fallback
}

// Function to search for artist IDs
async function searchArtistIds(artistNames, token) {
    if (!artistNames || artistNames.length === 0) return [];

    const searchPromises = artistNames.slice(0, 2).map(async (name) => { // Limit artist seeds to avoid complexity
        const query = encodeURIComponent(`artist:"${name}"`);
        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            console.warn(`Failed to search for artist: ${name}`);
            return null;
        }
        const data = await response.json();
        return data.artists?.items[0]?.id || null;
    });

    const ids = await Promise.all(searchPromises);
    return ids.filter(id => id !== null); // Filter out nulls (failed searches)
}


// Main function to generate playlist recommendations
async function generatePlaylist(mood, preferredGenres = [], preferredArtists = []) {
    if (!clientId || clientId === 'YOUR_SPOTIFY_CLIENT_ID' || !clientSecret || clientSecret === 'YOUR_SPOTIFY_CLIENT_SECRET') {
       throw new Error("Spotify API credentials are not configured in js/api.js. Please add your Client ID and Secret.");
    }

    const token = await getAccessToken();
    const moodParams = mapMoodToParameters(mood);

    let seed_genres = [...new Set([...(preferredGenres || []), ...(moodParams.seed_genres || [])])];
    let seed_artists = [];

    if (preferredArtists && preferredArtists.length > 0) {
        seed_artists = await searchArtistIds(preferredArtists, token);
    }

    // Spotify API limits seeds to 5 total (genres + artists + tracks)
    const totalSeeds = seed_genres.length + seed_artists.length;
    if (totalSeeds > 5) {
        // Prioritize artists, then preferred genres, then mood genres
        const availableSlots = 5;
        let currentArtists = seed_artists.slice(0, availableSlots);
        let remainingSlots = availableSlots - currentArtists.length;
        let currentGenres = seed_genres.slice(0, remainingSlots);
        seed_artists = currentArtists;
        seed_genres = currentGenres;
    } else if (totalSeeds === 0) {
         // Fallback if no seeds could be determined (e.g., invalid mood, no prefs)
         seed_genres = ['pop']; // Default seed
    }


    const limit = 20; // Number of tracks to recommend
    const market = 'from_token'; // Use user's market or default if token has no user info

    const queryParams = new URLSearchParams({
        limit: limit.toString(),
        market: market,
        ...moodParams // Spread mood-based audio feature targets
    });

    if (seed_genres.length > 0) queryParams.set('seed_genres', seed_genres.join(','));
    if (seed_artists.length > 0) queryParams.set('seed_artists', seed_artists.join(','));
    // We are not using seed_tracks in this implementation

    const recommendationsUrl = `https://api.spotify.com/v1/recommendations?${queryParams.toString()}`;

    const response = await fetch(recommendationsUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Spotify Recommendation Error:', errorData);
        throw new Error(`Failed to get recommendations: ${errorData.error?.message || response.statusText}`);
    }

    const recommendations = await response.json();

    // Simulate playlist structure for the frontend
    // We aren't creating an actual playlist, just providing track data and a link to the first track.
    return {
        tracks: recommendations.tracks || [],
        external_urls: {
            // Provide a link to the first track on Spotify as a starting point
            spotify: recommendations.tracks?.[0]?.external_urls?.spotify || '#'
        }
    };
}