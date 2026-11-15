import { Fragment } from 'react';

/**
 * Translated text with inline markup → React nodes, so word order stays the
 * translator's: rich(t('Cette page est <accent>introuvable</accent>'),
 * { accent: (chunks) => <span className="heading-accent">{chunks}</span> }).
 * Tags are flat (no nesting); unknown tags are rendered as plain text.
 */
export function rich(text, tags = {}) {
  const nodes = [];
  const pattern = /<(\w+)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let match;
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const render = tags[match[1]];
    nodes.push(render ? render(match[2]) : match[2]);
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.map((node, index) => <Fragment key={index}>{node}</Fragment>);
}
