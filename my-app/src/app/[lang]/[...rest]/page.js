import { notFound } from 'next/navigation';

// Any path without a page, in every language: the 404 page of that
// language (app/[lang]/not-found.js) inside the site layout.
export default function UnknownPage() {
  notFound();
}
