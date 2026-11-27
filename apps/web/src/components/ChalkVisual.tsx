import type { Model3Visual } from "@studysmart/shared";

interface Props {
  visual: Model3Visual;
  beatIdx: number;
  beatProg: number;
  playing: boolean;
  lightBoard: boolean;
}

const dash = (prog: number, len = 600) => ({
  strokeDasharray: len,
  strokeDashoffset: Math.max(0, len * (1 - Math.min(1, Math.max(0, prog)))),
});

export function ChalkVisual({ visual, beatIdx, beatProg, playing, lightBoard }: Props) {
  const cGreen = lightBoard ? "#166544" : "#4ade80";
  const cYellow = lightBoard ? "#b45309" : "#fde047";
  const cCyan = lightBoard ? "#1d4ed8" : "#38bdf8";
  const cPink = lightBoard ? "#be185d" : "#f472b6";
  const cInk = lightBoard ? "#0f172a" : "#f1f5f9";
  const cMuted = lightBoard ? "#64748b" : "#94a3b8";

  // Overall reveal progress (instant if paused/scrubbed, progressive if playing)
  const p0 = !playing && beatProg >= 1 ? 1 : beatIdx > 0 ? 1 : Math.min(1, beatProg * 1.4);
  const p1 = !playing && beatProg >= 1 ? 1 : beatIdx > 1 ? 1 : beatIdx === 1 ? Math.min(1, beatProg * 1.35) : 0.25;
  const p2 = !playing && beatProg >= 1 ? 1 : beatIdx >= 2 ? Math.min(1, beatProg * 1.35) : beatIdx === 1 ? 0.3 : 0.15;

  const items = visual.items?.length ? visual.items : ["Concept", "Rule", "Example"];
  const title = visual.title || "";

  return (
    <div className="m3-visual-wrap">
      {title && <div className="m3-visual-title">{title}</div>}
      <svg viewBox="0 0 720 210" className="m3-chalk-svg" role="img" aria-label={title || visual.kind}>
        {visual.kind === "shapes-gallery" && (
          <g>
            {/* Triangle */}
            <g opacity={p0 > 0.05 ? 1 : 0.2}>
              <polygon points="95,38 35,142 155,142" fill="rgba(74,222,128,0.12)" stroke={cGreen} strokeWidth="3.5" strokeLinejoin="round" {...dash(p0, 420)} />
              {[[95, 38], [35, 142], [155, 142]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="5" fill={cYellow} opacity={p0} />
              ))}
              <text x="95" y="168" textAnchor="middle" fill={cGreen} fontSize="15" fontWeight="700" className="m3-svg-chalk">Triangle</text>
              <text x="95" y="188" textAnchor="middle" fill={cInk} fontSize="12">3 sides · 3 corners</text>
            </g>

            {/* Square */}
            <g opacity={p0 > 0.15 ? 1 : 0.2}>
              <rect x="205" y="42" width="100" height="100" rx="3" fill="rgba(253,224,71,0.12)" stroke={cYellow} strokeWidth="3.5" {...dash(p0, 420)} />
              {[[205, 42], [305, 42], [205, 142], [305, 142]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="5" fill={cPink} opacity={p0} />
              ))}
              <text x="255" y="168" textAnchor="middle" fill={cYellow} fontSize="15" fontWeight="700" className="m3-svg-chalk">Square</text>
              <text x="255" y="188" textAnchor="middle" fill={cInk} fontSize="12">4 equal sides · 4 corners</text>
            </g>

            {/* Rectangle */}
            <g opacity={p1 > 0.1 ? 1 : 0.25}>
              <rect x="355" y="52" width="145" height="84" rx="3" fill="rgba(56,189,248,0.14)" stroke={cCyan} strokeWidth="3.5" {...dash(p1, 480)} />
              {[[355, 52], [500, 52], [355, 136], [500, 136]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="5.5" fill={cYellow} opacity={p1} />
              ))}
              <text x="427" y="168" textAnchor="middle" fill={cCyan} fontSize="15" fontWeight="700" className="m3-svg-chalk">Rectangle</text>
              <text x="427" y="188" textAnchor="middle" fill={cInk} fontSize="12">4 sides · 4 corners</text>
            </g>

            {/* Circle */}
            <g opacity={p2 > 0.1 ? 1 : 0.25}>
              <circle cx="615" cy="94" r="50" fill="rgba(244,114,182,0.12)" stroke={cPink} strokeWidth="3.5" {...dash(p2, 340)} />
              <circle cx="615" cy="94" r="4" fill={cPink} />
              <text x="615" y="168" textAnchor="middle" fill={cPink} fontSize="15" fontWeight="700" className="m3-svg-chalk">Circle</text>
              <text x="615" y="188" textAnchor="middle" fill={cInk} fontSize="12">Curved · 0 corners</text>
            </g>
          </g>
        )}

        {visual.kind === "solid-3d" && (
          <g>
            {/* Cube */}
            <g opacity={p0 > 0.05 ? 1 : 0.25}>
              <rect x="70" y="62" width="84" height="84" fill="rgba(56,189,248,0.14)" stroke={cCyan} strokeWidth="3" {...dash(p0, 360)} />
              <polygon points="70,62 104,34 188,34 154,62" fill="rgba(56,189,248,0.22)" stroke={cCyan} strokeWidth="3" />
              <polygon points="154,62 188,34 188,118 154,146" fill="rgba(56,189,248,0.08)" stroke={cCyan} strokeWidth="3" />
              <text x="128" y="172" textAnchor="middle" fill={cCyan} fontSize="15" fontWeight="700" className="m3-svg-chalk">Cube / Cuboid</text>
              <text x="128" y="192" textAnchor="middle" fill={cInk} fontSize="12">6 faces · 12 edges · 8 corners</text>
            </g>

            {/* Cylinder */}
            <g opacity={p1 > 0.1 ? 1 : 0.25}>
              <ellipse cx="360" cy="52" rx="52" ry="16" fill="rgba(74,222,128,0.18)" stroke={cGreen} strokeWidth="3" />
              <line x1="308" y1="52" x2="308" y2="138" stroke={cGreen} strokeWidth="3" {...dash(p1, 100)} />
              <line x1="412" y1="52" x2="412" y2="138" stroke={cGreen} strokeWidth="3" {...dash(p1, 100)} />
              <path d="M 308 138 A 52 16 0 0 0 412 138" fill="none" stroke={cGreen} strokeWidth="3" />
              <text x="360" y="172" textAnchor="middle" fill={cGreen} fontSize="15" fontWeight="700" className="m3-svg-chalk">Cylinder</text>
              <text x="360" y="192" textAnchor="middle" fill={cInk} fontSize="12">2 flat circles + 1 curved face</text>
            </g>

            {/* Cone */}
            <g opacity={p2 > 0.1 ? 1 : 0.25}>
              <polygon points="585,34 525,138 645,138" fill="rgba(253,224,71,0.14)" stroke={cYellow} strokeWidth="3" {...dash(p2, 360)} />
              <ellipse cx="585" cy="138" rx="60" ry="15" fill="rgba(253,224,71,0.18)" stroke={cYellow} strokeWidth="3" />
              <circle cx="585" cy="34" r="4.5" fill={cPink} />
              <text x="585" y="172" textAnchor="middle" fill={cYellow} fontSize="15" fontWeight="700" className="m3-svg-chalk">Cone</text>
              <text x="585" y="192" textAnchor="middle" fill={cInk} fontSize="12">1 flat face · 1 tip corner</text>
            </g>
          </g>
        )}

        {visual.kind === "circle-pi" && (
          <g>
            <circle cx="205" cy="105" r="76" fill="rgba(74,222,128,0.1)" stroke={cGreen} strokeWidth="4" {...dash(p0, 500)} />
            <circle cx="205" cy="105" r="5" fill={cYellow} />
            <line x1="205" y1="105" x2="281" y2="105" stroke={cPink} strokeWidth="3.5" {...dash(p1, 100)} />
            <text x="243" y="96" textAnchor="middle" fill={cPink} fontSize="14" fontWeight="700" className="m3-svg-chalk">r</text>
            <line x1="129" y1="125" x2="281" y2="125" stroke={cYellow} strokeWidth="2.5" strokeDasharray="6 4" opacity={p1} />
            <text x="205" y="144" textAnchor="middle" fill={cYellow} fontSize="13" fontWeight="700" opacity={p1}>d = 2r</text>
            <g opacity={p2}>
              <rect x="345" y="42" width="330" height="126" rx="12" fill="rgba(56,189,248,0.1)" stroke={cCyan} strokeWidth="2" />
              <text x="365" y="75" fill={cCyan} fontSize="16" fontWeight="700" className="m3-svg-chalk">Circumference (C) = π × d</text>
              <text x="365" y="108" fill={cInk} fontSize="15" className="m3-svg-chalk">C = 2 × π × r</text>
              <text x="365" y="142" fill={cYellow} fontSize="14">π ≈ 3.14 or 22/7</text>
            </g>
          </g>
        )}

        {visual.kind === "area-grid" && (
          <g>
            <g transform="translate(80,35)">
              {[0, 1, 2, 3].map((r) =>
                [0, 1, 2, 3, 4, 5].map((col) => (
                  <rect
                    key={`${r}-${col}`}
                    x={col * 44}
                    y={r * 34}
                    width="42"
                    height="32"
                    rx="3"
                    fill={p1 > 0.5 ? "rgba(74,222,128,0.22)" : "rgba(56,189,248,0.1)"}
                    stroke={cCyan}
                    strokeWidth="1.8"
                  />
                ))
              )}
              <rect x="0" y="0" width="262" height="134" fill="none" stroke={cYellow} strokeWidth="3.5" {...dash(p0, 820)} />
              <text x="131" y="158" textAnchor="middle" fill={cYellow} fontSize="14" fontWeight="700" className="m3-svg-chalk">Length (l)</text>
              <text x="-16" y="72" textAnchor="end" fill={cPink} fontSize="14" fontWeight="700" className="m3-svg-chalk">b</text>
            </g>
            <g opacity={p1}>
              <rect x="395" y="42" width="270" height="122" rx="12" fill="rgba(74,222,128,0.08)" stroke={cGreen} strokeWidth="2" />
              <text x="415" y="78" fill={cYellow} fontSize="15" fontWeight="700" className="m3-svg-chalk">Perimeter = 2 × (l + b)</text>
              <text x="415" y="114" fill={cGreen} fontSize="15" fontWeight="700" className="m3-svg-chalk">Area = l × b (sq units)</text>
              <text x="415" y="146" fill={cInk} fontSize="13">Count every unit square inside!</text>
            </g>
          </g>
        )}

        {visual.kind === "fraction-bar" && (
          <g>
            <text x="360" y="38" textAnchor="middle" fill={cYellow} fontSize="16" fontWeight="700" className="m3-svg-chalk">Equal Parts Make a Whole</text>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={110 + i * 100}
                y={64}
                width="92"
                height="58"
                rx="6"
                fill={i < 3 ? "rgba(74,222,128,0.28)" : "rgba(148,163,184,0.12)"}
                stroke={i < 3 ? cGreen : cMuted}
                strokeWidth="3"
                opacity={p0}
              />
            ))}
            <text x="260" y="158" textAnchor="middle" fill={cGreen} fontSize="16" fontWeight="700" className="m3-svg-chalk">Shaded = 3 / 5 (60%)</text>
            <text x="510" y="158" textAnchor="middle" fill={cCyan} fontSize="15">Unshaded = 2 / 5 (40%)</text>
          </g>
        )}

        {visual.kind === "algebra-balance" && (
          <g>
            <text x="360" y="34" textAnchor="middle" fill={cYellow} fontSize="16" fontWeight="700" className="m3-svg-chalk">Group Like Terms Step-by-Step</text>
            <rect x="65" y="60" width="165" height="62" rx="10" fill="rgba(244,114,182,0.18)" stroke={cPink} strokeWidth="2.8" opacity={p0} />
            <text x="147" y="97" textAnchor="middle" fill={cPink} fontSize="18" fontWeight="700" className="m3-svg-chalk">3x + 2x</text>
            <line x1="245" y1="91" x2="305" y2="91" stroke={cInk} strokeWidth="3" {...dash(p1, 80)} />
            <polygon points="305,84 318,91 305,98" fill={cInk} opacity={p1} />
            <rect x="330" y="60" width="140" height="62" rx="10" fill="rgba(74,222,128,0.18)" stroke={cGreen} strokeWidth="2.8" opacity={p1} />
            <text x="400" y="97" textAnchor="middle" fill={cGreen} fontSize="18" fontWeight="700" className="m3-svg-chalk">= 5x</text>
            <rect x="495" y="60" width="165" height="62" rx="10" fill="rgba(56,189,248,0.16)" stroke={cCyan} strokeWidth="2.5" opacity={p2} />
            <text x="577" y="97" textAnchor="middle" fill={cCyan} fontSize="16" fontWeight="700" className="m3-svg-chalk">Keep LHS = RHS</text>
            <text x="360" y="166" textAnchor="middle" fill={cInk} fontSize="14" opacity={p1}>Same variable + same power = combine coefficients!</text>
          </g>
        )}

        {visual.kind === "number-line" && (
          <g>
            <line x1="65" y1="125" x2="655" y2="125" stroke={cCyan} strokeWidth="3.5" {...dash(p0, 620)} />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
              const x = 95 + n * 65;
              return (
                <g key={n} opacity={p0}>
                  <line x1={x} y1="116" x2={x} y2="134" stroke={cInk} strokeWidth="2.5" />
                  <text x={x} y="156" textAnchor="middle" fill={cInk} fontSize="14" fontWeight="700">{n}</text>
                </g>
              );
            })}
            <path d="M 160 116 Q 225 46 290 116" fill="none" stroke={cGreen} strokeWidth="3" {...dash(p1, 220)} />
            <path d="M 290 116 Q 355 46 420 116" fill="none" stroke={cYellow} strokeWidth="3" {...dash(p2, 220)} />
            <text x="225" y="62" textAnchor="middle" fill={cGreen} fontSize="14" fontWeight="700" opacity={p1}>+2</text>
            <text x="355" y="62" textAnchor="middle" fill={cYellow} fontSize="14" fontWeight="700" opacity={p2}>+2</text>
          </g>
        )}

        {visual.kind === "circuit" && (
          <g>
            <rect x="130" y="45" width="460" height="120" rx="14" fill="none" stroke={cCyan} strokeWidth="3.5" {...dash(p0, 1200)} />
            <rect x="95" y="78" width="70" height="54" rx="8" fill={lightBoard ? "#e0f2fe" : "#1e293b"} stroke={cYellow} strokeWidth="2.5" />
            <text x="130" y="110" textAnchor="middle" fill={cYellow} fontSize="14" fontWeight="700">Battery</text>
            <circle cx="590" cy="105" r="24" fill="rgba(253,224,71,0.3)" stroke={cYellow} strokeWidth="3" opacity={p2} />
            <text x="590" y="110" textAnchor="middle" fill={cYellow} fontSize="13" fontWeight="700">Bulb</text>
            <line x1="320" y1="45" x2="395" y2="45" stroke={cGreen} strokeWidth="5" opacity={p1} />
            <text x="360" y="32" textAnchor="middle" fill={cGreen} fontSize="13" fontWeight="700">Switch Closed → Current Flows</text>
          </g>
        )}

        {(visual.kind === "flow-diagram" || visual.kind === "concept-map") && (
          <g>
            {visual.kind === "flow-diagram" ? (
              <g>
                {items.slice(0, 3).map((label, i) => {
                  const x = 42 + i * 230;
                  const colors = [cGreen, cYellow, cCyan];
                  const col = colors[i % colors.length]!;
                  const op = i === 0 ? p0 : i === 1 ? p1 : p2;
                  return (
                    <g key={i} opacity={op > 0.05 ? 1 : 0.25}>
                      <rect x={x} y="54" width="185" height="96" rx="14" fill="rgba(56,189,248,0.1)" stroke={col} strokeWidth="3" {...dash(op, 580)} />
                      <text x={x + 92} y="82" textAnchor="middle" fill={col} fontSize="13" fontWeight="800">STEP {i + 1}</text>
                      <text x={x + 92} y="114" textAnchor="middle" fill={cInk} fontSize="14" fontWeight="700">{label.slice(0, 22)}</text>
                      {i < 2 && (
                        <g opacity={op}>
                          <line x1={x + 190} y1="102" x2={x + 224} y2="102" stroke={col} strokeWidth="3" />
                          <polygon points={`${x + 216},95 ${x + 228},102 ${x + 216},109`} fill={col} />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            ) : (
              <g>
                <rect x="245" y="72" width="230" height="66" rx="16" fill="rgba(74,222,128,0.16)" stroke={cGreen} strokeWidth="3" {...dash(p0, 620)} />
                <text x="360" y="110" textAnchor="middle" fill={cGreen} fontSize="16" fontWeight="800" className="m3-svg-chalk">
                  {(visual.title || items[0] || "Key Concept").slice(0, 26)}
                </text>
                {items.slice(0, 4).map((label, i) => {
                  const coords = [
                    [110, 42, 245, 92],
                    [610, 42, 475, 92],
                    [110, 168, 245, 118],
                    [610, 168, 475, 118],
                  ] as const;
                  const [bx, by, tx, ty] = coords[i]!;
                  const cols = [cYellow, cCyan, cPink, cGreen];
                  const col = cols[i % cols.length]!;
                  const op = i < 2 ? p1 : p2;
                  return (
                    <g key={i} opacity={op > 0.05 ? 1 : 0.25}>
                      <line x1={tx} y1={ty} x2={bx} y2={by} stroke={cMuted} strokeWidth="2.5" strokeDasharray="5 4" />
                      <rect x={bx - 92} y={by - 22} width="184" height="44" rx="10" fill={lightBoard ? "#f8fafc" : "#111827"} stroke={col} strokeWidth="2.5" />
                      <text x={bx} y={by + 5} textAnchor="middle" fill={col} fontSize="13" fontWeight="700">{label.slice(0, 22)}</text>
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
