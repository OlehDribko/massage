export default function LocationMap() {
  return (
    <div className="col-auto flex">
      <h3>My Location</h3>

      <iframe
        loading="lazy"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d305.59387547433005!2d-0.5830421506489696!3d44.84259639699561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd5527ac97cdc06f%3A0x513ff24ec30aa522!2sStefaniya%20Ben!5e0!3m2!1suk!2sfr!4v1779045114476!5m2!1suk!2sfr"
        width="600"
        height="450"
      ></iframe>
    </div>
  );
}
