/**
 * Break-screen copy. Source of truth for review: docs/interlude-copy.md —
 * edit both together. `{n}` is the number of the part's 10 answers that
 * leaned toward the revealed letter (only used on a clear lean, n ≥ 7).
 *
 * Each entry is a one-sentence conclusion (`text`) plus a one-sentence tip
 * the view shows under a "Mách nhỏ" label (`tip`). Voice: Gen Z, no dashes
 * (both pinned by tests). Tips restate the pole definitions in
 * questions.json; none of it is a statistic.
 */
export interface SummaryLine {
  text: string;
  tip: string;
}

export const SUMMARY_COPY: Record<string, { clear: SummaryLine; balanced: SummaryLine }> = {
  E: {
    clear: {
      text: "Bạn nghiêng hẳn về Hướng ngoại ({n}/10), đông người là pin full vạch.",
      tip: "Hội Hướng ngoại hay vừa nói vừa nghĩ, nói ra rồi mới biết mình nghĩ gì.",
    },
    balanced: {
      text: "Bạn khá cân bằng, nhích nhẹ về Hướng ngoại nha, quẩy được mà chill một mình cũng ok.",
      tip: "Kiểu tuỳ mood này có tên hẳn hoi đó: ambivert.",
    },
  },
  I: {
    clear: {
      text: "Bạn nghiêng hẳn về Hướng nội ({n}/10), sạc pin bằng giờ me-time.",
      tip: "Hướng nội không phải là ngại người đâu, chỉ là bạn thích nghĩ kỹ rồi mới nói.",
    },
    balanced: {
      text: "Bạn khá cân bằng, nhích nhẹ về Hướng nội nha, đi tiệc vẫn vui nhưng về nhà nằm mới là chân ái.",
      tip: "Kiểu tuỳ mood này có tên hẳn hoi đó: ambivert.",
    },
  },
  S: {
    clear: {
      text: "Bạn nghiêng hẳn về Thực tế ({n}/10), mắt thấy tai nghe mới tin.",
      tip: "Thấy tin hot là bạn hỏi \"nguồn đâu?\" đầu tiên.",
    },
    balanced: {
      text: "Bạn khá cân bằng, nhích nhẹ về Thực tế nha, chân chạm đất mà đầu thỉnh thoảng vẫn bay.",
      tip: "Bạn đọc được cả chi tiết lẫn ý ngầm, combo này hiếm phết.",
    },
  },
  N: {
    clear: {
      text: "Bạn nghiêng hẳn về Trực giác ({n}/10), nhìn đâu cũng thấy bức tranh lớn.",
      tip: "Não bạn lúc nào cũng mở sẵn 10 tab \"lỡ như thì sao\".",
    },
    balanced: {
      text: "Bạn khá cân bằng, nhích nhẹ về Trực giác nha, mơ to nhưng vẫn check kỹ.",
      tip: "Bạn đọc được cả chi tiết lẫn ý ngầm, combo này hiếm phết.",
    },
  },
  T: {
    clear: {
      text: "Bạn nghiêng hẳn về Lý trí ({n}/10), não nhảy số nhanh hơn tim.",
      tip: "Lý trí không phải lạnh lùng đâu, bạn chỉ muốn mọi thứ hợp lý và công bằng.",
    },
    balanced: {
      text: "Bạn khá cân bằng, nhích nhẹ về Lý trí nha, phân tích kỹ mà vẫn để ý cảm xúc người khác.",
      tip: "Cân được cả logic lẫn lòng người là skill làm leader xịn đó.",
    },
  },
  F: {
    clear: {
      text: "Bạn nghiêng hẳn về Cảm xúc ({n}/10), quyết gì cũng nghĩ tới người trong cuộc trước.",
      tip: "Cảm xúc không phải mau nước mắt, mà là bạn sống theo giá trị mình tin.",
    },
    balanced: {
      text: "Bạn khá cân bằng, nhích nhẹ về Cảm xúc nha, nghe tim trước rồi để não duyệt lại.",
      tip: "Cân được cả logic lẫn lòng người là skill làm leader xịn đó.",
    },
  },
  J: {
    clear: {
      text: "Bạn nghiêng hẳn về Nguyên tắc ({n}/10), có plan rõ ràng mới thấy yên tâm.",
      tip: "Gạch xong một dòng to-do list là đủ làm bạn vui cả buổi.",
    },
    balanced: {
      text: "Bạn khá cân bằng, nhích nhẹ về Nguyên tắc nha, thích có plan nhưng lệch plan cũng không sập.",
      tip: "Lúc nào cũng có sẵn plan B là kiểu sống an toàn nhất.",
    },
  },
  P: {
    clear: {
      text: "Bạn nghiêng hẳn về Linh hoạt ({n}/10), nước đến chân mới nhảy mà nhảy vẫn đẹp.",
      tip: "Bạn thích để ngỏ lựa chọn, biết đâu lại có option xịn hơn.",
    },
    balanced: {
      text: "Bạn khá cân bằng, nhích nhẹ về Linh hoạt nha, ứng biến giỏi nhưng việc quan trọng vẫn lên lịch.",
      tip: "Lúc nào cũng có sẵn plan B là kiểu sống an toàn nhất.",
    },
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
export const RESULT_HOOK = "Đủ 4 chữ rồi, linh vật của bạn đang chờ được đánh thức!";
