import re
import sys
from pathlib import Path

source, output = map(Path, sys.argv[1:3])
html = source.read_text(encoding="utf-8-sig")
pack_marker = re.search(r"Boot Pack (\d+) Application", html)
pack = int(pack_marker.group(1)) if pack_marker else 1
save_name = "sharpstudy-10-virtual-labs.html" if pack == 1 else f"sharpstudy-virtual-lab-pack{pack}.html"

assert html.count("<script>") == 1 and html.count("</script>") == 1
assert "CUSTOM_TTS_ENDPOINT: \"\"" in html and "GEMINI_PROXY_ENDPOINT: \"\"" in html
assert not re.search(r'<(?:script|iframe)[^>]+src=|document\.cookie|\beval\(', html, re.I)
html = html.replace("<meta charset=\"UTF-8\" />", """<meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; media-src 'self' blob:; connect-src 'none'; base-uri 'none'; form-action 'none'" />""", 1)
assert "Content-Security-Policy" in html
html = html.replace("Ask Gemini about this lab...", "Ask about this lab...")
html = html.replace("Ask anything about the live experiment on your screen", "Ask about the experiment or try a suggested question")
html = html.replace("  </style>", """    html[data-embedded] .modal-backdrop {
      align-items: flex-start;
      padding-top: clamp(16px, 7vw, 92px);
    }
  </style>""", 1)
html = html.replace("60fps HTML5 Canvas Stage", "Canvas Stage")
html = re.sub(r'(<canvas id="labCanvas")', r'\1 role="img" aria-label="Animated simulation. Read the Live Coach for the current result."', html, count=1)
html = re.sub(r'(<div class="modal-card")', r'\1 role="dialog" aria-modal="true" aria-labelledby="modalHeaderTitle"', html, count=1)
html = re.sub(r'(<div class="coach-text")', r'\1 aria-live="polite"', html, count=1)
html = html.replace('<input type="text" id="chatInput"', '<input type="text" maxlength="240" aria-label="Ask the lab tutor" id="chatInput"')
html = re.sub(r"a\.download = '[^']+';", "a.download = '" + save_name + "';", html, count=1)

def slider(match):
    attrs = match.group(0)
    return attrs.replace("renderControls(); updateLabState(false);", "updateRangeBadge(this); updateLabState(false);")

html = re.sub(r'oninput="[^"]+"', slider, html)
html = html.replace("Ice has zero friction so", "In the ideal frictionless model, the ice surface lets")
html = html.replace("zero friction slows the cart down", "the model ignores friction")
html = html.replace("your heart pumps twice as fast (~140 BPM)", "your heart usually beats faster (140 BPM in this example)")
html = html.replace("Running doubles your heart rate!", "The running example uses a higher heart rate. Actual rates vary.")
html = html.replace("raise the brightness", "raise the light setting")

if pack == 2:
    html = html.replace("Bring a glowing splint to H₂ for a sharp POP!", "The virtual alert represents the characteristic pop from the hydrogen demonstration.")
    html = html.replace("Ignite collected H₂!", "Play the virtual demonstration")
    html = html.replace("Let us tap Pop Test to ignite it safely!", "Select Pop Test to see the simulated result.")
    html = html.replace("Adding Dilute Acid provides ions so current flows, producing 2× Hydrogen at the Cathode (−) which makes a sharp POP with a burning splint!", "Water electrolysis produces twice as much hydrogen at the cathode as oxygen at the anode in this model. The Pop Test button plays a virtual demonstration.")
    html = html.replace("sucking fresh blue O₂ in", "bringing air into the lungs")

html = re.sub(r"    // Boot Pack \d+ Application", "    // Boot Application", html, count=1)
html = html.replace("    // Boot Application", r"""    // SharpStudy standalone and embedded entry point.
    const params = new URLSearchParams(location.search);
    const embedded = params.get('embedded') === '1' && window.parent !== window;
    if (embedded) document.documentElement.setAttribute('data-embedded', '');
    else document.documentElement.removeAttribute('data-embedded');
    const selectedLab = LABS.find(lab => lab.id === params.get('lab'));
    if (selectedLab) activeLabId = selectedLab.id;
    const storedSubject = params.get('subject');
    if (selectedLab && selectedLab.subject === storedSubject) {
      activeSubject = storedSubject;
      document.querySelectorAll('.subj-btn').forEach(button => {
        button.classList.toggle('active', button.getAttribute('onclick').includes("'" + activeSubject + "'"));
      });
    }
    const resizeReport = () => {
      const workspace = document.querySelector('main');
      if (embedded && workspace) parent.postMessage({ source: 'sharpstudy-lab', height: Math.max(500, Math.ceil(workspace.getBoundingClientRect().bottom + scrollY + 18)) }, location.origin);
    };

    function updateRangeBadge(input) {
      const badge = input.closest('.control-box')?.querySelector('.badge');
      if (!badge) return;
      const text = badge.textContent;
      badge.textContent = text.replace(/-?\d+(?:\.\d+)?/, input.value);
    }

    const unwrappedSelect = selectLab;
    selectLab = (id, showBriefing) => {
      if (!LABS.some(lab => lab.id === id) || isAutoSolving) return;
      if (embedded && id !== activeLabId) {
        parent.postMessage({ source: 'sharpstudy-lab', lab: id, subject: activeSubject }, location.origin);
        return;
      }
      unwrappedSelect(id, showBriefing);
    };

    const nativeClose = closeConceptModal;
    closeConceptModal = () => {
      nativeClose();
      try { sessionStorage.setItem('sharpstudy-lab-guide-' + activeLabId, 'done'); } catch {}
    };
    try {
      if (sessionStorage.getItem('sharpstudy-lab-guide-' + activeLabId) === 'done') document.getElementById('conceptModal').classList.remove('open');
    } catch {}
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.getElementById('conceptModal').classList.contains('open')) closeConceptModal();
    });
    window.addEventListener('pagehide', () => {
      VoiceEngine.stop();
      if (typeof SoundAudio !== 'undefined') SoundAudio.stop?.();
    });
    if (embedded) {
      const observer = new ResizeObserver(resizeReport);
      observer.observe(document.body);
      window.addEventListener('load', resizeReport, { once: true });
    }

    // Boot Application""", 1)
assert "SharpStudy standalone and embedded entry point" in html

output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(html, encoding="utf-8", newline="\n")
