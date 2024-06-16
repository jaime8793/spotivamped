"use client";

import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-js";

const spotifyApi = new SpotifyWebApi();

const ClientID = "47f163aa391e400aa5ca32eca0deb5ba";
const redirectUri = "http://localhost:3000";

// Function to parse the access token from the URL hash
const getTokenUrl = () => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial, item) => {
      let parts = item.split("=");
      initial[parts[0]] = parts[1] ? decodeURIComponent(parts[1]) : undefined;
      return initial;
    }, {});
};

function SpotifyLogin() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(false);
  const [nowPlaying, setNowPlaying] = useState({});

  useEffect(() => {
    const tokenData = getTokenUrl();
    const spotifyToken = tokenData;
    window.location.hash = "";
    console.log("tokenData + spotifyToken", tokenData, spotifyToken);

    if (spotifyToken) {
      setToken(spotifyToken);
      setUser(true);
      spotifyApi.setAccessToken(spotifyToken);
    }
  }, []);

  const fetchNowPlaying = () => {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      console.log(response);
      if (response && response.item) {
        setNowPlaying({
          name: response.item.name,
          artist: response.item.artists[0].name,
          albumArt: response.item.album.images[0].url,
        });
      }
    });
  };

  return (
    <div>
      {!token && (
        <a
          href={`https://accounts.spotify.com/authorize?client_id=${ClientID}&response_type=token&redirect_uri=${redirectUri}`}
        >
          Login with Spotify
        </a>
      )}
      {token && <button onClick={fetchNowPlaying}>Get Now Playing</button>}
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
    </div>
  );
}

export default SpotifyLogin;
