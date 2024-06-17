"use client";

import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import axios from "axios";

const spotifyApi = new SpotifyWebApi();

const ClientID = "47f163aa391e400aa5ca32eca0deb5ba";
const ClientSecret = "babf94a1f1d14de1957d789f6ffa7b86"; // Replace with your client secret
const redirectUri = "http://localhost:3000";
const scopes = [
  "user-read-playback-state",
  "user-top-read",
  "playlist-read-private",
  // Add any other scopes you need
].join("%20");

interface TokenData {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  [key: string]: string | number | undefined;
}

interface NowPlaying {
  name?: string;
  artist?: string;
  albumArt?: string;
}

const getTokenFromUrl = (): TokenData => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial: TokenData, item) => {
      const parts = item.split("=");
      initial[parts[0]] = parts[1] ? decodeURIComponent(parts[1]) : undefined;
      return initial;
    }, {});
};

const refreshToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: ClientID,
          client_secret: ClientSecret,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

const SpotifyLogin: React.FC = () => {
  const [tokenData, setTokenData] = useState<TokenData>({});
  const [user, setUser] = useState<boolean>(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>({});
  const [playlists, setPlaylists] =
    useState<SpotifyApi.ListOfUsersPlaylistsResponse | null>(null);

  useEffect(() => {
    const tokenData = getTokenFromUrl();
    const { access_token, refresh_token, expires_in } = tokenData;

    if (access_token) {
      setTokenData({ access_token, refresh_token, expires_in });
      spotifyApi.setAccessToken(access_token);
      setUser(true);

      // Set a timeout to refresh the token before it expires
      if (expires_in) {
        setTimeout(
          () => {
            refreshToken(refresh_token!);
          },
          (expires_in - 60) * 1000,
        ); // Refresh 1 minute before expiry
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        const data = await spotifyApi.getUserPlaylists();
        console.log("User playlists:", data);
        setPlaylists(data);
      } catch (err) {
        console.error("Error fetching user playlists:", err);
      }
    };

    if (tokenData.access_token) {
      fetchUserPlaylists();
    }
  }, [tokenData]);

  const fetchNowPlaying = () => {
    spotifyApi.getMyCurrentPlaybackState().then(
      (response: SpotifyApi.CurrentPlaybackResponse) => {
        if (response && response.item) {
          setNowPlaying({
            name: response.item.name,
            artist: response.item.artists[0].name,
            albumArt: response.item.album.images[0].url,
          });
        }
      },
      (error: any) => {
        console.error("Error fetching now playing:", error);
      },
    );
  };

  const fetchTopTen = () => {
    spotifyApi.getMyTopArtists().then(
      (response: SpotifyApi.UsersTopArtistsResponse) => {
        console.log("This is my top artists response:", response);
      },
      (error: any) => {
        console.error("Error fetching top artists:", error);
      },
    );
  };

  return (
    <div>
      {!tokenData.access_token && (
        <a
          href={`https://accounts.spotify.com/authorize?client_id=${ClientID}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}&show_dialog=true`}
        >
          Login with Spotify
        </a>
      )}
      {tokenData.access_token && (
        <div>
          <button onClick={fetchNowPlaying}>Get Now Playing</button>
          {nowPlaying.name && (
            <div>
              <p>
                {nowPlaying.name} by {nowPlaying.artist}
              </p>
              <img
                src={nowPlaying.albumArt}
                alt="Album Art"
                style={{ width: 300, height: 300 }}
              />
            </div>
          )}
          <button onClick={fetchTopTen}>Get Top Artists</button>
          {playlists && (
            <div>
              <h3>User Playlists:</h3>
              <ul>
                {playlists.items.map((playlist) => (
                  <li key={playlist.id}>{playlist.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpotifyLogin;
