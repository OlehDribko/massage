import Image from 'next/image';

export default function SectionLabel({ children, className = '' }) {
  return (
    <div
      className={`pb-label-bottom flex items-center gap-4 ${className}`.trim()}
    >
      <Image
        src="/arrow.svg"
        alt=""
        width={6}
        height={11}
        aria-hidden
        className="w-icon-arrow rotate-180"
      />
      <p className="font-montserrat flex items-center gap-2 text-[16px] tracking-[0.16px]">
        {children}
      </p>
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
