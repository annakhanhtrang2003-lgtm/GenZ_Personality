import { useState } from "react";
import { buildProfile } from "../lib/personal-definition/profile";
import bank from "../lib/personal-definition/data/questions.json";
import universities from "../lib/personal-definition/data/universities.json";

const LIKERT = [
  { value: -2, label: "Rất sai" },
  { value: -1, label: "Hơi sai" },
  { value: 0, label: "Trung lập" },
  { value: 1, label: "Hơi đúng" },
  { value: 2, label: "Rất đúng" },
];

const DIMENSIONS = ["EI", "SN", "TF", "JP"];

const DIMENSION_LABEL = {
  EI: "Hướng ngoại / Hướng nội",
  SN: "Giác quan / Trực giác",
  TF: "Lý trí / Cảm xúc",
  JP: "Nguyên tắc / Linh hoạt",
};

const NUMEROLOGY_LABEL = {
  life_path: "Đường đời",
  expression: "Sứ mệnh",
  soul_urge: "Nội tâm",
  personality: "Nhân cách",
};

function Form({ onSubmit }) {
  const [name, setName] = useState("Khánh");
  const [fullName, setFullName] = useState("Nguyễn Thị Khánh Trang");
  const [university, setUniversity] = useState(universities[0].name);
  const [birthDate, setBirthDate] = useState("2003-06-15");

  return (
    <>
      <h1>Bạn là ai?</h1>
      <p className="sub">
        Điền vài thông tin, rồi trả lời {bank.size} câu. Không có câu nào đúng
        hay sai — cứ chọn cái gần bạn nhất.
      </p>

      <div className="field">
        <label htmlFor="name">Bạn muốn được gọi là gì?</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="fullName">
          Họ tên đầy đủ (dùng để tính thần số học — cần đủ dấu)
        </label>
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="university">Trường</label>
          <select
            id="university"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
          >
            {universities.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="birthDate">Ngày sinh</label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={() =>
          onSubmit({
            name: name.trim(),
            full_name: fullName.trim(),
            university,
            birth_date: birthDate,
          })
        }
        disabled={!name.trim() || !fullName.trim() || !birthDate}
      >
        Bắt đầu trả lời →
      </button>
    </>
  );
}

function Quiz({ onDone, onBack }) {
  const [responses, setResponses] = useState(() => bank.items.map(() => null));

  const answered = responses.filter((r) => r !== null).length;
  const complete = answered === bank.items.length;

  function set(index, value) {
    setResponses((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <>
      <div className="progress">
        <div className="meta">
          <span>
            Đã trả lời {answered}/{bank.items.length}
          </span>
          <button
            className="ghost"
            style={{ padding: "2px 10px", fontSize: 12 }}
            onClick={() =>
              setResponses(
                bank.items.map(() => LIKERT[Math.floor(Math.random() * 5)].value)
              )
            }
          >
            Điền ngẫu nhiên (test)
          </button>
        </div>
        <div className="bar">
          <i style={{ width: `${(answered / bank.items.length) * 100}%` }} />
        </div>
      </div>

      {bank.items.map((item, index) => (
        <div className="q" key={item.id}>
          <div className="qtext">
            {index + 1}. {item.text}
          </div>
          <div className="likert">
            {LIKERT.map((option) => (
              <button
                key={option.value}
                aria-pressed={responses[index] === option.value}
                onClick={() => set(index, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="qid" style={{ marginTop: 8 }}>
            {item.id} · {item.dimension} · key {item.key > 0 ? "+1" : "-1"}
          </div>
        </div>
      ))}

      <div className="actions">
        <button disabled={!complete} onClick={() => onDone(responses)}>
          {complete ? "Xem kết quả →" : `Còn ${bank.items.length - answered} câu`}
        </button>
        <button className="ghost" onClick={onBack}>
          ← Quay lại
        </button>
      </div>
    </>
  );
}

function Result({ profile, onRestart }) {
  const [showJson, setShowJson] = useState(false);
  const { mbti, zodiac, numerology, synthesis, user } = profile;

  return (
    <>
      <div className="card">
        <div className="type">{mbti.type}</div>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>
          {user.name} · {user.university} · {user.birth_date}
        </div>

        {DIMENSIONS.map((d) => {
          const score = mbti.dimensions[d];
          const poles = bank.poles[d];
          return (
            <div className="dim" key={d}>
              <div className="lbl">
                <span>
                  {poles.first} {score.first}%
                </span>
                <span style={{ fontSize: 12 }}>{DIMENSION_LABEL[d]}</span>
                <span>
                  {score.second}% {poles.second}
                </span>
              </div>
              <div className="track">
                <i style={{ width: `${score.first}%` }} />
              </div>
              <div className="qid">raw {score.raw}</div>
            </div>
          );
        })}

        <div className="pills" style={{ marginTop: 14 }}>
          {mbti.traits.map((t) => (
            <span className="pill" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="card narrative">{synthesis.narrative}</div>

      <div className="card">
        <h3>Cung hoàng đạo</h3>
        <div style={{ fontSize: 20, marginBottom: 4 }}>{zodiac.sun_sign}</div>
        <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 10 }}>
          {zodiac.element} · {zodiac.modality}
        </div>
        <div className="pills">
          {zodiac.traits.map((t) => (
            <span className="pill" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Thần số học</h3>
        <div className="nums">
          {Object.keys(NUMEROLOGY_LABEL).map((k) => (
            <div className="num" key={k}>
              <b>{numerology[k]}</b>
              <span>{NUMEROLOGY_LABEL[k]}</span>
            </div>
          ))}
        </div>
        {Object.keys(NUMEROLOGY_LABEL).map((k) => (
          <p key={k} style={{ fontSize: 14 }}>
            <strong style={{ color: "var(--accent)" }}>
              {NUMEROLOGY_LABEL[k]} {numerology[k]}
            </strong>{" "}
            — {numerology.interpretations[k]}
          </p>
        ))}
      </div>

      <div className="card">
        <h3>Điểm mạnh</h3>
        <ul>
          {synthesis.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h3>Điều nên để ý</h3>
        <ul>
          {synthesis.growth_areas.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h3>Từ khoá tính cách</h3>
        <div className="pills">
          {synthesis.personality_keywords.map((s) => (
            <span className="pill" key={s}>
              {s}
            </span>
          ))}
        </div>

        <h3>Hướng nghề gợi mở</h3>
        <div className="pills">
          {synthesis.career_hints.map((s) => (
            <span className="pill" key={s}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="actions">
        <button onClick={onRestart}>Làm lại</button>
        <button className="ghost" onClick={() => setShowJson((v) => !v)}>
          {showJson ? "Ẩn" : "Xem"} JSON handoff
        </button>
      </div>

      {showJson && (
        <pre style={{ marginTop: 16 }}>{JSON.stringify(profile, null, 2)}</pre>
      )}
    </>
  );
}

export default function App() {
  const [step, setStep] = useState("form");
  const [input, setInput] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  function finish(responses) {
    try {
      setProfile(buildProfile({ ...input, responses }));
      setError(null);
      setStep("result");
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="wrap">
      <div className="banner">
        <strong>Harness</strong> — trang này chỉ để thử tay các module tất định
        trong <code>lib/personal-definition/</code>. Không phải UI sản phẩm; UI
        thật có plan riêng (plan §Scope).
      </div>

      {error && <div className="err">{error}</div>}

      {step === "form" && (
        <Form
          onSubmit={(value) => {
            setInput(value);
            setError(null);
            setStep("quiz");
            window.scrollTo(0, 0);
          }}
        />
      )}

      {step === "quiz" && (
        <Quiz onDone={finish} onBack={() => setStep("form")} />
      )}

      {step === "result" && profile && (
        <Result
          profile={profile}
          onRestart={() => {
            setProfile(null);
            setStep("form");
            window.scrollTo(0, 0);
          }}
        />
      )}
    </div>
  );
}
