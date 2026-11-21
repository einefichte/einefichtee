
function MusicPlayer() {
  return (
    <div>
      <h2>Music Player</h2>

      <audio controls>
        <source src="/music/song.mp3" type="audio/mpeg" />
        Dein Browser unterstützt keine Audiowiedergabe.
      </audio>
    </div>
  );
}

export default MusicPlayer;
