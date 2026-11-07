/**
 * Renders schema.org structured data. `<` is escaped so a value can never
 * close the script tag (recommended in the Next.js JSON-LD guide).
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
