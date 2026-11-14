# StudySmart (studysmart.in) – project notes for resuming

**Goal:** free, original, AI-assisted learning site for Indian school students (start CBSE Classes 3–7; TN State Board and Matriculation next). Philosophy: Understand → Explore → Practise → Explain → Master.

**Ground rules (from the owner)**
- ₹0 build. Free sign-ups OK; no paid subscriptions. A one-time cost under ₹500–1000 is allowed only for a key feature (domain).
- Audio teacher first (Malar Teacher voice/board); video/lip-sync later.
- For each feature, look for a free alternative (cross-check with ChatGPT/Perplexity) and record it in docs/01 and docs/free-tier-log.md.
- Build module by module; save to this folder after each module; do not mark done until tested.
- Original content only; no copied textbook text.

**Where things are**
- Project folder: `D:\Smart Learning Website`
- Spec: `Student_Learning_Platform_Master_Product_and_Technical_Specification.docx`
- Docs: `docs/00`–`05`; status: `REQUIREMENTS_STATUS.md`
- Malar Teacher project (separate): `C:\Users\itsme\Documents\Malar Teacher`, clips on `D:\Malar Teacher Clips`
- GitHub repo: `SmartLearning` (owner username to be confirmed; remote not yet connected)

**Run (after Module 1)**
```
corepack enable
pnpm install
pnpm -r typecheck
pnpm -r test
pnpm --filter api dev      # http://localhost:3000/health
pnpm --filter web dev      # http://localhost:5173
```

**Module 1 (Foundation) complete and tested. Next: Module 2 – curriculum import + browse (Postgres-backed repository).** See docs/05-roadmap.md.
