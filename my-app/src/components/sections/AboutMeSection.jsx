import Image from 'next/image';

const BIO_TEXT =
  "Je suis Stefaniia, masseuse certifiée avec plus de 10 ans d'expérience. J'ai travaillé à l'Institut de Vertébrologie et je suis spécialisée dans différents types de massages : thérapeutique, drainage lymphatique, anti-cellulite, relaxant et bien d'autres. Mon objectif n'est pas seulement de réaliser une séance, mais d'obtenir des résultats concrets et d'améliorer votre bien-être.";

export default function AboutMeSection() {
  return (
    <section>
      <div>
        <div>
          <h4>Pourquoi mes clients me choisissent</h4>
          <h3>
            Massage professionnel avec des <span>résultats visibles</span>{' '}
          </h3>
          <p>{BIO_TEXT}</p>
        </div>
        <Image
          src="/images/photoStefa.jpg"
          alt="Stefaniia, masseuse certifiée à Bordeaux"
          width={472}
          height={650}
        />
      </div>
    </section>
  );
}
