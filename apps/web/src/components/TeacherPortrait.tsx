/** A friendly teacher drawn by the site itself (no video). The mouth moves and the eyes blink while she speaks. */
export function TeacherPortrait({ gender, speaking, name }: { gender: "female" | "male"; speaking: boolean; name: string }) {
  const female = gender === "female";
  const skin = female ? "#C58A62" : "#B97C55", skinShade = female ? "#B27650" : "#A66C47";
  return (
    <figure className={`teacher${speaking ? " speaking" : ""}`} aria-label={name}>
      <svg viewBox="0 0 200 250" role="img" aria-hidden="true">
        <rect width="200" height="250" rx="16" fill={female ? "#F3E3C8" : "#DCE7F3"} />
        <rect y="188" width="200" height="62" fill={female ? "#E4CFAA" : "#C5D5E8"} />
        {female ? (
          <>
            <path d="M20 250 C24 205 62 190 100 190 C138 190 176 205 180 250 Z" fill="#E8A33D" />
            <path d="M100 190 C132 196 168 214 180 250 L112 250 C112 226 108 206 100 190 Z" fill="#2F4AA8" />
            <path d="M118 212 L168 240 M114 226 L156 250" stroke="#F4D36B" strokeWidth="3" />
            <ellipse cx="100" cy="86" rx="62" ry="68" fill="#1E1614" />
            <circle cx="100" cy="30" r="22" fill="#1E1614" />
          </>
        ) : (
          <>
            <path d="M20 250 C24 205 62 190 100 190 C138 190 176 205 180 250 Z" fill="#3E6FB0" />
            <path d="M82 190 L100 214 L118 190 Z" fill="#fff" />
            <path d="M100 214 L92 250 M100 214 L108 250" stroke="#2E5188" strokeWidth="3" />
            <ellipse cx="100" cy="76" rx="56" ry="50" fill="#1E1614" />
          </>
        )}
        <rect x="86" y="150" width="28" height="44" rx="12" fill={skinShade} />
        <ellipse cx="100" cy="108" rx="46" ry="56" fill={skin} />
        {female ? <path d="M54 96 C56 54 144 54 146 96 C128 74 72 74 54 96 Z" fill="#1E1614" /> : <path d="M54 92 C54 50 146 50 146 92 C130 70 70 70 54 92 Z" fill="#1E1614" />}
        <ellipse cx="54" cy="112" rx="7" ry="11" fill={skin} /><ellipse cx="146" cy="112" rx="7" ry="11" fill={skin} />
        <path d="M70 94 Q81 88 92 94 M108 94 Q119 88 130 94" stroke="#1E1614" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <g className="eyes"><ellipse cx="81" cy="108" rx="7" ry="6" fill="#fff" /><ellipse cx="119" cy="108" rx="7" ry="6" fill="#fff" /><circle cx="82" cy="108" r="3.6" fill="#2A1A12" /><circle cx="120" cy="108" r="3.6" fill="#2A1A12" /></g>
        <path d="M100 112 Q96 126 102 128" stroke={skinShade} strokeWidth="3" fill="none" strokeLinecap="round" />
        {female && <circle cx="100" cy="86" r="3.4" fill="#C62828" />}
        {!female && <path d="M82 134 Q100 128 118 134 Q100 140 82 134 Z" fill="#1E1614" opacity=".85" />}
        <ellipse className="mouth" cx="100" cy="141" rx="11" ry="3" fill="#7A1F1F" />
        <path d="M89 141 Q100 148 111 141" stroke="#7A1F1F" strokeWidth="2" fill="none" opacity=".0" />
      </svg>
      <figcaption>{name}</figcaption>
    </figure>
  );
}
