import { SITE } from "@studysmart/shared";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * The page strangers see when the site is "Invitation only". One self-contained page (no app files, no outside fonts):
 * English and Tamil together, the code box, and a tiny script that posts the code and reloads on success.
 */
export function renderGatePage(message: { en: string; ta?: string }, headExtra = ""): string {
  const ta = message.ta?.trim() || message.en;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
${headExtra}<title>${esc(SITE.name)} – Invite code | அழைப்புக் குறியீடு</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F4F8FC;color:#16253F;font:18px/1.5 system-ui,"Noto Sans Tamil","Mukta Malar",sans-serif}
main{width:min(92vw,28rem);background:#fff;border-radius:16px;padding:1.5rem;box-shadow:0 4px 20px rgba(20,40,90,.12)}
h1{margin:.2rem 0;font-size:1.6rem;color:#1F4FD1}
p{margin:.5rem 0}.ta{color:#3b4b66}
input{width:100%;box-sizing:border-box;font:inherit;font-size:1.2rem;letter-spacing:.08em;text-transform:uppercase;padding:.7rem;border:2px solid #9bb0d6;border-radius:10px;margin-top:.6rem}
button{width:100%;margin-top:.7rem;font:inherit;font-weight:700;padding:.7rem;border:0;border-radius:10px;background:#1F4FD1;color:#fff;cursor:pointer}
button:disabled{opacity:.6}
#err{color:#b00020;min-height:1.5em}
</style>
</head>
<body>
<main>
<h1>${esc(SITE.name)}</h1>
<p>${esc(message.en)}</p>
<p class="ta" lang="ta">${esc(ta)}</p>
<form id="f" autocomplete="off">
<label for="c"><b>Enter your invite code</b> · <span lang="ta">உங்கள் அழைப்புக் குறியீட்டை உள்ளிடுங்கள்</span></label>
<input id="c" name="code" placeholder="${esc(SITE.inviteCodePrefix)}-XXXX-XXXX" required maxlength="40" autocapitalize="characters" spellcheck="false" />
<button type="submit">Continue · தொடரவும்</button>
<p id="err" role="alert"></p>
</form>
</main>
<script>
document.getElementById("f").addEventListener("submit",async function(e){
  e.preventDefault();var b=e.target.querySelector("button"),m=document.getElementById("err");b.disabled=true;m.textContent="";
  try{var r=await fetch("/api/access/redeem",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:document.getElementById("c").value})});
    if(r.ok){location.reload();return}
    var j={};try{j=await r.json()}catch(_){}
    m.textContent=(r.status===429?"Too many tries. Please wait a few minutes. · சிறிது நேரம் காத்திருங்கள்.":"That code did not work. Please check it. · குறியீடு சரியில்லை.");
  }catch(_){m.textContent="No connection. · இணைப்பு இல்லை."}
  b.disabled=false;
});
</script>
</body>
</html>`;
}
