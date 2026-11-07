// TODO: temporary monogram in brand colours for icon.js / apple-icon.js —
// replace with the official icon files once the designer provides them.
export default function IconMonogram({ fontSize }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1c1914', // --color-secondary-900
        color: '#cd984f', // --color-gold
        fontSize,
        fontStyle: 'italic',
      }}
    >
      S
    </div>
  );
}
