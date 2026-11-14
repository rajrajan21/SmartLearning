import type { BoardState, Shape } from "../lib/board";

const CELL = 110;
function ShapeArt({ shape }: { shape: Shape }) {
  switch (shape) {
    case "circle": return <circle cx={CELL / 2} cy={40} r={34} />;
    case "rect": return <rect x={12} y={12} width={CELL - 24} height={56} />;
    case "triangle": return <polygon points={`${CELL / 2},8 ${CELL - 12},70 12,70`} />;
    case "line": return <line x1={10} y1={40} x2={CELL - 10} y2={40} />;
    case "arrow": return <g><line x1={10} y1={40} x2={CELL - 14} y2={40} /><polyline points={`${CELL - 30},24 ${CELL - 10},40 ${CELL - 30},56`} /></g>;
  }
}

/** The teacher's chalkboard: text on the left, drawings on the right, a ring around what she points at. */
export function Board({ state, label }: { state: BoardState; label: string }) {
  const texts = state.items.filter((i) => i.kind === "text");
  const shapes = state.items.filter((i) => i.kind === "shape");
  return (
    <svg className="board" viewBox="0 0 520 260" role="img" aria-label={label}>
      <rect className="board-bg" x="0" y="0" width="520" height="260" rx="10" />
      <g className="board-text">
        {texts.map((t, i) => (
          <text key={t.id} x="18" y={44 + i * 36} className={state.pointed === t.id ? "pointed" : undefined}>{t.kind === "text" ? t.text : ""}</text>
        ))}
      </g>
      <g className="board-shapes">
        {shapes.map((s, i) => {
          const x = 250 + (i % 2) * (CELL + 18), y = 14 + Math.floor(i / 2) * 82;
          return (
            <g key={s.id} transform={`translate(${x} ${y})`} className={state.pointed === s.id ? "pointed" : undefined}>
              {s.kind === "shape" && <ShapeArt shape={s.shape} />}
              {s.kind === "shape" && s.label && <text x={CELL / 2} y={82} textAnchor="middle" className="cap">{s.label}</text>}
              {state.pointed === s.id && <rect className="ring" x={0} y={-2} width={CELL} height={78} rx={10} />}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
