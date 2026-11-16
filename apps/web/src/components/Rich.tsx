import { Fragment } from "react";

function Lines({ text, n }: { text: string; n: { v: number } }) {
  return (
    <>
      {text.split(/\s*\|\s*|\n/).map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/\*([^*]+)\*/g).map((p, i) => (i % 2 === 1 ? <span key={i} className={`hl hl-${(n.v++ % 3) + 1}`}>{p}</span> : <Fragment key={i}>{p}</Fragment>))}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Shows text where words between *stars* are styled (gradient, colour, marker or wavy line, chosen in Admin > Look and feel).
 * A | (bar) starts a new line. A || (double bar) makes the words before it a block on their own, with every later line
 * starting beside it, for example:  Students,||Get *Sharp* knowledge of every *Chapter*|to *MASTER* it !!
 */
export function Rich({ text }: { text: string }) {
  const n = { v: 0 };
  const at = text.indexOf("||");
  if (at < 0) return <Lines text={text} n={n} />;
  return (
    <>
      <span className="h-lead"><Lines text={text.slice(0, at)} n={n} />{" "}</span>
      <span className="h-body"><Lines text={text.slice(at + 2)} n={n} /></span>
    </>
  );
}
