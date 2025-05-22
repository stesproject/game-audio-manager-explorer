import React, { useState, useMemo } from "react";

function App() {
  const [tracks, setTracks] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [excludeKeyword, setExcludeKeyword] = useState("");
  const [maxLength, setMaxLength] = useState("");

  const loadMusic = async () => {
    const files = await window.api.selectFolder();
    setTracks(files);
  };

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchKeyword =
        !searchKeyword ||
        track.path.toLowerCase().includes(searchKeyword.toLowerCase());
      const excludeMatch =
        !excludeKeyword ||
        !track.path.toLowerCase().includes(excludeKeyword.toLowerCase());
      const lengthOk = !maxLength || track.length <= parseInt(maxLength);
      return matchKeyword && excludeMatch && lengthOk;
    });
  }, [tracks, searchKeyword, excludeKeyword, maxLength]);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Game Audio Manager Explorer</h1>
      <button onClick={loadMusic}>Select Folder</button>
      <div>
        <input
          placeholder="Search keyword"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <input
          placeholder="Exclude keyword"
          value={excludeKeyword}
          onChange={(e) => setExcludeKeyword(e.target.value)}
        />
        <input
          placeholder="Max Length (sec)"
          value={maxLength}
          onChange={(e) => setMaxLength(e.target.value)}
        />
      </div>
      <ul>
        {filteredTracks.map((file, index) => (
          <li
            key={index}
            onClick={() => {
              const player = document.getElementById("player");
              player.src = encodeURI(`localfile://${file.path}`);
              player.play();
            }}
          >
            {file.title} — {file.artist} — {file.length} sec
          </li>
        ))}
      </ul>
      <audio id="player" controls style={{ width: "100%", marginTop: 20 }} />
    </div>
  );
}

export default App;
