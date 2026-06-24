import Image from 'next/image';
import Link from 'next/link';

import PillButton from '@/components/ui/PillButton';

export default function Header() {
  return (
    <header className="relative z-header">
      <div className="font-montserrat absolute inset-x-0 top-0 flex w-full items-center justify-between px-section-x pt-header-top font-normal text-on-dark">
        <Link href="/">
          <Image
            src="/massage.svg"
            alt="Logo"
            width={207}
            height={45}
            priority
          />
        </Link>
        <nav>
          <ul className="flex items-center gap-nav">
            <li>
              <a href="#we_do">What we do</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#works">Our works</a>
            </li>
            <li>
              <a href="#reviews">Reviews</a>
            </li>
            <li>
              <PillButton variant="outline" href="#contact_us">
                Contact us
              </PillButton>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
