import React from "react";

export type StepId =
  | "start"
  | "story"
  | "learn"
  | "example"
  | "think"
  | "practice"
  | "remember"
  | "done";

interface Model2MathStageProps {
  step: StepId;
  progress: number; // 0..1
  showGrid: boolean;
  onStartLesson: () => void;
  onNextLesson?: () => void;
}

export const Model2MathStage: React.FC<Model2MathStageProps> = ({
  step,
  progress,
  showGrid,
  onStartLesson,
  onNextLesson,
}) => {
  const revealCount = (total: number) =>
    Math.min(total, Math.max(1, Math.ceil(progress * total)));

  return (
    <div className={`m2-stage-wrap ${showGrid ? "has-grid" : ""}`}>
      <svg
        className="m2-board"
        viewBox="0 0 800 440"
        role="img"
        aria-label="CBSE Class 6 Maths — Patterns in Mathematics daylight whiteboard"
      >
        <defs>
          <pattern
            id="m2DotGrid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.35" fill="#CBD5E1" />
          </pattern>
        </defs>

        {/* Daylight whiteboard surface */}
        <rect x="0" y="0" width="800" height="440" fill="#FFFFFF" rx="10" />
        {showGrid && (
          <rect x="0" y="0" width="800" height="440" fill="url(#m2DotGrid)" />
        )}

        {/* Top header strip inside whiteboard */}
        <rect
          x="24"
          y="18"
          width="752"
          height="46"
          rx="10"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        <text
          x="42"
          y="47"
          fill="#16253F"
          fontSize="18"
          fontWeight="700"
          fontFamily="var(--font-heading)"
        >
          CBSE Class 6 · Mathematics · Chapter 1: Patterns in Mathematics
        </text>
        <rect x="630" y="26" width="132" height="30" rx="15" fill="#E0F2FE" />
        <text
          x="696"
          y="46"
          textAnchor="middle"
          fill="#0369A1"
          fontSize="13"
          fontWeight="700"
        >
          Step: {step.toUpperCase()}
        </text>

        {step === "start" && (
          <g>
            <text
              x="400"
              y="112"
              textAnchor="middle"
              fill="#16253F"
              fontSize="26"
              fontWeight="700"
              fontFamily="var(--font-heading)"
            >
              Discovering Number &amp; Shape Patterns
            </text>
            <text
              x="400"
              y="142"
              textAnchor="middle"
              fill="#475569"
              fontSize="16"
            >
              Square numbers, triangular dots, and Virahānka sequences on a daylight board
            </text>

            {/* Preview cards */}
            <g transform="translate(80, 170)">
              <rect width="190" height="125" rx="12" fill="#F0FDF4" stroke="#15803D" strokeWidth="2" />
              <text x="95" y="42" textAnchor="middle" fill="#15803D" fontSize="22" fontWeight="700">
                1, 4, 9, 16
              </text>
              <text x="95" y="74" textAnchor="middle" fill="#16253F" fontSize="15" fontWeight="600">
                Square Numbers
              </text>
              <text x="95" y="98" textAnchor="middle" fill="#475569" fontSize="13">
                n × n dot grids
              </text>
            </g>

            <g transform="translate(305, 170)">
              <rect width="190" height="125" rx="12" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
              <text x="95" y="42" textAnchor="middle" fill="#B45309" fontSize="22" fontWeight="700">
                1, 3, 6, 10
              </text>
              <text x="95" y="74" textAnchor="middle" fill="#16253F" fontSize="15" fontWeight="600">
                Triangular Numbers
              </text>
              <text x="95" y="98" textAnchor="middle" fill="#475569" fontSize="13">
                1, 1+2, 1+2+3...
              </text>
            </g>

            <g transform="translate(530, 170)">
              <rect width="190" height="125" rx="12" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2" />
              <text x="95" y="42" textAnchor="middle" fill="#1D4ED8" fontSize="22" fontWeight="700">
                1, 2, 3, 5, 8
              </text>
              <text x="95" y="74" textAnchor="middle" fill="#16253F" fontSize="15" fontWeight="600">
                Virahānka Beats
              </text>
              <text x="95" y="98" textAnchor="middle" fill="#475569" fontSize="13">
                Sum of previous two
              </text>
            </g>
          </g>
        )}

        {step === "story" && (
          <g>
            <text x="50" y="106" fill="#16253F" fontSize="22" fontWeight="700">
              Patterns in Nature, Courtyard Tiles &amp; Rhythm
            </text>
            {/* Animated petal / symmetry ring */}
            <g transform="translate(210, 245)">
              <circle r="86" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" strokeDasharray="6 4" />
              {[0, 60, 120, 180, 240, 300]
                .slice(0, revealCount(6))
                .map((deg, idx) => (
                  <g key={deg} transform={`rotate(${deg})`}>
                    <ellipse
                      cx="0"
                      cy="-44"
                      rx="18"
                      ry="32"
                      fill={idx % 2 === 0 ? "#DBEAFE" : "#DCFCE7"}
                      stroke={idx % 2 === 0 ? "#1D4ED8" : "#15803D"}
                      strokeWidth="2.5"
                    />
                  </g>
                ))}
              <circle r="16" fill="#16253F" />
            </g>
            <g transform="translate(360, 145)">
              <rect width="385" height="220" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
              <text x="20" y="38" fill="#16253F" fontSize="17" fontWeight="700">
                Why do mathematicians study patterns?
              </text>
              <text x="20" y="74" fill="#334155" fontSize="15">
                • Predict the next number or shape without counting all
              </text>
              <text x="20" y="108" fill="#334155" fontSize="15">
                • Connect geometry (shapes) with arithmetic (sums)
              </text>
              <text x="20" y="142" fill="#0F766E" fontSize="15" fontWeight="700">
                • Spot rules hidden inside everyday designs
              </text>
              <rect x="20" y="166" width="345" height="36" rx="8" fill="#FEF3C7" />
              <text x="32" y="190" fill="#92400E" fontSize="14" fontWeight="700">
                Watch the 6 symmetry petals appear as narration plays
              </text>
            </g>
          </g>
        )}

        {step === "learn" && (
          <g>
            <text x="50" y="104" fill="#16253F" fontSize="22" fontWeight="700">
              Square Numbers: Growing 3 × 3 Dot Grid (9)
            </text>
            {/* 3x3 dot array revealing progressively */}
            <g transform="translate(95, 135)">
              <rect
                x="-16"
                y="-16"
                width="176"
                height="176"
                rx="14"
                fill="#F8FAFC"
                stroke="#16253F"
                strokeWidth="2.5"
              />
              {Array.from({ length: 9 }).map((_, i) => {
                const r = Math.floor(i / 3);
                const c = i % 3;
                const active = i < revealCount(9);
                return (
                  <circle
                    key={i}
                    cx={26 + c * 52}
                    cy={26 + r * 52}
                    r="15"
                    fill={active ? "#1D4ED8" : "#E2E8F0"}
                    stroke="#16253F"
                    strokeWidth="2"
                  />
                );
              })}
            </g>

            <g transform="translate(320, 135)">
              <rect width="420" height="235" rx="12" fill="#F0FDF4" stroke="#15803D" strokeWidth="2" />
              <text x="24" y="42" fill="#15803D" fontSize="20" fontWeight="700">
                Odd Sums Build Squares
              </text>
              <text x="24" y="80" fill="#16253F" fontSize="17">1 = 1² (1 dot)</text>
              <text x="24" y="114" fill="#16253F" fontSize="17">1 + 3 = 4 = 2² (2 × 2 grid)</text>
              <text x="24" y="148" fill="#16253F" fontSize="17">1 + 3 + 5 = 9 = 3² (3 × 3 grid)</text>
              <rect x="24" y="172" width="372" height="42" rx="8" fill="#DCFCE7" />
              <text x="38" y="199" fill="#14532D" fontSize="15" fontWeight="700">
                Rule: Sum of first n odd numbers = n²
              </text>
            </g>
          </g>
        )}

        {step === "example" && (
          <g>
            <text x="50" y="104" fill="#16253F" fontSize="22" fontWeight="700">
              Worked Example: 1 + 3 + 5 + 7 + 9 = ?
            </text>
            {[
              { label: "1st odd (1)", sum: "1", x: 55 },
              { label: "+ 3", sum: "4 (2²)", x: 200 },
              { label: "+ 5", sum: "9 (3²)", x: 345 },
              { label: "+ 7", sum: "16 (4²)", x: 490 },
              { label: "+ 9", sum: "25 (5²)", x: 635 },
            ]
              .slice(0, revealCount(5))
              .map((item, idx) => (
                <g key={item.label} transform={`translate(${item.x}, 145)`}>
                  <rect
                    width="125"
                    height="110"
                    rx="12"
                    fill={idx === 4 ? "#DCFCE7" : "#EFF6FF"}
                    stroke={idx === 4 ? "#15803D" : "#1D4ED8"}
                    strokeWidth="2"
                  />
                  <text x="62" y="42" textAnchor="middle" fill="#16253F" fontSize="17" fontWeight="700">
                    {item.label}
                  </text>
                  <text
                    x="62"
                    y="80"
                    textAnchor="middle"
                    fill={idx === 4 ? "#15803D" : "#1D4ED8"}
                    fontSize="20"
                    fontWeight="700"
                  >
                    {item.sum}
                  </text>
                </g>
              ))}
            <rect x="55" y="290" width="705" height="62" rx="12" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
            <text x="407" y="328" textAnchor="middle" fill="#92400E" fontSize="19" fontWeight="700">
              There are 5 odd terms → Answer is 5 × 5 = 25
            </text>
          </g>
        )}

        {step === "think" && (
          <g>
            <text x="50" y="104" fill="#16253F" fontSize="22" fontWeight="700">
              Think &amp; Explore: Up-and-Down Number Staircase
            </text>
            <text x="50" y="140" fill="#334155" fontSize="17">
              Evaluate: 1 + 2 + 3 + 2 + 1
            </text>
            {[1, 2, 3, 2, 1].slice(0, revealCount(5)).map((val, i) => {
              const barH = val * 44;
              const x = 90 + i * 115;
              const y = 335 - barH;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width="74"
                    height={barH}
                    rx="8"
                    fill={val === 3 ? "#FEF3C7" : "#DBEAFE"}
                    stroke={val === 3 ? "#D97706" : "#1D4ED8"}
                    strokeWidth="2.5"
                  />
                  <text
                    x={x + 37}
                    y={y + barH / 2 + 7}
                    textAnchor="middle"
                    fill="#16253F"
                    fontSize="22"
                    fontWeight="700"
                  >
                    {val}
                  </text>
                </g>
              );
            })}
            <rect x="460" y="365" width="295" height="44" rx="10" fill="#ECFDF5" stroke="#15803D" strokeWidth="2" />
            <text x="607" y="393" textAnchor="middle" fill="#15803D" fontSize="16" fontWeight="700">
              Peak is 3 → Sum = 3² = 9
            </text>
          </g>
        )}

        {step === "practice" && (
          <g>
            <text x="50" y="104" fill="#16253F" fontSize="22" fontWeight="700">
              Visual Clue Board: Spot the Pattern
            </text>
            <rect x="50" y="130" width="700" height="230" rx="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <text x="80" y="175" fill="#16253F" fontSize="19" fontWeight="700">
              Sequence: 1, 3, 6, 10, ___
            </text>
            <text x="80" y="215" fill="#0F766E" fontSize="17" fontWeight="600">
              Differences between consecutive terms: +2, +3, +4, +5
            </text>
            <text x="80" y="255" fill="#334155" fontSize="16">
              1 + 2 = 3 · 3 + 3 = 6 · 6 + 4 = 10 · 10 + 5 = ?
            </text>
            <text x="80" y="310" fill="#64748B" fontSize="15">
              Select your answer in the Practice card on the left.
            </text>
          </g>
        )}

        {step === "remember" && (
          <g>
            <text x="50" y="104" fill="#16253F" fontSize="22" fontWeight="700">
              Quick Summary Sheet — Patterns in Mathematics
            </text>
            <rect x="50" y="128" width="335" height="240" rx="12" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2" />
            <text x="72" y="166" fill="#1D4ED8" fontSize="18" fontWeight="700">Number Sequences</text>
            <text x="72" y="202" fill="#16253F" fontSize="15">• Squares: 1, 4, 9, 16, 25...</text>
            <text x="72" y="234" fill="#16253F" fontSize="15">• Triangles: 1, 3, 6, 10, 15...</text>
            <text x="72" y="266" fill="#16253F" fontSize="15">• Powers of 2: 2, 4, 8, 16, 32...</text>
            <text x="72" y="298" fill="#16253F" fontSize="15">• Virahānka: 1, 2, 3, 5, 8, 13...</text>

            <rect x="415" y="128" width="335" height="240" rx="12" fill="#F0FDF4" stroke="#15803D" strokeWidth="2" />
            <text x="437" y="166" fill="#15803D" fontSize="18" fontWeight="700">Key Relations</text>
            <text x="437" y="206" fill="#16253F" fontSize="15">• 1 + 3 + ... + (2n−1) = n²</text>
            <text x="437" y="242" fill="#16253F" fontSize="15">• Tₙ + Tₙ₋₁ = n²</text>
            <text x="437" y="278" fill="#16253F" fontSize="15">• 1 + 2 + ... + n + ... + 1 = n²</text>
          </g>
        )}

        {step === "done" && (
          <g>
            <rect x="110" y="110" width="580" height="250" rx="18" fill="#ECFDF5" stroke="#15803D" strokeWidth="2.5" />
            <text x="400" y="175" textAnchor="middle" fill="#15803D" fontSize="28" fontWeight="700">
              Lesson Preview Complete
            </text>
            <text x="400" y="218" textAnchor="middle" fill="#16253F" fontSize="17">
              You explored square numbers, triangular sums, and visual pattern rules.
            </text>
            <text x="400" y="252" textAnchor="middle" fill="#475569" fontSize="15">
              Ready to move on to the next lesson or chapter?
            </text>
          </g>
        )}
      </svg>

      {/* Action overlays inside the stage for Start and Done */}
      {step === "start" && (
        <button
          type="button"
          className="class-start m2-stage-cta"
          onClick={onStartLesson}
        >
          ▶ Start the lesson
        </button>
      )}

      {step === "done" && onNextLesson && (
        <div className="class-done">
          <strong>Chapter Preview Finished!</strong>{" "}
          <button type="button" className="btn sm" onClick={onNextLesson}>
            Next Lesson →
          </button>
        </div>
      )}
    </div>
  );
};
