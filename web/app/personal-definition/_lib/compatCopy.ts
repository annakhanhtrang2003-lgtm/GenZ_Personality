import type { Element } from "./types";

/**
 * "Hợp nhau" copy, verbatim from docs/hop-nhau-spec.md §2 (edit both
 * together). Rules pinned by compat.test.ts: no "MBTI", no dashes, no
 * person names, nothing about break-ups or fate, ≤ 90 characters per line.
 * Placeholders: {signA} {signB} (sign names in calendar order) and {el}.
 */

export type TierId = "bai-trung" | "hop-ca" | "bo-sung" | "them-thoi-gian" | "oan-gia";
export type Dim = "SN" | "JP" | "TF" | "EI";
export type ZodiacCase = "sameSign" | "sameElement" | "complement" | "other";
export type LifePathCase = "sameRoot" | "sameGroup" | "diffGroup";
export interface FactorLines {
  match: string;
  clash: string;
}

export const TIERS: Record<TierId, { label: string; lines: readonly [string, string] }> = {
  "bai-trung": {
    label: "Cặp bài trùng",
    lines: [
      "Hai đứa như được đặt hàng theo cặp, đi đâu cũng thấy \"ủa sao giống vậy\".",
      "Hiểu ý tới mức chưa nói hết câu đã gật đầu, combo này hiếm lắm á.",
    ],
  },
  "hop-ca": {
    label: "Hợp cạ",
    lines: [
      "Nói chuyện là cuốn, làm gì chung cũng thấy nhẹ nhàng và vui.",
      "Vibe khớp nhau ghê, kiểu bạn đồng hành mà ai cũng muốn có.",
    ],
  },
  "bo-sung": {
    label: "Bổ sung cho nhau",
    lines: [
      "Mỗi đứa giỏi một kiểu, ghép lại thành một team đủ đồ chơi.",
      "Chỗ này đứa này mạnh, chỗ kia đứa kia mạnh, đi chung là có người đỡ.",
    ],
  },
  "them-thoi-gian": {
    label: "Cần thêm thời gian",
    lines: [
      "Mới đầu có thể hơi lệch sóng, càng chơi lâu càng thấy thú vị.",
      "Hai đứa khác nhịp một chút, nhưng chính cái khác đó làm câu chuyện không bao giờ nhạt.",
    ],
  },
  "oan-gia": {
    label: "Oan gia ngõ hẹp",
    lines: [
      "Hay cãi nhau chí choé nhưng thiếu nhau là thấy trống trải liền.",
      "Kiểu bạn bè cà khịa nhau mỗi ngày mà vẫn là người đầu tiên nhắn hỏi thăm.",
    ],
  },
};

/** match = shown when the dimension is "good" (S/N, J/P, T/F same; E/I different); clash otherwise. */
export const DIM_COPY: Record<Dim, FactorLines> = {
  SN: {
    match: "Cùng cách nhìn thế giới, nói nửa câu là đứa kia hiểu ý luôn.",
    clash: "Một đứa cần chi tiết cụ thể, đứa kia thích nói ý tưởng lớn, nhớ dịch cho nhau nha.",
  },
  JP: {
    match: "Cùng nhịp sống, lên plan hay ứng biến cũng ăn ý nhau.",
    clash: "Một đứa muốn chốt lịch sớm, đứa kia thích để ngỏ tới phút chót.",
  },
  TF: {
    match: "Cùng cách ra quyết định, ít khi phải tranh luận vì sao chọn vậy.",
    clash: "Một đứa nghĩ bằng logic, đứa kia nghĩ bằng cảm xúc, nói thẳng nhưng nhớ nói nhẹ.",
  },
  EI: {
    match: "Một đứa nạp pin ngoài đám đông, một đứa nạp pin một mình, bù cho nhau vừa khít.",
    clash: "Cùng kiểu nạp pin nên dễ cùng lúc muốn quẩy, hoặc cùng lúc muốn trốn.",
  },
};

export const DIM_FALLBACK = {
  noneGood: "Khác nhau nhiều tới mức đi chung kiểu gì cũng học được thêm cái mới.",
  allGood: "Hợp quá nên thỉnh thoảng nhớ chừa chỗ cho đứa kia làm điều mới nha.",
} as const;

export const ZODIAC_COPY: Record<ZodiacCase, FactorLines> = {
  sameSign: {
    match: "Cùng là {signA}, hai đứa như nhìn vào gương, hiểu nhau khỏi giải thích.",
    clash: "Giống nhau quá nên lỡ cùng lúc bướng thì không ai chịu nhường ai.",
  },
  sameElement: {
    match: "{signA} và {signB} cùng hệ {el}, năng lượng chung một tần số.",
    clash: "Cùng hệ nên dễ cùng lúc \"lên\" hoặc cùng lúc \"xuống\", nhớ kéo nhau dậy.",
  },
  complement: {
    match: "{signA} và {signB} là cặp bổ trợ, đứa này tiếp năng lượng cho đứa kia.",
    clash: "Một đứa đi nhanh, một đứa đi chắc, thống nhất tốc độ trước khi chạy nha.",
  },
  other: {
    match: "{signA} và {signB} khác hệ hoàn toàn, nên mở cho nhau đủ thứ góc nhìn mới.",
    clash: "Khác hệ nên đôi khi lệch sóng, nói rõ mình cần gì là ổn liền.",
  },
};

export const LIFEPATH_COPY: Record<LifePathCase, FactorLines> = {
  sameRoot: {
    match: "Hai đứa cùng gốc số, chung kiểu động lực sống nên dễ đồng lòng.",
    clash: "Cùng gốc số nên cùng điểm yếu, nhắc nhau đừng cùng lúc ôm quá nhiều việc.",
  },
  sameGroup: {
    match: "Hai con số cùng nhóm, mục tiêu khác nhau mà cách đi lại giống nhau.",
    clash: "Cùng nhóm nên hay so kè ngầm, biến nó thành động lực là đẹp.",
  },
  diffGroup: {
    match: "Hai con số khác nhóm, mỗi đứa mang tới một kiểu sức mạnh riêng.",
    clash: "Ưu tiên trong đời hơi khác nhau, hiểu \"vì sao\" của nhau là hết va.",
  },
};

/** Keyed by the two TemperamentIds sorted and joined with "|". */
export const ACTIVITIES: Record<string, readonly [string, string, string]> = {
  "analysts|analysts": [
    "Rủ nhau giải một escape room khó nhất thành phố.",
    "Cùng đặt cược ai dự đoán đúng kết phim trước.",
    "Lên kế hoạch một side project nhỏ, deadline một tuần.",
  ],
  "analysts|diplomats": [
    "Đi xem triển lãm rồi ngồi cà phê tranh luận ý nghĩa từng bức.",
    "Cùng viết một list \"10 điều muốn làm trước khi ra trường\".",
    "Thử một buổi board game chiến thuật có cốt truyện.",
  ],
  "analysts|sentinels": [
    "Cùng lên lịch ôn thi rồi thi xem ai giữ đúng lịch hơn.",
    "Tối ưu một chuyến đi tiết kiệm mà vẫn xịn.",
    "Cùng học một kỹ năng mới qua khoá online ngắn.",
  ],
  "analysts|explorers": [
    "Rủ nhau thử một môn thể thao lạ như leo núi trong nhà.",
    "Đi chợ đêm, mỗi đứa chọn một món chưa ăn bao giờ.",
    "Cùng làm một video thử thách 24 giờ.",
  ],
  "diplomats|diplomats": [
    "Cùng làm một buổi tình nguyện cuối tuần.",
    "Viết thư tay cho nhau rồi hẹn một năm sau mới mở.",
    "Đi dạo phố đêm và kể nhau nghe ước mơ điên nhất.",
  ],
  "diplomats|sentinels": [
    "Cùng nấu một bữa thật chỉn chu cho cả nhóm bạn.",
    "Làm một cuốn scrapbook ảnh kỷ niệm chung.",
    "Rủ nhau đi một workshop làm nến hay gốm.",
  ],
  "diplomats|explorers": [
    "Đi phượt ngắn một ngày, không lên lịch trước.",
    "Cùng đi xem một buổi nhạc sống ở quán nhỏ.",
    "Thử vẽ tranh tường hoặc tô tượng ở tiệm.",
  ],
  "sentinels|sentinels": [
    "Cùng dọn và decor lại góc học tập cho xịn.",
    "Mở một \"quỹ chung\" tiết kiệm cho chuyến đi cuối năm.",
    "Thi nhau giữ chuỗi thói quen 21 ngày.",
  ],
  "explorers|sentinels": [
    "Một đứa lo lịch trình, một đứa lo trải nghiệm, đi một chuyến chung.",
    "Cùng học nấu một món mới theo công thức rồi tự chế thêm.",
    "Rủ nhau chơi một giải thể thao phong trào của trường.",
  ],
  "explorers|explorers": [
    "Bốc thăm một địa điểm ngẫu nhiên rồi đi luôn trong ngày.",
    "Thử một trò mạo hiểm như chèo SUP hay trượt patin.",
    "Cùng quay một vlog \"một ngày làm người khác\".",
  ],
};

export const ELEMENT_VI: Record<Element, string> = {
  Fire: "Lửa",
  Earth: "Đất",
  Air: "Khí",
  Water: "Nước",
};
