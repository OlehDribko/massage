import Image from 'next/image';

export default function SectionLabel({ children }) {
  return (
    <div className="flex gap-4 pb-label-bottom">
      <Image
        src="/arrow.svg"
        alt=""
        width={6}
        height={11}
        aria-hidden
        className="w-icon-arrow rotate-180"
      />
      <p className="flex items-center gap-2">{children}</p>
      <Image
        src="/arrow.svg"
        alt=""
        width={6}
        height={11}
        aria-hidden
        className="w-icon-arrow"
      />
    </div>
  );
}
