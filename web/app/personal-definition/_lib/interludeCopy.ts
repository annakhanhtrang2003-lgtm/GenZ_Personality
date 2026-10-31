/**
 * Break-screen copy. Source of truth for review: docs/interlude-copy.md —
 * edit both together. `{n}` is the number of the part's 10 answers that
 * leaned toward the revealed letter (only used on a clear lean, n ≥ 7).
 *
 * Each line: one conclusion + one "fact". Facts restate the pole
 * definitions in questions.json; they are not statistics.
 */
export const SUMMARY_COPY: Record<string, { clear: string; balanced: string }> = {
  E: {
    clear: "Bạn nghiêng về Hướng ngoại ({n}/10) — đông người là pin đầy. Fact: dân Hướng ngoại hay nghĩ bằng miệng, nói ra rồi mới thấy rõ ý mình.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Hướng ngoại — vui được, chill một mình cũng được. Fact: kiểu \"tuỳ mood\" này có tên hẳn hoi đó: ambivert.",
  },
  I: {
    clear: "Bạn nghiêng về Hướng nội ({n}/10) — sạc pin bằng thời gian một mình. Fact: Hướng nội không phải là ngại người, chỉ là bạn nghĩ xong rồi mới nói.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Hướng nội — đi tiệc được, nhưng về nhà vẫn thấy sướng hơn. Fact: kiểu \"tuỳ mood\" này có tên hẳn hoi đó: ambivert.",
  },
  S: {
    clear: "Bạn nghiêng về Thực tế ({n}/10) — tin những gì thấy được, kiểm chứng được. Fact: team Thực tế là kiểu hỏi \"nguồn đâu?\" trước khi tin một cái tin hot.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Thực tế — chân vẫn chạm đất nhưng đầu thỉnh thoảng bay. Fact: bạn đọc được cả chi tiết lẫn \"ý ngầm\", combo này hiếm phết.",
  },
  N: {
    clear: "Bạn nghiêng về Trực giác ({n}/10) — thấy được bức tranh lớn sau mấy con số. Fact: team Trực giác hay hỏi \"nếu như…\", đầu lúc nào cũng mở 10 tab.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Trực giác — mơ to nhưng vẫn check lại cho chắc. Fact: bạn đọc được cả chi tiết lẫn \"ý ngầm\", combo này hiếm phết.",
  },
  T: {
    clear: "Bạn nghiêng về Lý trí ({n}/10) — não nhảy số trước khi tim kịp lên tiếng. Fact: Lý trí không có nghĩa là lạnh lùng, bạn chỉ muốn mọi thứ hợp lý và công bằng.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Lý trí — phân tích kỹ nhưng vẫn để ý cảm xúc người khác. Fact: cân được cả logic lẫn lòng người là skill làm leader xịn đó.",
  },
  F: {
    clear: "Bạn nghiêng về Cảm xúc ({n}/10) — quyết gì cũng nghĩ tới người trong cuộc trước. Fact: Cảm xúc không phải là dễ khóc, mà là bạn chọn theo giá trị mình tin.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Cảm xúc — nghe tim trước, rồi để não duyệt lại. Fact: cân được cả logic lẫn lòng người là skill làm leader xịn đó.",
  },
  J: {
    clear: "Bạn nghiêng về Nguyên tắc ({n}/10) — có kế hoạch là thấy yên tâm. Fact: gạch xong một dòng to-do list là kiểu sướng rất riêng của team Nguyên tắc.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Nguyên tắc — thích có plan nhưng lệch plan cũng không sập. Fact: có plan A mà vẫn sẵn plan B là kiểu sống an toàn nhất.",
  },
  P: {
    clear: "Bạn nghiêng về Linh hoạt ({n}/10) — nước đến chân mới nhảy, mà nhảy vẫn đẹp. Fact: team Linh hoạt thích để ngỏ lựa chọn, vì biết đâu có option xịn hơn.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Linh hoạt — ứng biến giỏi nhưng việc quan trọng vẫn lên lịch. Fact: có plan A mà vẫn sẵn plan B là kiểu sống an toàn nhất.",
  },
};

/**
 * The question each part asks, index = part. Shown on the landing cards and
 * as the "what's next" hook on the break screen before that part.
 */
export const PART_HOOKS = [
  "Sóng não cực mạnh hay cần sạc pin?",
  "Thực tế phũ phàng hay hệ tâm linh?",
  "Não nhảy số hay tim lên tiếng?",
  "Kế hoạch 5 năm hay nước đến chân mới nhảy?",
] as const;

/** Hook on the last break screen, pulling toward the result. */
export const RESULT_HOOK = "Đủ 4 chữ rồi — linh vật của bạn đang chờ được đánh thức!";
