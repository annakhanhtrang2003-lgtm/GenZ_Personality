/**
 * Break-screen copy. Source of truth for review: docs/interlude-copy.md —
 * edit both together. `{n}` is the number of the part's 10 answers that
 * leaned toward the revealed letter (only used on a clear lean, n ≥ 7).
 *
 * Voice: Gen Z, two short sentences, no dashes between them (pinned by a
 * test). The "fun fact" restates the pole definitions in questions.json;
 * none of it is a statistic.
 */
export const SUMMARY_COPY: Record<string, { clear: string; balanced: string }> = {
  E: {
    clear: "Bạn nghiêng hẳn về Hướng ngoại ({n}/10), đông người là pin full vạch. Fun fact: hội Hướng ngoại hay vừa nói vừa nghĩ, nói ra rồi mới biết mình nghĩ gì.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Hướng ngoại nha. Quẩy được mà chill một mình cũng ok, kiểu này người ta gọi là ambivert đó.",
  },
  I: {
    clear: "Bạn nghiêng hẳn về Hướng nội ({n}/10), sạc pin bằng giờ me-time. Fun fact: hướng nội không phải là ngại người đâu, chỉ là bạn thích nghĩ kỹ rồi mới nói.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Hướng nội nha. Đi tiệc vẫn vui nhưng về nhà nằm mới là chân ái, kiểu này người ta gọi là ambivert đó.",
  },
  S: {
    clear: "Bạn nghiêng hẳn về Thực tế ({n}/10), mắt thấy tai nghe mới tin. Fun fact: thấy tin hot là bạn hỏi \"nguồn đâu?\" đầu tiên.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Thực tế nha. Chân chạm đất mà đầu thỉnh thoảng vẫn bay, đọc được cả chi tiết lẫn ý ngầm luôn.",
  },
  N: {
    clear: "Bạn nghiêng hẳn về Trực giác ({n}/10), nhìn đâu cũng thấy bức tranh lớn. Fun fact: não bạn lúc nào cũng mở sẵn 10 tab \"lỡ như thì sao\".",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Trực giác nha. Mơ to nhưng vẫn check kỹ, đọc được cả chi tiết lẫn ý ngầm luôn.",
  },
  T: {
    clear: "Bạn nghiêng hẳn về Lý trí ({n}/10), não nhảy số nhanh hơn tim. Fun fact: lý trí không phải lạnh lùng đâu, bạn chỉ muốn mọi thứ hợp lý và công bằng.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Lý trí nha. Phân tích kỹ mà vẫn để ý cảm xúc người khác, combo này làm leader là hợp lắm.",
  },
  F: {
    clear: "Bạn nghiêng hẳn về Cảm xúc ({n}/10), quyết gì cũng nghĩ tới người trong cuộc trước. Fun fact: cảm xúc không phải mau nước mắt, mà là bạn sống theo giá trị mình tin.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Cảm xúc nha. Nghe tim trước rồi để não duyệt lại, combo này làm leader là hợp lắm.",
  },
  J: {
    clear: "Bạn nghiêng hẳn về Nguyên tắc ({n}/10), có plan rõ ràng mới thấy yên tâm. Fun fact: gạch xong một dòng to-do list là đủ làm bạn vui cả buổi.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Nguyên tắc nha. Thích có plan nhưng lệch plan cũng không sập, lúc nào cũng có sẵn plan B.",
  },
  P: {
    clear: "Bạn nghiêng hẳn về Linh hoạt ({n}/10), nước đến chân mới nhảy mà nhảy vẫn đẹp. Fun fact: bạn thích để ngỏ lựa chọn, biết đâu lại có option xịn hơn.",
    balanced: "Bạn khá cân bằng, nhích nhẹ về Linh hoạt nha. Ứng biến giỏi nhưng việc quan trọng vẫn lên lịch đàng hoàng, lúc nào cũng có sẵn plan B.",
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
