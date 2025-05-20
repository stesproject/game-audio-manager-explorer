import React, { useState } from "react";

function App() {
  const [tracks, setTracks] = useState([]);

  const loadMusic = async () => {
    const files = await window.api.selectFolder();
    setTracks(files);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>React Music Library</h1>
      <button onClick={loadMusic}>Select Folder</button>
      <ul>
        {tracks.map((file, index) => (
          <li
            key={index}
            onClick={() => {
              const player = document.getElementById("player");
              player.src = encodeURI(`localfile://${file.path}`);
              player.play();
            }}
          >
            {file.title} — {file.artist}
          </li>
        ))}
      </ul>
      <audio id="player" controls style={{ width: "100%", marginTop: 20 }} />
    </div>
  );
}

export default App;
