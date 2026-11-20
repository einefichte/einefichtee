
import ElectricLogo from '../components/ElectricLogo';

function About() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
    >
      {/* ElectricLogo links */}
      <div
        style={{
          position: 'absolute',
          left: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '400px',
          height:"450px"
          
        }}
      >
      
        
        <ElectricLogo
          src="favicon.svg"
          color="#4fff67"
          glowColor="#4fff67"
          scale={1}
          strands={6}
          speed={2.5}
          interactive
          glow={1}
        />
      </div>

      {/* Text bleibt in der Mitte */}
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
        </p>
      </div>
    </div>
  );
}

export default About;
