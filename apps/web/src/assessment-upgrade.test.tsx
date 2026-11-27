import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Route, Router, Switch } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { QuestionCard } from "./components/QuestionCard";
import { WorksheetPage } from "./pages/Worksheet";
import { ExamPage } from "./pages/Exam";
import type { PublicQuestion } from "@studysmart/shared";

const TREE = {
  boardCode: "CBSE",
  boardName: "CBSE",
  academicYear: "2026-27",
  classes: [
    {
      classLevel: 6,
      subjects: [
        {
          id: "s-maths",
          slug: "maths",
          name: { en: "Mathematics" },
          chapters: [
            {
              id: "c-paa",
              slug: "perimeter-and-area",
              position: 6,
              name: { en: "Perimeter and Area" },
              topics: [{ id: "00000000-0000-4000-8000-000000000001", slug: "whole-chapter", name: { en: "Whole Chapter" } }],
            },
          ],
        },
      ],
    },
  ],
};

const TIERED_QUESTIONS: PublicQuestion[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    key: "tb-fill-1",
    round: 1,
    tier: "textbook",
    marks: 1,
    type: "fill",
    stem: { en: "The perimeter of a rectangle 14 cm by 6 cm is ___." },
    unit: { en: "cm" },
    hints: [{ en: "Use 2 × (length + breadth)." }],
    hasSolutionSteps: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    key: "ex-mcq-1",
    round: 2,
    tier: "exam",
    marks: 2,
    type: "mcq",
    stem: { en: "What is the area of a square of side 11 cm?" },
    options: [
      { id: "right", text: { en: "121 sq cm" } },
      { id: "o0", text: { en: "44 cm" } },
    ],
    hints: [{ en: "Area = side × side." }],
    hasSolutionSteps: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    key: "adv-fill-1",
    round: 4,
    tier: "advanced",
    marks: 3,
    type: "fill",
    stem: { en: "If a square side is doubled, original area / new area = ___." },
    hints: [{ en: "Compare s² with (2s)²." }],
    hasSolutionSteps: true,
  },
];

function mockFetch() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.includes("/api/v1/settings")) return new Response(JSON.stringify({ values: { "practice.audio.feedback": false, "practice.shuffleOptions": false } }), { status: 200 });
    if (url.includes("/api/v1/account/me")) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    if (url.includes("/api/v1/curriculum/boards/")) return new Response(JSON.stringify(TREE), { status: 200 });
    if (url.includes("/api/v1/practice/boards/")) {
      return new Response(JSON.stringify({ topicId: "00000000-0000-4000-8000-000000000001", questions: TIERED_QUESTIONS }), { status: 200 });
    }
    if (url.includes("/api/v1/practice/solution/")) {
      return new Response(JSON.stringify({
        id: TIERED_QUESTIONS[0]!.id,
        answer: { en: "40 cm" },
        explanation: { en: "2 × (14 + 6) = 40 cm." },
        solutionSteps: [{ en: "Add 14 + 6 = 20" }, { en: "Multiply by 2 = 40 cm" }],
        marks: 1,
        tier: "textbook",
      }), { status: 200 });
    }
    if (url.includes("/api/v1/practice/study-key")) {
      return new Response(JSON.stringify({
        answers: TIERED_QUESTIONS.map((q) => ({
          id: q.id,
          answer: { en: q.key === "tb-fill-1" ? "40 cm" : q.key === "ex-mcq-1" ? "121 sq cm" : "1/4" },
          explanation: { en: "Worked explanation." },
          solutionSteps: [{ en: "Step 1: Apply formula." }],
          marks: q.marks ?? 1,
          tier: q.tier,
        })),
      }), { status: 200 });
    }
    if (url.includes("/api/v1/practice/answers")) {
      const body = JSON.parse(String(init?.body ?? "{}"));
      const q = TIERED_QUESTIONS.find((x) => x.id === body.questionId)!;
      const correct =
        (q.key === "tb-fill-1" && String(body.response?.text ?? "").includes("40")) ||
        (q.key === "ex-mcq-1" && body.response?.optionId === "right") ||
        (q.key === "adv-fill-1" && String(body.response?.text ?? "").includes("0.25"));
      const maxMarks = q.marks ?? 1;
      return new Response(JSON.stringify({
        attemptId: body.attemptId,
        questionId: q.id,
        correct,
        explanation: { en: "Worked explanation." },
        solutionSteps: [{ en: "Step 1: Formula" }, { en: "Step 2: Final answer" }],
        correctAnswer: { en: q.key === "tb-fill-1" ? "40 cm" : q.key === "ex-mcq-1" ? "121 sq cm" : "1/4" },
        marksAwarded: correct ? maxMarks : 0,
        maxMarks,
        replay: false,
      }), { status: 200 });
    }
    return new Response(JSON.stringify({}), { status: 404 });
  });
}

function wrap(path: string, uiEl: React.ReactNode) {
  const { hook } = memoryLocation({ path });
  return render(
    <SettingsProvider>
      <AccountProvider>
        <Router hook={hook}>
          <Switch>{uiEl}</Switch>
        </Router>
      </AccountProvider>
    </SettingsProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("Assessment Upgrade UI (Practice, Worksheet, Chapter Test)", () => {
  it("Practice QuestionCard supports fill-in, Need a Hint, Step-by-Step Solution before & after answering", async () => {
    mockFetch();
    render(
      <SettingsProvider>
        <AccountProvider>
          <QuestionCard q={TIERED_QUESTIONS[0]!} onDone={() => undefined} />
        </AccountProvider>
      </SettingsProvider>,
    );

    expect(screen.getByText("📘 Textbook")).toBeTruthy();
    expect(screen.getByText("Fill in the blank", { selector: "span" })).toBeTruthy();
    expect(screen.getByText("1 mark")).toBeTruthy();

    // Hint before answering
    fireEvent.click(screen.getByRole("button", { name: /Give me a hint/i }));
    expect(screen.getByText(/Use 2 × \(length \+ breadth\)/i)).toBeTruthy();

    // Step-by-Step Solution toggle before answering
    fireEvent.click(screen.getByRole("button", { name: /Step-by-Step Solution/i }));
    await waitFor(() => expect(screen.getByText(/Multiply by 2 = 40 cm/i)).toBeTruthy());

    // Fill answer and check
    const input = screen.getByPlaceholderText(/Type your answer/i);
    fireEvent.change(input, { target: { value: "40cm" } });
    fireEvent.click(screen.getByRole("button", { name: /Check/i }));
    await waitFor(() => expect(screen.getByText(/1\/1 mark/i)).toBeTruthy());
    expect(screen.getByText(/Step 2: Final answer/i)).toBeTruthy();
  });

  it("Worksheet supports Part A/B/C grouping, Interactive Check Worksheet, and Answer Key & Solutions toggle", async () => {
    mockFetch();
    wrap("/worksheet/cbse/6/maths/perimeter-and-area", <Route path="/worksheet/:board/:cls/:subject/:chapter" component={WorksheetPage} />);

    await waitFor(() => expect(screen.getByText(/Part A — Textbook Questions/i)).toBeTruthy());
    expect(screen.getByText(/Part B — Extra Exam & Online Questions/i)).toBeTruthy();
    expect(screen.getByText(/Part C — Advanced Challenge/i)).toBeTruthy();

    // Self-study Answer Key & Solutions toggle
    fireEvent.click(screen.getByRole("button", { name: /Show Answer Key & Solutions/i }));
    await waitFor(() => expect(screen.getAllByText(/Step 1: Apply formula/i).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: /Hide Answer Key & Solutions/i }));

    // Interactive online answer + Check Worksheet
    const fillInputs = screen.getAllByPlaceholderText(/Fill in the blank/i);
    fireEvent.change(fillInputs[0]!, { target: { value: "40 cm" } });
    fireEvent.click(screen.getByRole("radio", { name: "121 sq cm" }));
    fireEvent.click(screen.getByRole("button", { name: /Check Worksheet/i }));

    await waitFor(() => expect(screen.getByText(/Worksheet Score: 3 \/ 6 marks \(50%\)/i)).toBeTruthy());
  });

  it("Chapter Test renders Review & Marks Report Card with Tier Breakdown and Revise Missed Questions", async () => {
    mockFetch();
    wrap("/exam/cbse/6/maths/perimeter-and-area", <Route path="/exam/:board/:cls/:subject/:chapter" component={ExamPage} />);

    await waitFor(() => expect(screen.getByRole("button", { name: /Start/i })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /Start/i }));

    // Q1 (Textbook fill) -> right ("40")
    fireEvent.change(screen.getByPlaceholderText(/Type your answer/i), { target: { value: "40" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    // Q2 (Exam MCQ) -> right ("121 sq cm")
    fireEvent.click(screen.getByRole("radio", { name: "121 sq cm" }));
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    // Q3 (Advanced fill) -> wrong ("99")
    fireEvent.change(screen.getByPlaceholderText(/Type your answer/i), { target: { value: "99" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => expect(screen.getByText(/Marks: 3 \/ 6 \(50%\)/i)).toBeTruthy());
    expect(screen.getByLabelText(/Breakdown by tier/i)).toBeTruthy();
    expect(screen.getAllByText(/Your answer:/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Revise Missed Questions \(1\)/i })).toBeTruthy();
  });
});
