import { useState, useEffect, useRef, useCallback } from "react";

// ── THEME SYSTEM ──────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#0f0f0f", surface: "#1a1a1a", card: "#222222", border: "#2e2e2e",
    accent: "#e8d5b0", accentDim: "#b8a880", accentText: "#1a1508",
    text: "#f0ece4", textMuted: "#7a7570", textDim: "#3a3530",
    green: "#4caf84", amber: "#d4915a", red: "#c05a5a", blue: "#5a8fc0", purple: "#8a72c8",
    inputBg: "#1a1a1a", pillBg: "#2a2a2a",
  },
  light: {
    bg: "#f5f3ef", surface: "#ffffff", card: "#ffffff", border: "#e0dbd4",
    accent: "#7c5c2e", accentDim: "#9a7040", accentText: "#ffffff",
    text: "#1a1510", textMuted: "#7a6e62", textDim: "#c8c0b4",
    green: "#2e8f5e", amber: "#b8722a", red: "#a03838", blue: "#2a6fa0", purple: "#6040a8",
    inputBg: "#f0ede8", pillBg: "#ece8e2",
  },
};

function makeStyles(C) {
  return {
    app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontSize: "15px", lineHeight: 1.6 },
    topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: `1px solid ${C.border}`, background: C.surface, position: "sticky", top: 0, zIndex: 100 },
    logo: { fontFamily: "'Playfair Display',Georgia,serif", fontSize: "20px", fontWeight: 700, color: C.accent, letterSpacing: "-0.5px", cursor: "pointer" },
    btn: (v = "ghost", col) => {
      if (v === "primary") return { padding: "10px 22px", borderRadius: "8px", border: "none", background: col || C.accent, color: col ? "#fff" : C.accentText, fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "inherit", transition: "opacity 0.15s" };
      if (v === "outline") return { padding: "9px 18px", borderRadius: "8px", border: `1.5px solid ${col || C.border}`, background: "transparent", color: col || C.text, fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "inherit", transition: "all 0.15s" };
      return { padding: "8px 14px", borderRadius: "8px", border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "inherit", transition: "all 0.15s" };
    },
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "24px" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: `1px solid ${C.border}`, background: C.inputBg, color: C.text, fontSize: "15px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
    label: { fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "8px", display: "block" },
    tag: (col) => ({ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: col + "22", color: col, border: `1px solid ${col}44` }),
    pill: { display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", background: C.pillBg, color: C.textMuted, border: `1px solid ${C.border}` },
  };
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "Never";
  const d = Math.floor((Date.now() - ts) / 86400000);
  const h = Math.floor((Date.now() - ts) / 3600000);
  const m = Math.floor((Date.now() - ts) / 60000);
  if (d > 0) return `${d}d ago`; if (h > 0) return `${h}h ago`; if (m > 0) return `${m}m ago`; return "Just now";
}
function daysUntil(ds) { if (!ds) return null; return Math.ceil((new Date(ds) - Date.now()) / 86400000); }
function uid() { return `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

// ── DEMO DATA ─────────────────────────────────────────────────────────────────
const DEMO_COURSES = [
  {
    id: "nism15", name: "NISM Series XV", subtitle: "Research Analyst", progress: 45,
    lastStudied: Date.now() - 2 * 86400000, color: "#5a8fc0",
    examDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    sections: [
      { name: "Securities Laws", weight: 10, accuracy: 72 },
      { name: "Financial Analysis", weight: 25, accuracy: 58 },
      { name: "Equity Research", weight: 30, accuracy: 41 },
      { name: "Fixed Income", weight: 20, accuracy: 65 },
      { name: "Ethics & Standards", weight: 15, accuracy: 80 },
    ],
    examPattern: { questions: 100, duration: 120, passScore: 60, negativeMarking: 0.25, examType: "MCQ" },
    syllabus: "Chapter 1: Securities Laws\nChapter 2: Financial Statement Analysis\nChapter 3: Equity Research & Valuation\nChapter 4: Fixed Income\nChapter 5: Ethics",
    topics: [
      { id: "t1", name: "SEBI Regulations", section: "Securities Laws", status: "done" },
      { id: "t2", name: "Income Statement Analysis", section: "Financial Analysis", status: "done" },
      { id: "t3", name: "Equity Valuation", section: "Equity Research", status: "progress" },
      { id: "t4", name: "Bond Duration", section: "Fixed Income", status: "not_started" },
      { id: "t5", name: "Code of Ethics", section: "Ethics & Standards", status: "done" },
    ],
    resources: [
      { type: "book", label: "NISM Official Workbook", value: "NISM Series XV Workbook 2024" },
      { type: "website", label: "SEBI.gov.in", value: "https://sebi.gov.in" },
    ],
    notes: "", quizScores: [{ date: Date.now() - 7200000, score: 7, total: 10, topic: "Equity Valuation" }],
  },
  {
    id: "cfa1", name: "CFA Level 1", subtitle: "Chartered Financial Analyst", progress: 18,
    lastStudied: Date.now() - 5 * 86400000, color: "#8a72c8",
    examDate: new Date(Date.now() + 120 * 86400000).toISOString().split("T")[0],
    sections: [
      { name: "Ethics", weight: 15, accuracy: 60 }, { name: "Quantitative Methods", weight: 8, accuracy: 45 },
      { name: "Economics", weight: 8, accuracy: 0 }, { name: "Financial Reporting", weight: 15, accuracy: 0 },
      { name: "Equity Investments", weight: 11, accuracy: 0 }, { name: "Fixed Income", weight: 11, accuracy: 0 },
      { name: "Derivatives", weight: 6, accuracy: 0 }, { name: "Portfolio Management", weight: 8, accuracy: 0 },
    ],
    examPattern: { questions: 180, duration: 270, passScore: 60, negativeMarking: 0, examType: "MCQ" },
    syllabus: "Topic 1: Ethics & Professional Standards\nTopic 2: Quantitative Methods\nTopic 3: Economics\nTopic 4: Financial Reporting\nTopic 5: Equity Investments\nTopic 6: Fixed Income\nTopic 7: Derivatives\nTopic 8: Portfolio Management",
    topics: [
      { id: "t1", name: "Standards of Professional Conduct", section: "Ethics", status: "done" },
      { id: "t2", name: "GIPS Standards", section: "Ethics", status: "progress" },
      { id: "t3", name: "Time Value of Money", section: "Quantitative Methods", status: "done" },
    ],
    resources: [
      { type: "book", label: "CFA Institute Curriculum", value: "CFA Program Curriculum 2024 Level I" },
      { type: "website", label: "CFA Institute", value: "https://cfainstitute.org" },
      { type: "video", label: "Mark Meldrum YouTube", value: "https://youtube.com/@markmeldrum" },
    ],
    notes: "", quizScores: [],
  },
  {
    id: "delfa2", name: "DELF A2", subtitle: "Diplôme d'Études en Langue Française", progress: 0,
    lastStudied: null, color: "#4caf84", examDate: null,
    sections: [
      { name: "Listening", weight: 25, accuracy: 0 }, { name: "Reading", weight: 25, accuracy: 0 },
      { name: "Writing", weight: 25, accuracy: 0 }, { name: "Speaking", weight: 25, accuracy: 0 },
    ],
    examPattern: { questions: null, duration: 120, passScore: 50, negativeMarking: 0, examType: "Mixed" },
    syllabus: "Part 1: Listening Comprehension\nPart 2: Reading Comprehension\nPart 3: Written Production\nPart 4: Oral Production",
    topics: [
      { id: "t1", name: "Everyday Conversations", section: "Listening", status: "not_started" },
      { id: "t2", name: "Reading Short Texts", section: "Reading", status: "not_started" },
      { id: "t3", name: "Written Tasks", section: "Writing", status: "not_started" },
      { id: "t4", name: "Oral Expression", section: "Speaking", status: "not_started" },
    ],
    resources: [
      { type: "website", label: "TV5Monde Exercises", value: "https://apprendre.tv5monde.com" },
      { type: "book", label: "DELF A2 Preparation Book", value: "DELF A2 200 activités" },
    ],
    notes: "", quizScores: [],
  },
];

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function ProgressRing({ progress, size = 110, stroke = 9, color }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} stroke="currentColor" style={{ opacity: 0.12 }} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} stroke={color}
        strokeDasharray={circ} strokeDashoffset={circ - (progress / 100) * circ} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.7s ease" }} />
    </svg>
  );
}

function ProgressBar({ value, color, C }) {
  return (
    <div style={{ height: "5px", background: C.border, borderRadius: "4px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, value)}%`, background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
    </div>
  );
}

function Spinner({ C }) {
  return (
    <>
      <style>{`@keyframes lms-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: "36px", height: "36px", border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "lms-spin 0.8s linear infinite" }} />
    </>
  );
}

// ── COURSE SETUP WIZARD ───────────────────────────────────────────────────────
const RESOURCE_TYPES = [
  { key: "book", icon: "📚", label: "Book" },
  { key: "website", icon: "🌐", label: "Website" },
  { key: "video", icon: "🎥", label: "Video / YouTube" },
  { key: "document", icon: "📄", label: "Document / PDF" },
  { key: "notes", icon: "📝", label: "Your Notes" },
];

const EXAM_TYPES = ["MCQ", "Written", "Oral", "Mixed", "Project-based", "Other"];
const COURSE_COLORS = ["#5a8fc0","#8a72c8","#4caf84","#d4915a","#c05a5a","#c8904a","#5abca0","#9a60b0"];

function StepIndicator({ current, total, C }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "32px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: "3px", flex: 1, borderRadius: "2px", background: i <= current ? C.accent : C.border, transition: "background 0.3s" }} />
      ))}
      <span style={{ fontSize: "12px", color: C.textMuted, whiteSpace: "nowrap", marginLeft: "4px" }}>{current + 1} / {total}</span>
    </div>
  );
}

function AddCourseScreen({ onSave, onBack, editCourse, C, S }) {
  const isEdit = !!editCourse;
  const [step, setStep] = useState(0);

  // Step 0 — basics
  const [name, setName] = useState(editCourse?.name || "");
  const [subtitle, setSubtitle] = useState(editCourse?.subtitle || "");
  const [color, setColor] = useState(editCourse?.color || COURSE_COLORS[0]);

  // Step 1 — syllabus
  const [syllabus, setSyllabus] = useState(editCourse?.syllabus || "");
  const [sections, setSections] = useState(editCourse?.sections || []);
  const [newSec, setNewSec] = useState("");
  const [newSecWeight, setNewSecWeight] = useState("");

  // Step 2 — exam pattern
  const [examDate, setExamDate] = useState(editCourse?.examDate || "");
  const [examType, setExamType] = useState(editCourse?.examPattern?.examType || "MCQ");
  const [questions, setQuestions] = useState(editCourse?.examPattern?.questions || "");
  const [duration, setDuration] = useState(editCourse?.examPattern?.duration || "");
  const [passScore, setPassScore] = useState(editCourse?.examPattern?.passScore || "60");
  const [negMark, setNegMark] = useState(editCourse?.examPattern?.negativeMarking || "0");

  // Step 3 — resources
  const [resources, setResources] = useState(editCourse?.resources || []);
  const [resType, setResType] = useState("book");
  const [resLabel, setResLabel] = useState("");
  const [resValue, setResValue] = useState("");

  // Step 4 — notes / material
  const [notes, setNotes] = useState(editCourse?.notes || "");
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadStatus("⏳ Reading file…");
    if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      const text = await file.text();
      setNotes(prev => prev ? prev + "\n\n" + text : text);
      setUploadStatus(`✓ ${file.name} added (${text.length} chars)`);
      return;
    }
    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const str = new TextDecoder("latin1").decode(uint8);
        const streams = str.match(/stream[\s\S]*?endstream/g) || [];
        let text = "";
        streams.forEach(s => {
          const cleaned = s.replace(/stream|endstream|[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]/g, " ")
            .replace(/\s+/g, " ").trim();
          const words = cleaned.match(/[a-zA-Z][a-zA-Z0-9\s.,;:'"!?()\/\-]{3,}/g) || [];
          text += words.join(" ") + " ";
        });
        text = text.replace(/\s+/g, " ").trim();
        if (text.length > 100) {
          setNotes(prev => prev ? prev + "\n\n" + text : text);
          setUploadStatus(`✓ ${file.name} extracted (${text.length} chars)`);
        } else {
          setUploadStatus("⚠ Could not extract text from this PDF. Try copy-pasting your notes instead.");
        }
      } catch { setUploadStatus("✗ Could not read PDF. Please paste your notes as text."); }
      return;
    }
    setUploadStatus("✗ Unsupported file. Use PDF, TXT, or MD files.");
  };

  const STEPS = [
    "Course basics",
    "Syllabus & sections",
    "Exam pattern",
    "Study resources",
    "Notes & material",
  ];

  const addSection = () => {
    if (!newSec.trim()) return;
    setSections([...sections, { name: newSec.trim(), weight: Number(newSecWeight) || 0, accuracy: 0 }]);
    setNewSec(""); setNewSecWeight("");
  };

  const addResource = () => {
    if (!resLabel.trim() && !resValue.trim()) return;
    setResources([...resources, { type: resType, label: resLabel.trim(), value: resValue.trim() }]);
    setResLabel(""); setResValue("");
  };

  const handleFinish = () => {
    const course = {
      id: editCourse?.id || uid(),
      name: name.trim(), subtitle: subtitle.trim(), color,
      progress: editCourse?.progress || 0,
      lastStudied: editCourse?.lastStudied || null,
      examDate: examDate || null,
      sections, syllabus,
      examPattern: { questions: Number(questions) || null, duration: Number(duration) || null, passScore: Number(passScore) || 60, negativeMarking: Number(negMark) || 0, examType },
      topics: editCourse?.topics || sections.map((s, i) => ({ id: `t${i}`, name: s.name + " – Introduction", section: s.name, status: "not_started" })),
      resources, notes,
      quizScores: editCourse?.quizScores || [],
    };
    onSave(course);
  };

  const inputFocus = (e) => { e.target.style.borderColor = C.accent; };
  const inputBlur = (e) => { e.target.style.borderColor = C.border; };

  const canNext = [
    name.trim().length > 0,
    true,
    true,
    true,
    true,
  ][step];

  return (
    <div style={{ padding: "32px 28px", maxWidth: "600px", margin: "0 auto" }}>
      <button style={S.btn()} onClick={onBack} aria-label="Go back">← Back</button>

      <h2 style={{ fontSize: "22px", fontFamily: "'Playfair Display',serif", fontWeight: 700, margin: "20px 0 24px", color: C.text }}>
        {isEdit ? "Edit course" : "Set up your course"}
      </h2>

      <StepIndicator current={step} total={STEPS.length} C={C} />

      <div style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.accent, letterSpacing: "0.05em" }}>
          {STEPS[step].toUpperCase()}
        </span>
      </div>

      {/* ── STEP 0: BASICS ── */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={S.label}>Course name *</label>
            <input style={S.input} value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. NISM Series XV, CFA Level 1, IELTS, UPSC…"
              onFocus={inputFocus} onBlur={inputBlur} autoFocus />
            <p style={{ fontSize: "12px", color: C.textMuted, marginTop: "6px" }}>Can be a certification, language exam, degree module — anything you're studying for.</p>
          </div>

          <div>
            <label style={S.label}>Short description (optional)</label>
            <input style={S.input} value={subtitle} onChange={e => setSubtitle(e.target.value)}
              placeholder="e.g. Research Analyst Certification"
              onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          <div>
            <label style={S.label}>Course colour</label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {COURSE_COLORS.map(col => (
                <button key={col} onClick={() => setColor(col)} aria-label={col}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", background: col, border: color === col ? `3px solid ${C.text}` : `2px solid transparent`, cursor: "pointer", transition: "transform 0.1s", transform: color === col ? "scale(1.2)" : "scale(1)" }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: SYLLABUS ── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={S.label}>Paste your syllabus</label>
            <textarea style={{ ...S.input, minHeight: "130px", resize: "vertical", lineHeight: 1.6 }}
              value={syllabus} onChange={e => setSyllabus(e.target.value)}
              placeholder={"Chapter 1: Introduction\nChapter 2: Core Concepts\nChapter 3: Advanced Topics\n…"}
              onFocus={inputFocus} onBlur={inputBlur} />
            <p style={{ fontSize: "12px", color: C.textMuted, marginTop: "6px" }}>The AI tutor will use this to suggest what to teach and in what order.</p>
          </div>

          <div>
            <label style={S.label}>Sections / topics with weightage</label>
            <p style={{ fontSize: "12px", color: C.textMuted, marginBottom: "12px" }}>Add each section of the exam with how much % it contributes to the final score.</p>

            {sections.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                {sections.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: C.surface, borderRadius: "10px", border: `1px solid ${C.border}` }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "14px", color: C.text }}>{s.name}</span>
                    <span style={S.tag(color)}>{s.weight}%</span>
                    <button style={{ ...S.btn(), padding: "3px 8px", color: C.red, border: "none" }}
                      onClick={() => setSections(sections.filter((_, j) => j !== i))}>✕</button>
                  </div>
                ))}
                <div style={{ fontSize: "12px", color: sections.reduce((a, s) => a + s.weight, 0) === 100 ? C.green : C.amber, marginTop: "4px" }}>
                  Total: {sections.reduce((a, s) => a + s.weight, 0)}% {sections.reduce((a, s) => a + s.weight, 0) === 100 ? "✓" : "(should add up to 100%)"}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ ...S.label, marginBottom: "4px" }}>Section name</label>
                <input style={S.input} value={newSec} onChange={e => setNewSec(e.target.value)}
                  placeholder="e.g. Equity Research" onKeyDown={e => e.key === "Enter" && addSection()}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ width: "80px" }}>
                <label style={{ ...S.label, marginBottom: "4px" }}>Weight %</label>
                <input type="number" style={{ ...S.input, textAlign: "center" }} value={newSecWeight}
                  onChange={e => setNewSecWeight(e.target.value)} placeholder="30"
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <button style={{ ...S.btn("primary"), height: "46px", paddingTop: 0, paddingBottom: 0 }} onClick={addSection}>+ Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: EXAM PATTERN ── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={S.label}>Exam date</label>
            <input type="date" style={S.input} value={examDate} onChange={e => setExamDate(e.target.value)}
              onFocus={inputFocus} onBlur={inputBlur} />
            {examDate && daysUntil(examDate) !== null && (
              <p style={{ fontSize: "12px", color: daysUntil(examDate) < 30 ? C.amber : C.green, marginTop: "6px" }}>
                {daysUntil(examDate)} days away
              </p>
            )}
          </div>

          <div>
            <label style={S.label}>Exam type</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {EXAM_TYPES.map(t => (
                <button key={t} onClick={() => setExamType(t)}
                  style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px solid ${examType === t ? color : C.border}`, background: examType === t ? color + "22" : "transparent", color: examType === t ? color : C.textMuted, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={S.label}>Total questions</label>
              <input type="number" style={S.input} value={questions} onChange={e => setQuestions(e.target.value)}
                placeholder="e.g. 100" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Duration (minutes)</label>
              <input type="number" style={S.input} value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 120" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Pass score (%)</label>
              <input type="number" style={S.input} value={passScore} onChange={e => setPassScore(e.target.value)}
                placeholder="e.g. 60" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={S.label}>Negative marking (marks deducted)</label>
              <input type="number" step="0.01" style={S.input} value={negMark} onChange={e => setNegMark(e.target.value)}
                placeholder="0 = none, 0.25 = quarter" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>

          <div style={{ background: C.surface, borderRadius: "12px", padding: "16px", border: `1px solid ${C.border}` }}>
            <p style={{ ...S.label, marginBottom: "10px" }}>Summary</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                ["Type", examType],
                ["Questions", questions || "—"],
                ["Duration", duration ? `${duration} min` : "—"],
                ["Pass score", passScore ? `${passScore}%` : "60%"],
                ["Negative marking", Number(negMark) > 0 ? `-${negMark} per wrong` : "None"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: C.textMuted }}>{k}</span>
                  <span style={{ fontWeight: 600, color: C.text }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: RESOURCES ── */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <p style={{ fontSize: "14px", color: C.textMuted, margin: 0 }}>Add all the study material you'll be using — books, websites, YouTube channels, PDFs, etc. The AI tutor will know what sources you're working from.</p>

          {resources.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {resources.map((r, i) => {
                const rt = RESOURCE_TYPES.find(x => x.key === r.type);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: C.surface, borderRadius: "10px", border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: "18px" }}>{rt?.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, marginBottom: "1px" }}>{r.label || r.value}</div>
                      {r.label && r.value && <div style={{ fontSize: "12px", color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</div>}
                    </div>
                    <span style={S.pill}>{rt?.label}</span>
                    <button style={{ ...S.btn(), padding: "3px 8px", color: C.red, border: "none" }}
                      onClick={() => setResources(resources.filter((_, j) => j !== i))}>✕</button>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ background: C.surface, borderRadius: "12px", padding: "16px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={S.label}>Resource type</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {RESOURCE_TYPES.map(rt => (
                  <button key={rt.key} onClick={() => setResType(rt.key)}
                    style={{ padding: "6px 12px", borderRadius: "20px", border: `1.5px solid ${resType === rt.key ? color : C.border}`, background: resType === rt.key ? color + "22" : "transparent", color: resType === rt.key ? color : C.textMuted, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s", fontWeight: 600 }}>
                    {rt.icon} {rt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={S.label}>Label / title</label>
                <input style={S.input} value={resLabel} onChange={e => setResLabel(e.target.value)}
                  placeholder={resType === "website" ? "e.g. SEBI Official Website" : resType === "video" ? "e.g. Mark Meldrum CFA" : resType === "book" ? "e.g. CFA Institute Curriculum" : "Label"}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label style={S.label}>{resType === "website" || resType === "video" ? "URL / link" : resType === "document" ? "File name or paste content" : "Title / ISBN / details"}</label>
                <input style={S.input} value={resValue} onChange={e => setResValue(e.target.value)}
                  placeholder={resType === "website" ? "https://…" : resType === "video" ? "https://youtube.com/…" : resType === "notes" ? "Paste your notes here or describe them" : "e.g. NISM Series XV Workbook 2024"}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <button style={{ ...S.btn("outline", color), alignSelf: "flex-start" }} onClick={addResource}>+ Add resource</button>
            </div>
          </div>

          {resources.length === 0 && (
            <p style={{ fontSize: "12px", color: C.textMuted, textAlign: "center" }}>No resources added yet — you can skip this and add later.</p>
          )}
        </div>
      )}

      {/* ── STEP 4: NOTES ── */}
      {step === 4 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* PDF UPLOAD ZONE */}
          <div>
            <label style={S.label}>Upload study material</label>
            <div
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = C.border; }}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.border; const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file); }}
              style={{ border: `2px dashed ${C.border}`, borderRadius: "14px", padding: "28px 20px", textAlign: "center", background: C.surface, transition: "border-color 0.2s", cursor: "pointer" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>📄</div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>Drag & drop your PDF here</p>
              <p style={{ fontSize: "12px", color: C.textMuted, marginBottom: "14px" }}>PDF, TXT, MD files supported</p>
              <input type="file" accept=".pdf,.txt,.md" id="lms-file-upload" style={{ display: "none" }}
                onChange={e => { const file = e.target.files[0]; if (file) handleFileUpload(file); e.target.value = ""; }} />
              <label htmlFor="lms-file-upload"
                style={{ padding: "9px 20px", borderRadius: "8px", border: `1.5px solid ${C.accent}`, background: "transparent", color: C.accent, fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "inline-block" }}>
                Browse files
              </label>
              {uploadStatus && (
                <p style={{ margin: "12px 0 0", fontSize: "13px", fontWeight: 600,
                  color: uploadStatus.startsWith("✓") ? C.green : uploadStatus.startsWith("⚠") ? C.amber : uploadStatus.startsWith("⏳") ? C.textMuted : C.red }}>
                  {uploadStatus}
                </p>
              )}
            </div>
            <p style={{ fontSize: "12px", color: C.textMuted, marginTop: "6px" }}>Text will be extracted from your PDF and used as the AI tutor's study source.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
            <span style={{ fontSize: "12px", color: C.textMuted, whiteSpace: "nowrap" }}>or paste notes below</span>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
          </div>

          <div>
            <label style={S.label}>Your study notes / key material</label>
            <textarea style={{ ...S.input, minHeight: "160px", resize: "vertical", lineHeight: 1.7 }}
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={"Paste your notes, key definitions, formulas, or important concepts here.\n\nThe AI tutor will teach STRICTLY from this text — no hallucinations.\n\nExample:\n- SEBI was established in 1988 under SEBI Act\n- P/E ratio = Price per share / Earnings per share\n- Duration measures bond price sensitivity to interest rates…"}
              onFocus={inputFocus} onBlur={inputBlur} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              <p style={{ fontSize: "12px", color: C.textMuted }}>The AI tutor's source of truth. The more you add, the better it teaches.</p>
              <span style={{ fontSize: "12px", color: C.textMuted }}>{notes.length} chars</span>
            </div>
          </div>

          {notes.length === 0 && (
            <div style={{ background: C.amber + "18", border: `1px solid ${C.amber}44`, borderRadius: "12px", padding: "14px 16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: C.amber, fontWeight: 600 }}>⚠ No material added</p>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: C.textMuted }}>Without study material, the AI tutor will use general knowledge. It will clearly flag this so you always know.</p>
            </div>
          )}

          {notes.length > 0 && (
            <div style={{ background: C.green + "18", border: `1px solid ${C.green}44`, borderRadius: "12px", padding: "14px 16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: C.green, fontWeight: 600 }}>✓ Material ready</p>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: C.textMuted }}>The AI tutor will teach strictly from your notes — no outside knowledge added.</p>
            </div>
          )}

          <div style={{ background: C.surface, borderRadius: "12px", padding: "16px", border: `1px solid ${C.border}` }}>
            <p style={{ ...S.label, marginBottom: "10px" }}>Course summary</p>
            {[
              ["Name", name],
              ["Sections", sections.length > 0 ? sections.map(s => `${s.name} (${s.weight}%)`).join(", ") : "None added"],
              ["Exam date", examDate ? `${examDate} (${daysUntil(examDate)} days)` : "Not set"],
              ["Exam type", examType],
              ["Resources", resources.length > 0 ? `${resources.length} added` : "None"],
              ["Study notes", notes.length > 0 ? `${notes.length} characters` : "None"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: "12px", justifyContent: "space-between", fontSize: "13px", padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textMuted, flexShrink: 0 }}>{k}</span>
                <span style={{ color: C.text, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", paddingTop: "20px", borderTop: `1px solid ${C.border}` }}>
        <button style={S.btn()} onClick={() => step === 0 ? onBack() : setStep(step - 1)}>
          {step === 0 ? "Cancel" : "← Previous"}
        </button>
        {step < STEPS.length - 1 ? (
          <button style={{ ...S.btn("primary"), opacity: canNext ? 1 : 0.4 }} onClick={() => canNext && setStep(step + 1)} disabled={!canNext}>
            Next →
          </button>
        ) : (
          <button style={S.btn("primary")} onClick={handleFinish}>
            {isEdit ? "Save changes" : "Create course →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeScreen({ courses, onOpen, onAdd, onDelete, onEdit, C, S }) {
  const [menu, setMenu] = useState(null);
  useEffect(() => {
    const close = () => setMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div style={{ padding: "32px 28px", maxWidth: "920px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontFamily: "'Playfair Display',serif", fontWeight: 700, margin: 0, color: C.text }}>My Courses</h1>
          <p style={{ margin: "4px 0 0", color: C.textMuted, fontSize: "14px" }}>Welcome back, Abhijeet · {courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <button style={S.btn("primary")} onClick={onAdd}>+ Add Course</button>
      </div>

      {courses.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>📚</div>
          <p style={{ fontSize: "17px", color: C.text, marginBottom: "8px" }}>No courses yet</p>
          <p style={{ color: C.textMuted }}>Hit "+ Add Course" to get started</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {courses.map(c => {
          const days = daysUntil(c.examDate);
          return (
            <div key={c.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "22px", position: "relative", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.color + "88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: c.color + "22", border: `1.5px solid ${c.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                    {c.name.slice(0, 1)}
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{c.name}</div>
                    {c.subtitle && <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "2px" }}>{c.subtitle}</div>}
                  </div>
                </div>
                <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                  <button style={{ ...S.btn(), padding: "4px 8px", fontSize: "18px", color: C.textMuted, border: "none" }}
                    onClick={e => { e.stopPropagation(); setMenu(menu === c.id ? null : c.id); }}>···</button>
                  {menu === c.id && (
                    <div style={{ position: "absolute", right: 0, top: "110%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", zIndex: 50, minWidth: "130px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", overflow: "hidden" }}>
                      {[["✏️ Edit", () => onEdit(c)], ["🗑 Delete", () => onDelete(c.id)]].map(([lbl, fn]) => (
                        <button key={lbl} style={{ display: "block", width: "100%", padding: "10px 16px", background: "none", border: "none", color: lbl.includes("Delete") ? C.red : C.text, textAlign: "left", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}
                          onClick={() => { fn(); setMenu(null); }}>{lbl}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: C.textMuted, marginBottom: "6px" }}>
                  <span>{c.progress}% complete</span>
                  {days !== null && <span style={S.tag(days < 30 ? C.amber : C.blue)}>{days}d to exam</span>}
                </div>
                <ProgressBar value={c.progress} color={c.color} C={C} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: C.textMuted }}>Last studied: {timeAgo(c.lastStudied)}</span>
                {c.sections.length > 0 && <span style={S.pill}>{c.sections.length} sections</span>}
              </div>

              <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", marginTop: "14px", background: c.color + "22", color: c.color, border: `1px solid ${c.color}55`, fontFamily: "inherit" }}
                onClick={() => onOpen(c.id)}>
                {c.lastStudied ? "Continue →" : "Start →"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── COURSE HOME ───────────────────────────────────────────────────────────────
function CourseHomeScreen({ course, onLearn, onQuiz, onFlashcards, onMockExam, onBack, onEdit, C, S }) {
  const days = daysUntil(course.examDate);
  const weak = course.sections.filter(s => s.accuracy > 0 && s.accuracy < 60);

  return (
    <div style={{ padding: "28px", maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button style={S.btn()} onClick={onBack}>← My Courses</button>
        <button style={{ ...S.btn("outline"), fontSize: "13px", color: C.textMuted }} onClick={onEdit}>✏️ Edit course</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <ProgressRing progress={course.progress} size={120} stroke={10} color={course.color} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: C.text }}>{course.progress}%</span>
            <span style={{ fontSize: "10px", color: C.textMuted }}>done</span>
          </div>
        </div>
        <h2 style={{ fontSize: "22px", fontFamily: "'Playfair Display',serif", fontWeight: 700, margin: "14px 0 4px", color: C.text }}>{course.name}</h2>
        {course.subtitle && <p style={{ color: C.textMuted, margin: 0, fontSize: "14px" }}>{course.subtitle}</p>}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "10px" }}>
          {days !== null && <span style={S.tag(days < 30 ? C.amber : C.blue)}>{days} days to exam</span>}
          {course.examPattern?.examType && <span style={S.pill}>{course.examPattern.examType}</span>}
          {course.examPattern?.questions && <span style={S.pill}>{course.examPattern.questions} questions</span>}
          {course.examPattern?.passScore && <span style={S.pill}>Pass: {course.examPattern.passScore}%</span>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Learn", icon: "📖", desc: "AI explains topics to you", fn: onLearn, color: C.blue },
          { label: "Quiz me", icon: "✏️", desc: "Test what you've studied", fn: onQuiz, color: C.amber },
          { label: "Flashcards", icon: "🃏", desc: "Quick review, flip & rate", fn: onFlashcards, color: C.purple },
          { label: "Mock exam", icon: "🎯", desc: "Full timed simulation", fn: onMockExam, color: C.green },
        ].map(({ label, icon, desc, fn, color }) => (
          <button key={label} onClick={fn} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "20px", textAlign: "left", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = color + "14"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "2px" }}>{label}</div>
            <div style={{ fontSize: "12px", color: C.textMuted }}>{desc}</div>
          </button>
        ))}
      </div>

      {weak.length > 0 && (
        <div style={{ background: C.amber + "14", border: `1px solid ${C.amber}44`, borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
          <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 700, color: C.amber }}>⚠ Focus here</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {weak.map(s => <span key={s.name} style={S.tag(C.amber)}>{s.name} · {s.accuracy}%</span>)}
          </div>
        </div>
      )}

      {course.resources?.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <p style={{ ...S.label, marginBottom: "10px" }}>Study resources</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {course.resources.map((r, i) => {
              const rt = RESOURCE_TYPES.find(x => x.key === r.type);
              const isLink = r.value?.startsWith("http");
              return (
                <a key={i} href={isLink ? r.value : undefined} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "20px", fontSize: "13px", color: isLink ? C.blue : C.text, textDecoration: "none", cursor: isLink ? "pointer" : "default" }}>
                  <span>{rt?.icon}</span>{r.label || r.value}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {course.topics.length > 0 && (
        <div>
          <p style={{ ...S.label, marginBottom: "10px" }}>Topics</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {course.topics.map(t => (
              <button key={t.id} onClick={() => onLearn(t)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accentDim}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: t.status === "done" ? C.green : t.status === "progress" ? C.amber : C.textDim }} />
                <span style={{ flex: 1, fontSize: "14px", color: C.text }}>{t.name}</span>
                <span style={{ fontSize: "11px", color: C.textMuted }}>{t.section}</span>
                <span style={{ fontSize: "12px", color: C.textMuted }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {course.sections.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <p style={{ ...S.label, marginBottom: "12px" }}>Section progress</p>
          {course.sections.map(s => (
            <div key={s.name} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                <span style={{ color: C.text }}>{s.name}</span>
                <span style={{ color: C.textMuted }}>{s.weight}% of exam · {s.accuracy > 0 ? `${s.accuracy}% accuracy` : "not tested yet"}</span>
              </div>
              <ProgressBar value={s.accuracy} color={s.accuracy >= 70 ? C.green : s.accuracy >= 50 ? C.amber : s.accuracy > 0 ? C.red : C.border} C={C} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LEARN ─────────────────────────────────────────────────────────────────────
function LearnScreen({ course, topic, onBack, onQuiz, C, S }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  const callAI = useCallback(async (userMsg, isIntro = false) => {
    setLoading(true);
    const hasMaterial = course.notes && course.notes.trim().length > 20;
    const system = `You are a warm, friendly personal tutor teaching "${course.name}"${topic ? ` — topic: "${topic.name}"` : ""}.

Speak conversationally. No jargon. No bullet dumps. Like a smart friend explaining things.

${hasMaterial ? `Teach ONLY from this material. Do not add anything outside it:\n\n---\n${course.notes}\n---` : `No study notes uploaded yet. Use general knowledge but end with: "📌 You haven't added your study notes yet — paste them in Course Settings for exam-specific answers."`}

Rules: End with ONE comprehension question. Keep it under 250 words. Be warm and encouraging. Never say "as an AI".`;

    const msgs = isIntro
      ? [{ role: "user", content: `Introduce and explain: ${topic ? topic.name : "the first important topic of this course"}. Start directly.` }]
      : [...messages, { role: "user", content: userMsg }];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: msgs }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Something went wrong — try again.";
      setMessages(isIntro ? [{ role: "assistant", content: reply }] : [...messages, { role: "user", content: userMsg }, { role: "assistant", content: reply }]);
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong, please try again." }]); }
    setLoading(false);
  }, [course, topic, messages]);

  useEffect(() => { if (!started) { setStarted(true); callAI("", true); } }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = () => { if (!input.trim() || loading) return; const q = input; setInput(""); callAI(q); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <div style={{ padding: "14px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "12px", background: C.surface }}>
        <button style={S.btn()} onClick={onBack}>← Back</button>
        <div style={{ flex: 1, fontSize: "13px", color: C.textMuted }}>
          {course.name}{topic ? <> › <span style={{ color: C.text, fontWeight: 600 }}>{topic.name}</span></> : ""}
        </div>
        <button style={{ ...S.btn(), color: C.amber, fontSize: "13px" }} onClick={onQuiz}>Quiz me →</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", maxWidth: "700px", width: "100%", margin: "0 auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "20px", display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: C.accentText, marginRight: "10px", flexShrink: 0, marginTop: "2px" }}>T</div>
            )}
            <div style={{ maxWidth: "84%", padding: "14px 18px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px", background: m.role === "user" ? C.accent + "20" : C.card, border: `1px solid ${m.role === "user" ? C.accent + "50" : C.border}`, fontSize: "15px", lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: C.accentText }}>T</div>
            <div style={{ padding: "12px 18px", background: C.card, borderRadius: "4px 18px 18px 18px", border: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMuted }}>Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "14px 28px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <button style={{ ...S.btn(), fontSize: "13px" }} onClick={() => callAI("Got it! Move to the next topic please.")}>Got it, next →</button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{ ...S.input, flex: 1 }} value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask a question…" onKeyDown={e => e.key === "Enter" && send()}
              onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
            <button style={{ ...S.btn("primary"), opacity: loading || !input.trim() ? 0.4 : 1 }} onClick={send} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QUIZ ──────────────────────────────────────────────────────────────────────
function QuizScreen({ course, topic, onBack, C, S }) {
  const [phase, setPhase] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => { generate(); }, []);

  const generate = async () => {
    setPhase("loading"); setQuestions([]); setCurrent(0); setAnswers([]); setSelected(null);
    const sys = `Generate 5 MCQs about "${topic ? topic.name : course.name}" for "${course.name}".
${course.notes ? `Use ONLY this material:\n\n${course.notes}` : "Use general knowledge."}
Return ONLY valid JSON (no markdown):
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation":"..."}]`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: sys, messages: [{ role: "user", content: "Generate quiz." }] }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content?.[0]?.text?.replace(/```json|```/g, "").trim() || "[]");
      setQuestions(parsed); setPhase("quiz");
    } catch { setPhase("error"); }
  };

  const choose = (i) => { if (selected !== null) return; setSelected(i); };
  const next = () => {
    setAnswers([...answers, { q: questions[current], sel: selected }]);
    setSelected(null);
    if (current + 1 >= questions.length) setPhase("results");
    else setCurrent(current + 1);
  };

  if (phase === "loading") return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}><Spinner C={C} /><p style={{ color: C.textMuted }}>Generating quiz…</p></div>;
  if (phase === "error") return <div style={{ padding: "40px", textAlign: "center" }}><p style={{ color: C.red, marginBottom: "16px" }}>Couldn't generate quiz.</p><button style={S.btn("primary")} onClick={generate}>Try again</button><button style={{ ...S.btn(), marginLeft: "12px" }} onClick={onBack}>Back</button></div>;

  if (phase === "results") {
    const score = answers.filter(a => a.sel === a.q.correct).length;
    const pct = Math.round((score / questions.length) * 100);
    const wrong = answers.filter(a => a.sel !== a.q.correct);
    return (
      <div style={{ padding: "32px 28px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "52px", fontWeight: 700, fontFamily: "'Playfair Display',serif", color: pct >= 70 ? C.green : pct >= 50 ? C.amber : C.red }}>{pct}%</div>
          <p style={{ fontSize: "18px", fontWeight: 600, margin: "8px 0 4px", color: C.text }}>{score}/{questions.length} correct</p>
          <p style={{ color: C.textMuted }}>{pct >= 70 ? "Great job! 🎉" : pct >= 50 ? "Getting there!" : "Keep studying — you've got this"}</p>
        </div>
        {wrong.length > 0 && (<>
          <p style={S.label}>Review these</p>
          {wrong.map(({ q, sel }, i) => (
            <div key={i} style={{ ...C.card, borderRadius: "12px", border: `1px solid ${C.border}`, padding: "16px", marginBottom: "12px", background: C.card }}>
              <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: "14px", color: C.text }}>{q.question}</p>
              <p style={{ margin: "0 0 4px", fontSize: "13px", color: C.red }}>You chose: {q.options[sel]}</p>
              <p style={{ margin: "0 0 8px", fontSize: "13px", color: C.green }}>Correct: {q.options[q.correct]}</p>
              <p style={{ margin: 0, fontSize: "13px", color: C.textMuted }}>{q.explanation}</p>
            </div>
          ))}
        </>)}
        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button style={S.btn("primary")} onClick={generate}>Retake</button>
          <button style={S.btn()} onClick={onBack}>Back to course</button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div style={{ padding: "28px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button style={S.btn()} onClick={onBack}>← Back</button>
        <span style={{ fontSize: "13px", color: C.textMuted }}>Q {current + 1} of {questions.length}</span>
      </div>
      <ProgressBar value={(current / questions.length) * 100} color={course.color} C={C} />
      <p style={{ fontSize: "18px", fontWeight: 600, margin: "24px 0 20px", lineHeight: 1.5, color: C.text }}>{q.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        {q.options.map((opt, i) => {
          let bg = C.card, border = C.border, col = C.text;
          if (selected !== null) {
            if (i === q.correct) { bg = C.green + "22"; border = C.green; col = C.green; }
            else if (i === selected) { bg = C.red + "22"; border = C.red; col = C.red; }
          }
          return (
            <button key={i} onClick={() => choose(i)} style={{ padding: "14px 18px", background: bg, border: `1px solid ${border}`, borderRadius: "12px", textAlign: "left", cursor: selected !== null ? "default" : "pointer", fontSize: "14px", color: col, fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { if (selected === null) e.currentTarget.style.borderColor = course.color; }}
              onMouseLeave={e => { if (selected === null) e.currentTarget.style.borderColor = C.border; }}>
              <span style={{ fontWeight: 700, marginRight: "10px" }}>{["A","B","C","D"][i]}.</span>{opt.replace(/^[ABCD]\.\s*/,"")}
            </button>
          );
        })}
      </div>
      {selected !== null && <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px", marginBottom: "16px", fontSize: "14px", color: C.textMuted }}>{q.explanation}</div>}
      {selected !== null && <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "13px" }} onClick={next}>{current + 1 >= questions.length ? "See results →" : "Next →"}</button>}
    </div>
  );
}

// ── FLASHCARDS ────────────────────────────────────────────────────────────────
function FlashcardScreen({ course, onBack, C, S }) {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { generate(); }, []);

  const generate = async () => {
    setLoading(true);
    const sys = `Generate 12 flashcards for "${course.name}".
${course.notes ? `Use ONLY:\n\n${course.notes}` : "Use general knowledge."}
Return ONLY valid JSON: [{"front":"term","back":"explanation in 1-2 sentences"}]`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: sys, messages: [{ role: "user", content: "Generate flashcards." }] }),
      });
      const data = await res.json();
      setCards(JSON.parse(data.content?.[0]?.text?.replace(/```json|```/g, "").trim() || "[]"));
    } catch {}
    setLoading(false);
  };

  const rate = (r) => {
    setFlipped(false);
    setTimeout(() => {
      if (r === "hard") { const c = [...cards]; c.splice(idx + 3, 0, cards[idx]); setCards(c); }
      setIdx((idx + 1) % cards.length);
    }, 180);
  };

  if (loading) return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}><Spinner C={C} /><p style={{ color: C.textMuted }}>Generating flashcards…</p></div>;
  if (!cards.length) return <div style={{ padding: "40px", textAlign: "center" }}><p style={{ color: C.red }}>Couldn't generate cards.</p><button style={S.btn("primary")} onClick={generate}>Retry</button></div>;

  const card = cards[idx];
  return (
    <div style={{ padding: "28px", maxWidth: "540px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button style={S.btn()} onClick={onBack}>← Back</button>
        <span style={{ fontSize: "13px", color: C.textMuted }}>Card {idx + 1} of {cards.length}</span>
      </div>
      <ProgressBar value={(idx / cards.length) * 100} color={course.color} C={C} />

      <div onClick={() => setFlipped(!flipped)} style={{ marginTop: "28px", minHeight: "230px", background: C.card, border: `1px solid ${flipped ? C.accent + "80" : C.border}`, borderRadius: "20px", padding: "40px 32px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", transition: "border-color 0.25s, background 0.25s", userSelect: "none", background: flipped ? C.accent + "0a" : C.card }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>{flipped ? "Answer" : "Concept"}</span>
        <p style={{ margin: 0, fontSize: flipped ? "15px" : "20px", fontWeight: flipped ? 400 : 700, color: C.text, lineHeight: 1.5 }}>{flipped ? card.back : card.front}</p>
        {!flipped && <p style={{ margin: "18px 0 0", fontSize: "12px", color: C.textMuted }}>Tap to reveal</p>}
      </div>

      {flipped && (
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          {[["Easy", C.green], ["Okay", C.amber], ["Hard", C.red]].map(([l, col]) => (
            <button key={l} onClick={() => rate(l.toLowerCase())} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: col + "20", border: `1px solid ${col}55`, color: col, fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "10px", marginTop: "14px", justifyContent: "center" }}>
        <button style={S.btn()} onClick={() => { setFlipped(false); setTimeout(() => setIdx(Math.max(0, idx-1)), 150); }}>←</button>
        <button style={S.btn()} onClick={() => { setFlipped(false); setTimeout(() => setIdx((idx+1)%cards.length), 150); }}>→</button>
      </div>
    </div>
  );
}

// ── MOCK EXAM ─────────────────────────────────────────────────────────────────
function MockExamScreen({ course, onBack, C, S }) {
  const [phase, setPhase] = useState("pre");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const ep = course.examPattern;

  useEffect(() => () => clearInterval(timerRef.current), []);

  const start = async () => {
    setLoading(true);
    const n = Math.min(ep.questions || 20, 20);
    const sys = `Generate ${n} MCQs for the exam "${course.name}".
${course.notes ? `Use ONLY:\n\n${course.notes}` : "Use general knowledge."}
Return ONLY valid JSON:
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation":"...","section":"..."}]`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: sys, messages: [{ role: "user", content: "Generate exam." }] }),
      });
      const data = await res.json();
      const qs = JSON.parse(data.content?.[0]?.text?.replace(/```json|```/g, "").trim() || "[]");
      setQuestions(qs); setAnswers(new Array(qs.length).fill(null));
      const dur = (ep.duration || 30) * 60;
      setTimeLeft(dur);
      timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setPhase("results"); return 0; } return t - 1; }), 1000);
      setPhase("exam");
    } catch { alert("Failed. Try again."); }
    setLoading(false);
  };

  const next = () => {
    const a = [...answers]; a[current] = selected; setAnswers(a); setSelected(null);
    if (current + 1 >= questions.length) { clearInterval(timerRef.current); setPhase("results"); }
    else setCurrent(current + 1);
  };

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  if (phase === "pre") return (
    <div style={{ padding: "32px 28px", maxWidth: "520px", margin: "0 auto" }}>
      <button style={{ ...S.btn(), marginBottom: "24px" }} onClick={onBack}>← Back</button>
      <h2 style={{ fontSize: "22px", fontFamily: "'Playfair Display',serif", fontWeight: 700, margin: "0 0 6px", color: C.text }}>Mock Exam</h2>
      <p style={{ color: C.textMuted, marginBottom: "28px" }}>{course.name}</p>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
        <p style={S.label}>Exam rules</p>
        {[["Questions", ep.questions ? `${Math.min(ep.questions,20)} (capped at 20 for practice)` : "20"],["Duration", ep.duration ? `${ep.duration} min` : "30 min"],["Pass score", `${ep.passScore||60}%`],["Negative marking", ep.negativeMarking>0?`-${ep.negativeMarking} per wrong`:"None"]].map(([k,v])=>(
          <div key={k} style={{ display:"flex",justifyContent:"space-between",fontSize:"14px",padding:"6px 0",borderBottom:`1px solid ${C.border}` }}>
            <span style={{ color:C.textMuted }}>{k}</span><span style={{ fontWeight:600,color:C.text }}>{v}</span>
          </div>
        ))}
      </div>
      <button style={{ ...S.btn("primary"),width:"100%",justifyContent:"center",padding:"14px",fontSize:"16px",opacity:loading?0.6:1 }} onClick={start} disabled={loading}>
        {loading ? "Preparing…" : "Start Exam →"}
      </button>
    </div>
  );

  if (phase === "exam") {
    const q = questions[current];
    return (
      <div style={{ padding: "24px 28px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px" }}>
          <span style={{ fontSize:"13px",color:C.textMuted }}>Q {current+1} / {questions.length}</span>
          <span style={{ fontSize:"16px",fontWeight:700,color:timeLeft<60?C.red:C.text,fontVariantNumeric:"tabular-nums" }}>{fmt(timeLeft)}</span>
        </div>
        <ProgressBar value={(current/questions.length)*100} color={course.color} C={C} />
        <p style={{ fontSize:"18px",fontWeight:600,margin:"24px 0 20px",lineHeight:1.5,color:C.text }}>{q.question}</p>
        <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
          {q.options.map((opt,i)=>(
            <button key={i} onClick={()=>setSelected(i)} style={{ padding:"14px 18px",background:selected===i?course.color+"22":C.card,border:`1px solid ${selected===i?course.color:C.border}`,borderRadius:"12px",textAlign:"left",cursor:"pointer",fontSize:"14px",color:C.text,fontFamily:"inherit",transition:"all 0.15s" }}>
              <span style={{ fontWeight:700,marginRight:"10px" }}>{["A","B","C","D"][i]}.</span>{opt.replace(/^[ABCD]\.\s*/,"")}
            </button>
          ))}
        </div>
        <button style={{ ...S.btn("primary"),width:"100%",justifyContent:"center",padding:"13px",marginTop:"20px",opacity:selected===null?0.4:1 }} onClick={next} disabled={selected===null}>
          {current+1>=questions.length?"Finish →":"Next →"}
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const correct = answers.filter((a,i)=>a===questions[i]?.correct).length;
    const pct = Math.round((correct/questions.length)*100);
    const pass = pct >= (ep.passScore||60);
    const wrong = answers.map((a,i)=>({a,q:questions[i]})).filter(({a,q})=>a!==q?.correct&&a!==null);
    return (
      <div style={{ padding:"32px 28px",maxWidth:"620px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"32px" }}>
          <div style={{ fontSize:"56px",fontWeight:700,fontFamily:"'Playfair Display',serif",color:pass?C.green:C.red }}>{pct}%</div>
          <p style={{ fontSize:"22px",fontWeight:700,margin:"8px 0 4px",color:C.text }}>{pass?"Pass ✓":"Needs work"}</p>
          <p style={{ color:C.textMuted }}>{correct}/{questions.length} correct</p>
        </div>
        {wrong.length>0&&(<>
          <p style={S.label}>Wrong answers</p>
          {wrong.slice(0,6).map(({a,q},i)=>(
            <div key={i} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:"12px",padding:"16px",marginBottom:"10px" }}>
              <p style={{ margin:"0 0 8px",fontSize:"14px",fontWeight:600,color:C.text }}>{q.question}</p>
              <p style={{ margin:"0 0 4px",fontSize:"13px",color:C.red }}>You: {a!==null?q.options[a]:"Skipped"}</p>
              <p style={{ margin:"0 0 8px",fontSize:"13px",color:C.green }}>Correct: {q.options[q.correct]}</p>
              <p style={{ margin:0,fontSize:"13px",color:C.textMuted }}>{q.explanation}</p>
            </div>
          ))}
        </>)}
        <div style={{ display:"flex",gap:"12px",marginTop:"20px" }}>
          <button style={S.btn("primary")} onClick={()=>{setPhase("pre");setCurrent(0);setSelected(null);setAnswers([]);}}>Retake</button>
          <button style={S.btn()} onClick={onBack}>Back to course</button>
        </div>
      </div>
    );
  }
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [courses, setCourses] = useState(null);
  const [themeName, setThemeName] = useState("dark");
  const [screen, setScreen] = useState("home");
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editSource, setEditSource] = useState("home"); // "home" | "course"

  const C = THEMES[themeName];
  const S = makeStyles(C);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lms_courses");
      if (saved) { setCourses(JSON.parse(saved)); }
      else { setCourses(DEMO_COURSES); }
      const t = localStorage.getItem("lms_theme");
      if (t) setThemeName(t);
    } catch { setCourses(DEMO_COURSES); }
  }, []);

  useEffect(() => {
    if (courses === null) return;
    try { localStorage.setItem("lms_courses", JSON.stringify(courses)); } catch {}
  }, [courses]);

  const toggleTheme = () => {
    const next = themeName === "dark" ? "light" : "dark";
    setThemeName(next);
    try { localStorage.setItem("lms_theme", next); } catch {}
  };

  const activeCourse = courses?.find(c => c.id === activeCourseId);

  const openCourse = (id) => {
    setActiveCourseId(id);
    setActiveTopic(null);
    setCourses(prev => prev.map(c => c.id === id ? { ...c, lastStudied: Date.now() } : c));
    setScreen("course");
  };

  const saveCourse = (course) => {
    setCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      return exists ? prev.map(c => c.id === course.id ? course : c) : [...prev, course];
    });
    setActiveCourseId(course.id);
    setScreen(editSource === "course" ? "course" : "course"); // always go to course after save
    setEditingCourse(null);
  };

  const deleteCourse = (id) => {
    if (!confirm("Delete this course? This can't be undone.")) return;
    setCourses(prev => prev.filter(c => c.id !== id));
    if (activeCourseId === id) { setActiveCourseId(null); setScreen("home"); }
  };

  if (courses === null) return (
    <div style={{ ...makeStyles(THEMES.dark).app, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Spinner C={THEMES.dark} />
    </div>
  );

  const screenProps = { C, S };

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        button:disabled{opacity:0.4;cursor:not-allowed!important;}
        a{transition:opacity 0.15s;}a:hover{opacity:0.75;}
      `}</style>

      {/* TOP BAR */}
      <div style={S.topBar}>
        <span style={S.logo} onClick={() => setScreen("home")} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setScreen("home")}>
          Abhijñāna ✦
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {screen !== "home" && activeCourse && (
            <span style={{ fontSize: "13px", color: C.textMuted, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeCourse.name}</span>
          )}
          <button onClick={toggleTheme} style={{ ...S.btn(), padding: "7px 12px", fontSize: "16px", border: `1px solid ${C.border}` }} title="Toggle theme">
            {themeName === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* SCREENS */}
      <div style={{ overflowY: "auto", height: "calc(100vh - 60px)" }}>
        {screen === "home" && (
          <HomeScreen courses={courses} onOpen={openCourse}
            onAdd={() => { setEditingCourse(null); setEditSource("home"); setScreen("add"); }}
            onDelete={deleteCourse}
            onEdit={(c) => { setEditingCourse(c); setActiveCourseId(c.id); setEditSource("home"); setScreen("add"); }}
            {...screenProps} />
        )}
        {screen === "add" && (
          <AddCourseScreen onSave={saveCourse}
            onBack={() => { setEditingCourse(null); setScreen(editSource === "course" ? "course" : "home"); }}
            editCourse={editingCourse} {...screenProps} />
        )}
        {screen === "course" && activeCourse && (
          <CourseHomeScreen course={activeCourse}
            onLearn={(topic) => { setActiveTopic(topic?.id ? topic : null); setScreen("learn"); }}
            onQuiz={() => { setActiveTopic(null); setScreen("quiz"); }}
            onFlashcards={() => setScreen("flashcards")}
            onMockExam={() => setScreen("mockexam")}
            onBack={() => setScreen("home")}
            onEdit={() => { setEditingCourse(activeCourse); setEditSource("course"); setScreen("add"); }}
            {...screenProps} />
        )}
        {screen === "learn" && activeCourse && (
          <LearnScreen course={activeCourse} topic={activeTopic}
            onBack={() => setScreen("course")} onQuiz={() => setScreen("quiz")} {...screenProps} />
        )}
        {screen === "quiz" && activeCourse && (
          <QuizScreen course={activeCourse} topic={activeTopic} onBack={() => setScreen("course")} {...screenProps} />
        )}
        {screen === "flashcards" && activeCourse && (
          <FlashcardScreen course={activeCourse} onBack={() => setScreen("course")} {...screenProps} />
        )}
        {screen === "mockexam" && activeCourse && (
          <MockExamScreen course={activeCourse} onBack={() => setScreen("course")} {...screenProps} />
        )}
      </div>
    </div>
  );
}
