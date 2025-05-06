const SOUND_DATA = {
    availableSounds: [
        {
            id: 'rain',
            name: 'Rain',
            file: 'assets/rain.mp3',
            defaultVolume: 0.6
        },
        {
            id: 'waves',
            name: 'Ocean Waves',
            file: 'assets/waves.mp3',
            defaultVolume: 0.7
        },
        {
            id: 'fireplace',
            name: 'Fireplace',
            file: 'assets/fireplace.mp3',
            defaultVolume: 0.8
        },
        {
            id: 'white_noise',
            name: 'White Noise',
            file: 'assets/white_noise.mp3',
            defaultVolume: 0.4
        },
        {
            id: 'forest_ambience',
            name: 'Forest Ambience',
            file: 'assets/forest_ambience.mp3', // Assuming this file will be added
            defaultVolume: 0.65
        },
        {
            id: 'city_cafe',
            name: 'City Cafe',
            file: 'assets/city_cafe.mp3', // Assuming this file will be added
            defaultVolume: 0.5
        },
        {
            id: 'wind_chimes',
            name: 'Wind Chimes',
            file: 'assets/wind_chimes.mp3', // Assuming this file will be added
            defaultVolume: 0.55
        },
        {
            id: 'singing_bowl',
            name: 'Singing Bowl',
            file: 'assets/singing_bowl.mp3', // Assuming this file will be added
            defaultVolume: 0.7
        }
    ],
    presets: [
        {
            name: 'Forest Morning',
            sounds: {
                'rain': 0.3,
                'forest_ambience': 0.7,
                'wind_chimes': 0.4
            }
        },
        {
            name: 'Ocean Calm',
            sounds: {
                'waves': 0.8,
                'singing_bowl': 0.5
            }
        },
        {
            name: 'Cozy Fireside',
            sounds: {
                'fireplace': 0.9,
                'rain': 0.4
            }
        },
        {
            name: 'Focus Zone',
            sounds: {
                'white_noise': 0.5,
                'city_cafe': 0.3
            }
        },
        {
            name: 'Gentle Rain',
            sounds: {
                'rain': 0.7
            }
        }
    ]
};

// Note: Placeholder MP3 files (forest_ambience.mp3, city_cafe.mp3, wind_chimes.mp3, singing_bowl.mp3)
// are assumed to exist in the 'assets' folder for these presets to work fully.
// The initial project plan only listed rain, waves, fireplace, and white_noise.
// Added more for richer presets. If these files are not available,
// the presets using them will still load but those specific sounds won't play.