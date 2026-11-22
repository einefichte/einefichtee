
import ElasticMesh from '../components/ElasticMesh';

function About() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '550px',
          zIndex: 2
        }}
      >
        <h1>ABOUT</h1>
        <p>
          Hier erfährst du mehr über mich und mein Projekt.
          <br />
          <br />
          Ich bin Henrik und spiele GD schon seit fast einem Jahr.
          Ich spiele auch gerne Minecraft und bin sehr an programmmieren interessiert.
          <br />
          Deswegen habe ich diese Webseite gemacht.
          <br />
          Ich mache gerne Musik 
          <br />
          Unten ist eins von meinen Liedern
          <br />
          Vorschläge gerne
          <a href="https://forms.cloud.microsoft/r/p5skY4Th7V">
            {' '}hier
          </a>
        </p>
      </div>

      <div
        style={{
          width: '750px',
          maxWidth: '90vw',
          height: '300px',
          marginTop: '30px'
        }}
      >
        <ElasticMesh
          text="EINEFICHTE"
          fontFamily="Oxygene1"
          fontWeight={900}
          color="#00ff80"
          material="clay" 
          intro={true}
        />
      </div>

      {/* Music Player */}
      <div
        style={{
          width: '400px',
          maxWidth: '90vw',
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          zIndex: 2,
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{ textAlign: 'center' }}>
          MY MUSIC
        </h2>

        <audio
          controls
          preload="metadata"
          style={{
            width: '100%'
          }}
        >
          <source
            src="/music/Drift Phonk.mp3"
            type="audio/mpeg"
          />
          Dein Browser unterstützt keine Audiowiedergabe.
        </audio>
      </div>
    </div>
  );
}

export default About;
