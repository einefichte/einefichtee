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
    </div>
  );
}

export default About;