import axios from 'axios';
// Define social media platforms and their URLs
const PLATFORMS = {
    twitter: {
        name: 'Twitter/X',
        url: (username) => `https://twitter.com/${username}`,
        checkUrl: (username) => `https://api.twitter.com/2/users/by/username/${username}`,
        pattern: /^[a-zA-Z0-9_]{1,15}$/
    },
    github: {
        name: 'GitHub',
        url: (username) => `https://github.com/${username}`,
        checkUrl: (username) => `https://api.github.com/users/${username}`,
        pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/
    },
    instagram: {
        name: 'Instagram',
        url: (username) => `https://instagram.com/${username}`,
        checkUrl: (username) => `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        pattern: /^[a-zA-Z0-9_.]{1,30}$/
    },
    linkedin: {
        name: 'LinkedIn',
        url: (username) => `https://linkedin.com/in/${username}`,
        checkUrl: (username) => `https://www.linkedin.com/in/${username}`,
        pattern: /^[a-zA-Z0-9-]{3,100}$/
    },
    tiktok: {
        name: 'TikTok',
        url: (username) => `https://tiktok.com/@${username}`,
        checkUrl: (username) => `https://www.tiktok.com/@${username}`,
        pattern: /^[a-zA-Z0-9_.]{1,24}$/
    },
    reddit: {
        name: 'Reddit',
        url: (username) => `https://reddit.com/user/${username}`,
        checkUrl: (username) => `https://www.reddit.com/user/${username}/about.json`,
        pattern: /^[a-zA-Z0-9_-]{1,20}$/
    },
    youtube: {
        name: 'YouTube',
        url: (username) => `https://youtube.com/@${username}`,
        checkUrl: (username) => `https://www.youtube.com/@${username}`,
        pattern: /^[a-zA-Z0-9_-]{1,30}$/
    },
    twitch: {
        name: 'Twitch',
        url: (username) => `https://twitch.tv/${username}`,
        checkUrl: (username) => `https://api.twitch.tv/kraken/users/${username}`,
        pattern: /^[a-zA-Z0-9_]{4,25}$/
    },
    snapchat: {
        name: 'Snapchat',
        url: (username) => `https://snapchat.com/add/${username}`,
        checkUrl: (username) => `https://www.snapchat.com/add/${username}`,
        pattern: /^[a-zA-Z0-9._-]{1,32}$/
    },
    discord: {
        name: 'Discord',
        url: (username) => `https://discordapp.com/users/${username}`,
        checkUrl: (username) => `https://discordapp.com/api/users/${username}`,
        pattern: /^[a-zA-Z0-9_]{2,32}$/
    },
    mastodon: {
        name: 'Mastodon',
        url: (username) => `https://mastodon.social/@${username}`,
        checkUrl: (username) => `https://mastodon.social/.well-known/webfinger?resource=acct:${username}@mastodon.social`,
        pattern: /^[a-zA-Z0-9_]{1,30}$/
    },
    medium: {
        name: 'Medium',
        url: (username) => `https://medium.com/@${username}`,
        checkUrl: (username) => `https://medium.com/@${username}`,
        pattern: /^[a-zA-Z0-9_-]{1,50}$/
    }
};
// Adult / subscription platforms (added on user request)
Object.assign(PLATFORMS, {
    onlyfans: {
        name: 'OnlyFans',
        url: (username) => `https://onlyfans.com/${username}`,
        checkUrl: (username) => `https://onlyfans.com/${username}`,
        pattern: /^[a-zA-Z0-9_.-]{1,50}$/
    },
    privix: {
        name: 'Privix',
        url: (username) => `https://privix.com/${username}`,
        checkUrl: (username) => `https://privix.com/${username}`,
        pattern: /^[a-zA-Z0-9_.-]{1,50}$/
    },
    pornhub: {
        name: 'Pornhub',
        url: (username) => `https://www.pornhub.com/model/${username}`,
        checkUrl: (username) => `https://www.pornhub.com/model/${username}`,
        pattern: /^[a-zA-Z0-9_-]{1,50}$/
    },
    subscribeadult: {
        name: 'SubscribeAdult',
        url: (username) => `https://subscribeadult.com/${username}`,
        checkUrl: (username) => `https://subscribeadult.com/${username}`,
        pattern: /^[a-zA-Z0-9_.-]{1,50}$/
    }
});
// Additional adult/subscription platforms and patronage sites
Object.assign(PLATFORMS, {
    patreon: {
        name: 'Patreon',
        url: (username) => `https://www.patreon.com/${username}`,
        checkUrl: (username) => `https://www.patreon.com/${username}`,
        pattern: /^[a-zA-Z0-9_-]{1,50}$/
    },
    fansly: {
        name: 'Fansly',
        url: (username) => `https://fansly.com/${username}`,
        checkUrl: (username) => `https://fansly.com/${username}`,
        pattern: /^[a-zA-Z0-9_.-]{1,50}$/
    },
    justforfans: {
        name: 'JustFor.Fans',
        url: (username) => `https://justfor.fans/${username}`,
        checkUrl: (username) => `https://justfor.fans/${username}`,
        pattern: /^[a-zA-Z0-9_.-]{1,50}$/
    },
    manyvids: {
        name: 'ManyVids',
        url: (username) => `https://www.manyvids.com/Profile/${username}`,
        checkUrl: (username) => `https://www.manyvids.com/Profile/${username}`,
        pattern: /^[a-zA-Z0-9_.-]{1,50}$/
    }
});
async function checkProfileExists(platform, username) {
    const platformConfig = PLATFORMS[platform];
    if (!platformConfig) {
        return {
            platform,
            username,
            exists: false,
            url: '',
            profileFound: false,
            timestamp: new Date()
        };
    }
    const url = platformConfig.url(username);
    try {
        // Attempt to fetch the profile via HTTP
        const response = await axios.head(url, {
            timeout: 5000,
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const exists = response.status >= 200 && response.status < 400;
        return {
            platform: platformConfig.name,
            username,
            exists,
            url,
            profileFound: exists,
            statusCode: response.status,
            timestamp: new Date()
        };
    }
    catch (error) {
        // If HEAD request fails, try GET
        try {
            const response = await axios.get(url, {
                timeout: 5000,
                maxRedirects: 5,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const exists = response.status >= 200 && response.status < 400;
            return {
                platform: platformConfig.name,
                username,
                exists,
                url,
                profileFound: exists,
                statusCode: response.status,
                timestamp: new Date()
            };
        }
        catch {
            // Profile likely doesn't exist
            return {
                platform: platformConfig.name,
                username,
                exists: false,
                url,
                profileFound: false,
                timestamp: new Date()
            };
        }
    }
}
export async function lookupUsername(username, platformsToSearch) {
    // Validate username
    if (!username || username.length < 1 || username.length > 100) {
        throw new Error('Username must be between 1 and 100 characters');
    }
    // Remove @ if present
    const cleanUsername = username.replace(/^@/, '');
    // Determine which platforms to search
    const platformsToCheck = platformsToSearch || Object.keys(PLATFORMS);
    // Search all platforms concurrently with rate limiting
    const results = await Promise.all(platformsToCheck.map((platform) => checkProfileExists(platform, cleanUsername)));
    const platformsFound = results.filter((r) => r.profileFound).length;
    return {
        searchedUsername: cleanUsername,
        results,
        totalPlatforms: results.length,
        platformsFound,
        timestamp: new Date()
    };
}
export function getAvailablePlatforms() {
    return Object.entries(PLATFORMS).map(([id, config]) => ({
        id,
        name: config.name
    }));
}
//# sourceMappingURL=socialMediaLookup.js.map