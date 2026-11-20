
import Topography from '../components/Topography';

function Home() {
  return (
    <div style={{
      height: '600px',
      width: '100%',
      position: 'relative'
    }}>
      <Topography
        color="#4f7cff"
        lineCount={22}
        speed={0.25}
      />

      <h1 style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'transparent',
        WebkitTextStroke: '1.5px white',
        fontSize: '48px',
        fontFamily: 'Oxygene1',
        textAlign: 'center',
        zIndex: 2
      }}>
        HELLO
      </h1>
    </div>
  );
}

export default Home;
