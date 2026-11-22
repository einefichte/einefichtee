
import FluidGlass from '../components/FluidGlass';

function Contact() {
  return (
    <div>
      <h1>CONTACT</h1>

      <p>
        Hier kannst du Kontakt mit mir aufnehmen.
        <br />
        <br />
        Ingame: "EineFichte"
        <br />
        Email: henr.bra@protonmail.de
      </p>

      <div
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
        }}
      >
        <FluidGlass
          text="EINEFICHTE"
          fontFamily="OXYGENE1"
          src="/hero.jpg"
          shape="cube"
          size={420}
          refraction={2}
          dispersion={100}
          interaction="follow"
          frost={0}
          color="#ff0000"
          tint={0}
          reflection={1}
          shadow={0.5}
          elevation={0.4}
          smoothness={0.5}
          wobble={0.5}
          spin={1}
          idle
          morphOnClick={false}
          intro
        />
      </div>
    </div>
  );
}

export default Contact;
