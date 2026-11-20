import * as S from "@studysmart/shared";
const all = (S as any).SETTINGS ?? (S as any).SETTING_DEFS;
console.log(JSON.stringify({ panels: (S as any).PANELS, settings: all }));
