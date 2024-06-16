
function getTracks() {
    return fetch("https://api.spotify.com/v1/me/top/tracks", {
        headers: {
            Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`,
        },
    }).then((response) => response.json());
    return (
        <div>
            <p>hello</p>
        </div>
    );

}

export default getTracks