# "Hợp nhau": Spec + nội dung

> Trạng thái: **SPEC, CHƯA CODE.** Viết 2026-10-31. Chờ Khanh quyết các câu hỏi ở §7 rồi mới lên plan task-by-task.
> Đọc kèm: `CLAUDE.md` (North Star, quy tắc riêng tư), `PROGRESS.md`.

**Vì sao làm (theo Decision rule trong CLAUDE.md):** mỗi lần A chia sẻ đều có lý do để B bấm vào ("xem hai đứa hợp nhau tới đâu"). B làm xong lại có lý do chia sẻ tiếp (thẻ đôi, mời người khác). Vòng A → B → C làm tăng `share_rate`. Guardrail `completion_rate`: B chỉ phải làm đúng bài test hiện có, không thêm câu nào.

---

## 1. Công thức

### 1.1 Đầu vào

Mỗi người là một `CompatPerson`:

| Field | Kiểu | Nguồn trong app |
|---|---|---|
| `type` | 4 chữ, ví dụ `"INFP"`; **có thể vắng** khi người đó chưa làm test | `profile.mbti.type` |
| `sign` | tên cung tiếng Việt, 1 trong 12 | `profile.zodiac.sun_sign` |
| `element` | `"Fire" \| "Earth" \| "Air" \| "Water"` | `profile.zodiac.element` (đã có sẵn trong `zodiac-signs.json`, **không** hard-code lại danh sách cung) |
| `lifePath` | 1–9, 11, 22, 33 | `profile.numerology.life_path` |

### 1.2 Ba điểm thành phần (mỗi điểm thang 0–100)

**a) Tính cách `P(a, b)`** (chỉ tính khi cả hai cùng có `type`):

| Điều kiện | Điểm |
|---|---|
| Cùng chữ S/N (chữ thứ 2) | +30 |
| Cùng chữ J/P (chữ thứ 4) | +20 |
| Cùng chữ T/F (chữ thứ 3) | +15 |
| E/I (chữ thứ 1) khác nhau | +20 |
| E/I giống nhau | +15 |
| Điểm nền | +15 |

Khoảng thực tế: **30–100**. Có 13 giá trị: 30, 35, 45, 50, 55, 60, 65, 70, 75, 80, 85, 95, 100.

**b) Cung `Z(a, b)`**, xét theo thứ tự, trúng điều kiện nào trước thì lấy điều kiện đó:

| Điều kiện | Điểm |
|---|---|
| Cùng cung | 92 |
| Cùng nguyên tố | 88 |
| Cặp bổ trợ: Lửa–Khí hoặc Đất–Nước | 80 |
| Còn lại | 55 |

**c) Số Chủ Đạo `L(a, b)`:**
1. Rút gọn số master trước: 11 → 2, 22 → 4, 33 → 6.
2. Chia nhóm: {1,5,7}, {2,4,8}, {3,6,9}.
3. Cùng số (sau khi rút gọn) được 90, cùng nhóm 85, khác nhóm 60.

### 1.3 Điểm tổng

```
total = clamp( round( (4·P + 3·Z + 3·L) / 10 ), 45, 100 )
```

- **Tính bằng số nguyên** (`4P + 3Z + 3L` luôn nguyên, chia 10 rồi mới làm tròn), tránh sai số dấu phẩy động. `Math.round` làm tròn .5 lên, nên luôn cho cùng một kết quả.
- **Đối xứng:** mọi điều kiện đều là "cùng/khác", "cùng nhóm", "cặp không thứ tự", nên `hop(A,B) = hop(B,A)`. Test sẽ kiểm tra trên toàn bộ 16×16×12×12×12×12 tổ hợp, không phải vài ví dụ.
- **Tất định:** không random, không phụ thuộc thời gian. Câu nào được chọn cũng tất định (§2.6).

### 1.4 Nhận xét về công thức (không có lỗi logic, nhưng có 4 điều cần biết)

Mình đã đếm hết **mọi cặp** (16×16 nhóm tính cách × 12×12 cung × 9×9 số sau khi rút gọn, coi như phân bố đều):

1. **Sàn 45 không bao giờ chạm tới.** Điểm thấp nhất là 47 (0,4·30 + 0,3·55 + 0,3·60 = 46,5 → 47). Cao nhất là **95**, không bao giờ đạt 100. Vẫn giữ `clamp` cho an toàn.
2. **Phân bố khá "khắt khe" với một sản phẩm cần được chia sẻ:**

   | Mức | Công thức hiện tại | Phương án nhẹ tay (Cung "còn lại" 65, Số "khác nhóm" 70) |
   |---|---|---|
   | 90+ Cặp bài trùng | 1,6% | 1,6% |
   | 80–89 Hợp cạ | 11,9% | 15,7% |
   | 70–79 Bổ sung cho nhau | 29,7% | 39,1% |
   | 60–69 Cần thêm thời gian | 36,3% | 32,8% |
   | < 60 Oan gia ngõ hẹp | **20,5%** | **10,8%** |
   | Điểm thấp nhất | 47 | 53 |

   Theo công thức hiện tại, cứ 5 cặp có 1 cặp nhận "Oan gia" và hơn nửa số cặp dưới 70. Người ta hay chia sẻ kết quả đẹp, nên đây là rủi ro cho `share_rate`. **Spec giữ đúng công thức của bạn**; phương án nhẹ tay chỉ là đề xuất (câu hỏi Q1).
3. **11/22/33 được coi là "cùng số" với 2/4/6.** Ví dụ một bạn số 22 với một bạn số 4 được 90 điểm, trong khi màn hình hiện "22" và "4". Câu chữ phải nói là **"cùng gốc số"** cho đúng (đã viết sẵn ở §2.4).
4. **Điểm tạm (chỉ cung + số) có một khoảng trống 60–69.** Quy về thang 100 thì (Z + L)/2 chỉ ra các giá trị 57,5 và từ 70 trở lên: 33% cặp dưới 60, 0% trong khoảng 60–69. Nếu hiện một "điểm tổng tạm" rồi B làm xong bài, điểm có thể nhảy rất xa. Đề xuất ở §3 màn B2: **không hiện điểm tổng tạm**. Thay vào đó hiện 2 thanh (Cung, Số) và một **khoảng dự kiến** "Điểm tổng sẽ nằm trong khoảng X–Y", tính đúng bằng P = 30 và P = 100. Cách này trung thực mà vẫn gây tò mò (Q2).

### 1.5 Hàm thuần (đều nằm trong `_lib/compat.ts`)

```ts
type CompatPerson = { type?: string; sign: string; element: Element; lifePath: number };

personalityScore(a: string, b: string): number                    // 30..100
zodiacScore(a: CompatPerson, b: CompatPerson): { score: number; case: ZodiacCase }   // "sameSign"|"sameElement"|"complement"|"other"
lifePathScore(a: number, b: number): { score: number; case: LifePathCase }          // "sameRoot"|"sameGroup"|"diffGroup"
reduceMaster(n: number): number                                   // 11→2, 22→4, 33→6, còn lại giữ nguyên
compatTotal(p: number, z: number, l: number): number              // công thức §1.3 có clamp
partialRange(z: number, l: number): { min: number; max: number }  // compatTotal(30,z,l) .. compatTotal(100,z,l)
compatResult(a: CompatPerson, b: CompatPerson): CompatResult       // ghép tất cả + chọn câu (§2.6)
```

Nếu một trong hai người không có `type` thì `compatResult` trả `personality: null`, `total: null`, còn `partialRange` vẫn có giá trị.

---

## 2. Nội dung

Quy tắc chung: giọng Gen Z, vui, mỗi câu tối đa 2 dòng trên điện thoại (khoảng ≤ 90 ký tự). Không dùng gạch ngang nối câu (giống quy tắc copy màn nghỉ). Không phán xét tình cảm, không nhắc chia tay hay số phận. Không dùng chữ "MBTI", luôn gọi là "nhóm tính cách". Biến: `{X}` là tên người kia (khi người đó ẩn tên thì dùng "bạn ấy"), `{signA}`/`{signB}` là tên cung, `{el}` là nguyên tố (Lửa/Đất/Khí/Nước).

### 2.1 Năm mức nhãn (mỗi mức 2 biến thể)

| Mức | Nhãn | Biến thể 1 | Biến thể 2 |
|---|---|---|---|
| 90+ | **Cặp bài trùng** | Hai đứa như được đặt hàng theo cặp, đi đâu cũng thấy "ủa sao giống vậy". | Hiểu ý tới mức chưa nói hết câu đã gật đầu, combo này hiếm lắm á. |
| 80–89 | **Hợp cạ** | Nói chuyện là cuốn, làm gì chung cũng thấy nhẹ nhàng và vui. | Vibe khớp nhau ghê, kiểu bạn đồng hành mà ai cũng muốn có. |
| 70–79 | **Bổ sung cho nhau** | Mỗi đứa giỏi một kiểu, ghép lại thành một team đủ đồ chơi. | Chỗ này bạn mạnh, chỗ kia {X} mạnh, đi chung là có người đỡ. |
| 60–69 | **Cần thêm thời gian** | Mới đầu có thể hơi lệch sóng, càng chơi lâu càng thấy thú vị. | Hai đứa khác nhịp một chút, nhưng chính cái khác đó làm câu chuyện không bao giờ nhạt. |
| < 60 | **Oan gia ngõ hẹp** | Hay cãi nhau chí choé nhưng thiếu nhau là thấy trống trải liền. | Kiểu bạn bè cà khịa nhau mỗi ngày mà vẫn là người đầu tiên nhắn hỏi thăm. |

Chọn biến thể: §2.6.

### 2.2 Tính cách: "điểm hợp nhất" và "dễ va chạm ở đâu"

Mỗi chiều được coi là **"tốt"** khi: S/N giống, J/P giống, T/F giống, hoặc E/I **khác**.
- **Điểm hợp nhất** = chiều "tốt" đầu tiên theo thứ tự S/N → J/P → T/F → E/I. Nếu không chiều nào "tốt" thì dùng câu dự phòng.
- **Dễ va chạm** = chiều "không tốt" đầu tiên theo cùng thứ tự đó. Nếu cả 4 chiều đều "tốt" thì dùng câu dự phòng.

| Chiều | Điểm hợp nhất (khi "tốt") | Dễ va chạm (khi "không tốt") |
|---|---|---|
| S/N | Cùng cách nhìn thế giới, nói nửa câu là đứa kia hiểu ý luôn. | Một đứa cần chi tiết cụ thể, đứa kia thích nói ý tưởng lớn, nhớ dịch cho nhau nha. |
| J/P | Cùng nhịp sống, lên plan hay ứng biến cũng ăn ý nhau. | Một đứa muốn chốt lịch sớm, đứa kia thích để ngỏ tới phút chót. |
| T/F | Cùng cách ra quyết định, ít khi phải tranh luận vì sao chọn vậy. | Một đứa nghĩ bằng logic, đứa kia nghĩ bằng cảm xúc, nói thẳng nhưng nhớ nói nhẹ. |
| E/I | Một đứa nạp pin ngoài đám đông, một đứa nạp pin một mình, bù cho nhau vừa khít. | Cùng kiểu nạp pin nên dễ cùng lúc muốn quẩy, hoặc cùng lúc muốn trốn. |
| Dự phòng: không chiều nào "tốt" | Khác nhau nhiều tới mức đi chung kiểu gì cũng học được thêm cái mới. | |
| Dự phòng: cả 4 chiều "tốt" | | Hợp quá nên thỉnh thoảng nhớ chừa chỗ cho đứa kia làm điều mới nha. |

### 2.3 Cung hoàng đạo

| Trường hợp | Điểm hợp nhất | Dễ va chạm |
|---|---|---|
| Cùng cung (92) | Cùng là {signA}, hai đứa như nhìn vào gương, hiểu nhau khỏi giải thích. | Giống nhau quá nên lỡ cùng lúc bướng thì không ai chịu nhường ai. |
| Cùng nguyên tố (88) | {signA} và {signB} cùng hệ {el}, năng lượng chung một tần số. | Cùng hệ nên dễ cùng lúc "lên" hoặc cùng lúc "xuống", nhớ kéo nhau dậy. |
| Bổ trợ Lửa–Khí / Đất–Nước (80) | {signA} và {signB} là cặp bổ trợ, đứa này tiếp năng lượng cho đứa kia. | Một đứa đi nhanh, một đứa đi chắc, thống nhất tốc độ trước khi chạy nha. |
| Còn lại (55) | {signA} và {signB} khác hệ hoàn toàn, nên mở cho nhau đủ thứ góc nhìn mới. | Khác hệ nên đôi khi lệch sóng, nói rõ mình cần gì là ổn liền. |

### 2.4 Số Chủ Đạo

| Trường hợp | Điểm hợp nhất | Dễ va chạm |
|---|---|---|
| Cùng gốc số (90) | Hai đứa cùng gốc số, chung kiểu động lực sống nên dễ đồng lòng. | Cùng gốc số nên cùng điểm yếu, nhắc nhau đừng cùng lúc ôm quá nhiều việc. |
| Cùng nhóm (85) | Hai con số cùng nhóm, mục tiêu khác nhau mà cách đi lại giống nhau. | Cùng nhóm nên hay so kè ngầm, biến nó thành động lực là đẹp. |
| Khác nhóm (60) | Hai con số khác nhóm, mỗi đứa mang tới một kiểu sức mạnh riêng. | Ưu tiên trong đời hơi khác nhau, hiểu "vì sao" của nhau là hết va. |

Ghi chú hiển thị: khi một người là số master mà gốc trùng với số của người kia (ví dụ 22 và 4), hiện thêm dòng nhỏ: "22 rút gọn về 4 nên hai đứa cùng gốc số".

### 2.5 Gợi ý hoạt động: 3 câu cho mỗi cặp nhóm tính cách (10 cặp không thứ tự)

Nhóm = Tư Duy (NT), Lý Tưởng (NF), Vững Chãi (SJ), Trải Nghiệm (SP), lấy từ `temperamentOf()` có sẵn.

| Cặp nhóm | Gợi ý 1 | Gợi ý 2 | Gợi ý 3 |
|---|---|---|---|
| Tư Duy × Tư Duy | Rủ nhau giải một escape room khó nhất thành phố. | Cùng đặt cược ai dự đoán đúng kết phim trước. | Lên kế hoạch một side project nhỏ, deadline một tuần. |
| Tư Duy × Lý Tưởng | Đi xem triển lãm rồi ngồi cà phê tranh luận ý nghĩa từng bức. | Cùng viết một list "10 điều muốn làm trước khi ra trường". | Thử một buổi board game chiến thuật có cốt truyện. |
| Tư Duy × Vững Chãi | Cùng lên lịch ôn thi rồi thi xem ai giữ đúng lịch hơn. | Tối ưu một chuyến đi tiết kiệm mà vẫn xịn. | Cùng học một kỹ năng mới qua khoá online ngắn. |
| Tư Duy × Trải Nghiệm | Rủ nhau thử một môn thể thao lạ như leo núi trong nhà. | Đi chợ đêm, mỗi đứa chọn một món chưa ăn bao giờ. | Cùng làm một video thử thách 24 giờ. |
| Lý Tưởng × Lý Tưởng | Cùng làm một buổi tình nguyện cuối tuần. | Viết thư tay cho nhau rồi hẹn một năm sau mới mở. | Đi dạo phố đêm và kể nhau nghe ước mơ điên nhất. |
| Lý Tưởng × Vững Chãi | Cùng nấu một bữa thật chỉn chu cho cả nhóm bạn. | Làm một cuốn scrapbook ảnh kỷ niệm chung. | Rủ nhau đi một workshop làm nến hay gốm. |
| Lý Tưởng × Trải Nghiệm | Đi phượt ngắn một ngày, không lên lịch trước. | Cùng đi xem một buổi nhạc sống ở quán nhỏ. | Thử vẽ tranh tường hoặc tô tượng ở tiệm. |
| Vững Chãi × Vững Chãi | Cùng dọn và decor lại góc học tập cho xịn. | Mở một "quỹ chung" tiết kiệm cho chuyến đi cuối năm. | Thi nhau giữ chuỗi thói quen 21 ngày. |
| Vững Chãi × Trải Nghiệm | Một đứa lo lịch trình, một đứa lo trải nghiệm, đi một chuyến chung. | Cùng học nấu một món mới theo công thức rồi tự chế thêm. | Rủ nhau chơi một giải thể thao phong trào của trường. |
| Trải Nghiệm × Trải Nghiệm | Bốc thăm một địa điểm ngẫu nhiên rồi đi luôn trong ngày. | Thử một trò mạo hiểm như chèo SUP hay trượt patin. | Cùng quay một vlog "một ngày làm người khác". |

### 2.6 Chọn câu và biến thể một cách tất định

- **Biến thể nhãn:** dùng `variant = (hash(khoá cặp) % 2)`. Khoá cặp là chuỗi **đã sắp xếp** của hai người (type|sign|lifePath), để A và B luôn thấy cùng một câu, đúng tinh thần đối xứng. `hash` là một hàm băm chuỗi đơn giản viết trong `compat.ts` (ví dụ FNV-1a 32-bit), không gọi `Math.random`.
- **Câu hợp / va chạm:** theo bảng ở trên, không có yếu tố ngẫu nhiên.
- **Gợi ý hoạt động:** hiện cả 3 câu của cặp nhóm.
- **Test:** quét toàn bộ copy, khẳng định không có `MBTI`, không có gạch ngang `—`/`–`/` - `, không có từ cấm (`chia tay`, `định mệnh`, `số phận`, `xui`, `khắc`), và mỗi câu ≤ 90 ký tự.

---

## 3. Luồng người dùng

Ký hiệu: **A** là người mời, **B** là người được mời. Tất cả nằm trong route của subpage (xem Q3).

### A1. Trang kết quả của A, thêm khối "Hợp nhau"

Đặt ngay dưới nút "Chia sẻ kết quả":

- Nút chính: **"Xem bạn hợp với ai 💞"**
- Checkbox phía trên nút: ☐ **"Ẩn tên của mình trong link"** (mặc định không tích).
- Bấm nút:
  - **Điện thoại có Web Share:** mở share sheet. Text: "Mình là {nhóm tính cách} nè, vô xem hai đứa hợp nhau tới đâu 💞", kèm link mời. Bắn event `compat_invite_create`.
  - **Không có Web Share:** copy link vào clipboard. Dòng trạng thái: "Đã copy link, dán cho bạn bè nha!". Clipboard bị chặn thì hiện link trong ô có thể chọn để copy tay.
- Link dạng `…/hop-nhau?i=<mã>` (§4).
- Link nhỏ ngay dưới nút: **"Hoặc thử nhanh với ngày sinh của bạn bè"**, mở chế độ nhanh (A4).

### B1. Landing khi mở link mời

- Mã không hợp lệ thì chuyển qua màn **B-ERR**.
- Hợp lệ: bắn `compat_invite_open`, rồi hiện:
  - Mascot của nhóm tính cách của A (theo `type` trong mã).
  - Tiêu đề: **"{Tên A} mời bạn xem hai đứa hợp nhau tới đâu"**. Nếu A ẩn tên: **"Một người bạn mời bạn xem hai đứa hợp nhau tới đâu"**.
  - Dòng phụ: "{Tên A} thuộc {Nhóm} · {cung A} · Số Chủ Đạo {số A}".
  - Ô nhập ngày sinh dùng 3 ô chọn Ngày/Tháng/Năm, giống form hiện tại. Nút **"Xem độ hợp ngay"** chỉ bật khi đã chọn đủ ngày hợp lệ.
  - Câu cam kết dưới nút: "Không lưu lại, không gửi đi đâu cả."

### B2. Kết quả tạm (cung + số)

- Bắn `compat_partial_view`.
- Hai thanh điểm: **Cung {Z}** và **Số Chủ Đạo {L}**, mỗi thanh kèm câu "điểm hợp nhất" của yếu tố đó.
- Thanh thứ ba bị khóa: 🔒 **Nhóm tính cách**, kèm dòng **"Làm 40 câu để mở khóa 40% còn lại"**.
- Dòng gây tò mò: **"Điểm tổng của hai đứa sẽ nằm trong khoảng {min}–{max}"**, lấy từ `partialRange`. Đây là đề xuất thay cho việc hiện điểm tổng tạm, xem Q2.
- Nút chính: **"Làm test để mở khóa"**. Bấm vào thì vào luồng test hiện có: onboarding → quiz → màn nghỉ. Ngày sinh B đã nhập được **điền sẵn** vào form; B chỉ cần nhập tên hiển thị và trường. Bắn `compat_test_start`.
- Nút phụ: "Để sau" → về trang giới thiệu của test.

### B3. B làm xong bài → màn so sánh đầy đủ

Sau màn nghỉ phần 4, khi đang có lời mời, nút "Xem kết quả" mở màn so sánh **trước**. Kết quả riêng của B ở ngay dưới, xem Q4. Bắn `compat_full_view`.

- **Đầu màn:** hai mascot đứng cạnh nhau, ghi "Bạn × {Tên A}". Điểm tổng hiện bằng số đếm lên (tắt hiệu ứng khi người dùng bật giảm chuyển động). Bên dưới là **nhãn** và câu mô tả của nhãn.
- **Ba thanh thành phần:** Tính cách {P}, Cung {Z}, Số {L}.
- **Mỗi yếu tố:** một dòng "💞 Điểm hợp nhất" và một dòng "⚡ Dễ va chạm" (§2.2–2.4).
- **Khối "Hai đứa nên thử cùng nhau":** 3 gợi ý (§2.5).
- **Nút chính:** **"Chia sẻ thẻ của hai đứa"**. Có 2 tab ảnh: Story 9:16 và Vuông 1:1. Chia sẻ qua Web Share, nếu không được thì tải ảnh. Bắn `compat_share_click`, chia sẻ thành công thì bắn `compat_share_success`.
- **Nút phụ:** **"Mời người khác"**. Tạo link mời mới bằng **mã của B**. Đây là bước C trong vòng lan truyền.
- **Đề xuất thêm (Q5):** nút **"Gửi kết quả cho {Tên A}"**, tạo link cặp `…/hop-nhau?i=<mã A>&j=<mã B>`. A mở link là thấy ngay màn so sánh đầy đủ, không phải làm lại bài. Có link này thì "**cả hai** xem" mới thật sự xảy ra khi không có backend.
- **Link cuối màn:** "Xem kết quả đầy đủ của mình ↓".

### A4. Chế độ nhanh (không cần link)

- Mở từ trang kết quả của A.
- **Màn:**
  - Tiêu đề "Thử nhanh với ngày sinh của bạn bè".
  - Ô "Tên bạn ấy (không bắt buộc)" và 3 ô chọn ngày sinh.
  - Nút "Xem nhanh".
- **Kết quả:** hai thanh Cung và Số (giống B2) cùng khoảng điểm dự kiến. Lời nhắc "Đây mới là 60% thôi, rủ {tên} làm test để xem đủ nha", kèm nút **"Gửi link mời cho {tên}"** (giống A1).
- **Ràng buộc:** ngày sinh của người bạn chỉ dùng để tính ngay trên máy, **không** đưa vào URL hay analytics, không lưu lại.

### B-ERR. Link không hợp lệ

- Mascot đang bối rối, tiêu đề **"Link này hơi lạ á 🤔"**, dòng phụ "Có thể link bị cắt mất một đoạn. Bạn làm test của mình trước nha, xong rồi rủ lại người gửi.", nút **"Làm bài test ngay"**.
- **Không bao giờ crash, không hiện lỗi kỹ thuật.**

---

## 4. Kỹ thuật

### 4.1 Mã mời

- **Định dạng:** `base64url(JSON.stringify({ v: 1, name?, type, sign, lifePath }))`, dùng mã hoá UTF-8 (tên có dấu, tên cung tiếng Việt). Cung lưu bằng **chỉ số 0–11** thay cho chuỗi để link ngắn hơn; khi giải thì tra lại tên cung và nguyên tố từ `zodiac-signs.json`. Đây là đề xuất, không đổi ý nghĩa.
- **`encodeInvite(p: InvitePayload): string`** và **`decodeInvite(code: string): InvitePayload | null`**, trong `_lib/inviteCode.ts`.
- **`decodeInvite` trả `null` (không bao giờ throw) khi:**
  - base64 hỏng, JSON hỏng, hoặc không phải object
  - `v !== 1`
  - `type` không thuộc 16 nhóm tính cách
  - `sign` không phải số nguyên 0–11
  - `lifePath` không thuộc {1..9, 11, 22, 33}
  - `name` có nhưng không phải chuỗi, hoặc dài quá 30 ký tự sau khi trim
  - mã dài quá 300 ký tự
  - có field lạ: bỏ qua field đó, không coi là lỗi
- **Hiển thị:** `name` luôn hiện dưới dạng text thường (React tự escape). Ký tự điều khiển bị loại bỏ khi encode.
- **Không bao giờ có trong mã:** ngày sinh, họ tên đầy đủ, trường học, câu trả lời. Có test khẳng định điều này.

### 4.2 Riêng tư và query string (cần quyết, Q6)

Phần `?i=` **được gửi lên server**: Vercel ghi lại URL trong request log, và crawler của Zalo/Facebook đọc nó để dựng ảnh xem trước (OG). Nghĩa là **tên hiển thị của A sẽ nằm trong log của Vercel**. CLAUDE.md chỉ cấm họ tên đầy đủ và ngày sinh, nên điều này không vi phạm câu chữ, nhưng đi ngược tinh thần "không lưu lại". Đề xuất: `?i=` chỉ chứa `{v, type, sign, lifePath}`, còn **tên đặt sau dấu `#`** (`#n=<tên>`). Trình duyệt không bao giờ gửi phần sau `#` lên server, nên ảnh OG không có tên nhưng vẫn có nhóm tính cách, cung và số.

### 4.3 Thẻ chia sẻ của cặp

- `renderCompatImage(result, format: "story" | "square"): Promise<Blob>` trong `_lib/compatShareImage.ts`. Vẽ bằng canvas giống `shareImage.ts` hiện có, không thêm thư viện.
- **Story 1080×1920:** hai mascot, "Bạn × {Tên A}", điểm tổng, nhãn, 3 thanh, 1 câu hợp nhất, footer "Hai đứa hợp nhau tới đâu? Thử tại {host}".
- **Vuông 1080×1080:** bản rút gọn với điểm, nhãn và 3 thanh.
- **Tên file:** `{tenB}-x-{tenA}_{diem}.png`. Tên được làm sạch giống `shareFileName`; người ẩn tên thì dùng `ban-ay`.
- **Chia sẻ:** Web Share kèm file. Không được thì tải ảnh, và nút phụ "Copy link" copy link mời.

### 4.4 Ảnh xem trước (Open Graph) cho link mời

- Dùng `opengraph-image.tsx` (`next/og` / `ImageResponse`) đặt trong route hop-nhau. Phải đọc `node_modules/next/dist/docs/` trước khi làm, vì AGENTS.md cảnh báo Next 16 có thay đổi phá vỡ tương thích.
- Ảnh chỉ dùng dữ liệu đã giải từ `?i=`: mascot, nhóm, cung, số, và câu "Vô xem hai đứa hợp nhau tới đâu 💞". Mã không hợp lệ thì dùng ảnh mặc định.
- Không `console.log`, không lưu, không gọi dịch vụ ngoài. Hiện app hoàn toàn tĩnh, nên đây là **route chạy trên server đầu tiên**. Phần này nằm ở phase 4, cần Khanh đồng ý (Q7).

### 4.5 Analytics

- **Event:** `compat_invite_create`, `compat_invite_open`, `compat_partial_view`, `compat_test_start`, `compat_full_view`, `compat_share_click`, `compat_share_success`.
- **Chỉ được kèm:** `tier` (1 trong 5 mức), `format` (story/square), `hidden_name` (true/false). **Không bao giờ** kèm tên, ngày sinh, mã mời hay URL.
- **Wrapper:** `track(event: CompatEvent, props?: …)` trong `_lib/analytics.ts`. Khi chưa có công cụ analytics thì hàm không làm gì (no-op).
- **App chưa có công cụ analytics nào** (đã ghi ở North Star: share_rate chưa đo được). Phải chọn một công cụ thì event mới chạy thật (Q8).

---

## 5. Chia phase (mỗi phase tối đa 4 file, mỗi phase một nhánh commit riêng)

Đường dẫn tương đối từ `web/app/personal-definition/` (giả định Q3 chọn route lồng trong subpage).

### Phase 1: Lõi tính điểm, nội dung, mã mời (chưa có UI)

**File:**
1. `_lib/compat.ts`: các hàm ở §1.5 cùng phần chọn câu (§2.6)
2. `_lib/compatCopy.ts`: toàn bộ nội dung §2
3. `_lib/inviteCode.ts`: `encodeInvite` / `decodeInvite`
4. `_lib/__tests__/compat.test.ts`: test cho cả 3 file trên

**Xong khi:**
- **Đối xứng:** kiểm tra trên toàn bộ tổ hợp.
- **Ví dụ cụ thể** (dùng đúng số trong spec):
  - `personalityScore("INFP","INFP") = 95`
  - `personalityScore("INFP","ENFP") = 100`
  - `personalityScore("ESTJ","INFP") = 35`
  - `personalityScore("ISTJ","INFP") = 30`
  - Điểm cung: Bạch Dương × Bạch Dương = 92, Bạch Dương × Sư Tử = 88, Bạch Dương × Song Tử = 80, Bạch Dương × Kim Ngưu = 55
  - Số chủ đạo: 22 × 4 = 90 ("cùng gốc"), 1 × 5 = 85, 1 × 2 = 60
  - Điểm tổng: `compatTotal(30,55,60) = 47`, `compatTotal(100,92,90) = 95`
- **Tổng luôn trong 45–100**, và **mỗi mức nhãn đều chạm tới được**.
- **Mã mời:** encode rồi decode cho lại đúng dữ liệu. Mọi trường hợp lỗi ở §4.1 trả `null`. Mã không bao giờ chứa ngày sinh.
- **Quét copy:** đúng quy tắc §2.6.
- Toàn bộ test cũ vẫn xanh, `tsc` sạch.

### Phase 2: A tạo link, B mở link, xem kết quả tạm

**File:**
1. `_components/compat/InviteBlock.tsx`: nút "Xem bạn hợp với ai 💞", checkbox ẩn tên, share/copy (A1)
2. `hop-nhau/page.tsx`: route mới, đọc `?i=` (và `#n=` nếu Q6 chọn vậy), quyết hiện B1 hay B-ERR
3. `_components/compat/CompatLanding.tsx`: B1, B2 (ô ngày sinh, hai thanh, thanh khoá, khoảng dự kiến) và B-ERR
4. `_components/__tests__/compatLanding.test.tsx`

**Xong khi:**
- Trên trang kết quả, A tạo được link. Có Web Share thì gọi share, không có thì copy link.
- Mở link hợp lệ thì thấy landing đúng tên, hoặc "Một người bạn" khi A ẩn tên.
- Nhập ngày sinh thì thấy 2 thanh, thanh khoá và khoảng dự kiến.
- Link hỏng, sai version, giá trị lạ: hiện B-ERR, không crash.
- Kiểm tra bằng trình duyệt ở 390px và 360px.

### Phase 3: B làm bài, màn so sánh đầy đủ, thẻ chia sẻ cặp

**File:**
1. `page.tsx` (sửa): giữ lời mời trong state, điền sẵn ngày sinh, chèn màn so sánh trước kết quả riêng
2. `_components/compat/CompatView.tsx`: B3 (điểm tổng, nhãn, 3 thanh, hợp/va chạm, gợi ý, các nút)
3. `_lib/compatShareImage.ts`: ảnh 9:16 và 1:1
4. `_components/__tests__/compatView.test.tsx`

**Xong khi:**
- Đi hết luồng A → B → so sánh trên trình duyệt thật.
- Điểm A thấy (qua link cặp, nếu Q5 đồng ý) bằng đúng điểm B thấy.
- Tải được ảnh cả hai khổ.
- "Mời người khác" tạo link bằng mã của B.
- `completion_rate` không đổi: số câu và số bước của bài test giữ nguyên.

### Phase 4: Chế độ nhanh, ảnh OG, analytics

**File:**
1. `_components/compat/QuickCompat.tsx`: A4
2. `hop-nhau/opengraph-image.tsx`: ảnh OG
3. `_lib/analytics.ts`: `track()` cùng 7 event
4. `_components/__tests__/quickCompat.test.tsx`

**Xong khi:**
- Chế độ nhanh không đưa ngày sinh vào URL hay event.
- Dán link vào Zalo hoặc Messenger (bản deploy thử) thấy ảnh xem trước đúng.
- Có test khẳng định 7 event bắn đúng chỗ và không mang tên, ngày sinh hay mã mời.

---

## 6. Những tình huống dễ gây lỗi (test phải phủ)

1. **Link bị app chat cắt mất đuôi** (Zalo, Messenger hay cắt link dài): `decodeInvite` trả `null` → B-ERR.
2. **B mở link mời của chính A** trên cùng máy: vẫn chạy bình thường như một B. Không có backend nên không phát hiện được, và không cần phát hiện.
3. **B chưa làm xong bài mà tải lại trang:** lời mời vẫn còn trên URL, chỉ mất tiến độ làm bài. Đây là vấn đề sẵn có của app (đã ghi từ đợt walkthrough).
4. **Tên có emoji, chữ Hán, khoảng trắng thừa hoặc dài 30 ký tự:** hiện đúng, không vỡ layout, tên file vẫn an toàn.
5. **Hai người cùng là số master khác nhau** (11 và 22): rút gọn ra 2 và 4, tức cùng nhóm → 85. Copy không được nói "cùng số".

---

## 7. Câu hỏi mở cần Khanh quyết

1. **Q1. Phân bố điểm:** giữ đúng công thức (20,5% cặp nhận "Oan gia", 56,8% dưới 70), hay dùng phương án nhẹ tay (Cung "còn lại" 55 → 65, Số "khác nhóm" 60 → 70, còn 10,8% "Oan gia", sàn thực tế 53)?
2. **Q2. Màn kết quả tạm của B:** hiện 2 thanh cộng khoảng "{min}–{max}" như đề xuất, hay hiện một điểm tạm duy nhất (có khoảng trống 60–69 và có thể nhảy xa khi làm xong bài)?
3. **Q3. Đường dẫn:** `/hop-nhau` như bạn viết, hay `/personal-definition/hop-nhau`? Theo CONTRIBUTING của team repo thì cụm này chỉ được sửa trong `app/personal-definition/`, nên mình đề xuất đường dẫn lồng.
4. **Q4. Thứ tự màn khi B làm xong:** so sánh trước rồi tới kết quả riêng (đề xuất), hay ngược lại?
5. **Q5. Link cặp `?i=&j=`:** có cho A xem đủ màn so sánh mà không phải làm lại bài không (đề xuất là có)?
6. **Q6. Tên trong link:** để tên sau `#` cho khỏi nằm trong log server (đề xuất), hay để trong `?i=` như bạn viết (ảnh OG sẽ hiện được tên)?
7. **Q7. Ảnh OG:** đồng ý thêm route chạy trên server đầu tiên (tốn function của Vercel), hay bỏ OG ở bản đầu và dùng ảnh tĩnh chung?
8. **Q8. Công cụ analytics:** Vercel Web Analytics (custom event cần gói Pro), PostHog (gói miễn phí, dùng EU cloud), hay GA4? Chưa chọn thì `track()` không làm gì và event chưa đo được.
9. **Q9. Quan hệ với Idol Match (Spec B cũ):** dùng chung công thức này để so với idol, hay giữ quyết định cũ là "không có điểm % bịa"? Nếu dùng chung thì phải cập nhật quyết định cũ.
