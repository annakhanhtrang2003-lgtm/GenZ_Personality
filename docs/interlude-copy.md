# Màn nghỉ — nội dung tóm tắt sau mỗi phần

> Bản viết lại giọng Gen Z, bỏ gạch ngang: 2026-10-31 (bảng bên dưới được sinh từ code).
>
> Trạng thái: **đã code (2026-10-31)** theo yêu cầu của Khanh ("từ phần 1 tới phần 4, có gợi ý / kết luận ngắn để kéo người dùng đi tiếp"). Nội dung bên dưới vẫn là bản nháp, chưa duyệt từng câu. Sửa ở đây **và** trong `web/app/personal-definition/_lib/interludeCopy.ts`.
>
> Đã chốt khi code: câu hỏi 1 → **(a)**, thêm màn nghỉ sau phần 4 (nút "Xem kết quả"; nút cuối phần 4 trong bài đổi thành "Xong phần 4"). Câu hỏi 2 → giữ fact dùng chung. Câu hỏi 3 → tóm tắt nằm trên ô cung/số. Thêm **câu gợi mở phần sau** = câu hỏi của thẻ phần đó ở landing (`PART_HOOKS`); sau phần 4 dùng `RESULT_HOOK`.

## Cách chọn câu (đề xuất)

Mỗi phần = 10 câu của đúng 1 chiều. Mỗi câu trả lời là −2…+2. Sau khi nhân với `key`, câu đó **nghiêng về** cực A (>0), cực B (<0) hoặc **trung lập** (0, "Tuỳ lúc"/"Còn tuỳ").

- `n` = số câu nghiêng về cực thắng (0–10; câu trung lập không tính cho bên nào).
- **Nghiêng rõ:** khi một cực có `n ≥ 7` → dùng câu *rõ* và hiện `n/10`.
- **Cân bằng:** mọi trường hợp còn lại (5-5, 6-4, 4-3 kèm 3 câu trung lập…) → dùng câu *cân bằng*, **không hiện số**.
- Chữ cái được hé lộ = chữ của engine: dấu của `S = Σ(r × key)`, hoà thì về cực mặc định (I, N, F, P). Vì vậy chữ ở màn nghỉ **luôn trùng** chữ ở kết quả cuối.
- Lý do bảo đảm khớp: nếu `n ≥ 7` thì phía đó được ít nhất +7, phía kia nhiều nhất 3 câu × −2 = −6, nên `S` không thể đổi dấu. Ở trường hợp cân bằng mình không hiện con số, nên không có chuyện "7/10 nghiêng E nhưng kết quả ra I".

Mỗi màn có 1 câu **kết luận** (chữ đậm) + 1 câu **"Mách nhỏ"** (ô riêng bên dưới). Giọng Gen Z, **không dùng gạch ngang nối câu** (có test kiểm tra).

`{n}` = số câu nghiêng. Ô khoá MBTI hiện dần: sau phần 1 `I _ _ _`, sau phần 2 `I N _ _`, sau phần 3 `I N T _`.

---

## Phần 1 — E · I (Bạn giữa mọi người)

| Hướng | Mức | Kết luận | 💡 Mách nhỏ |
|---|---|---|---|
| **E** Hướng ngoại | Rõ | Bạn nghiêng hẳn về Hướng ngoại ({n}/10), đông người là pin full vạch. | Hội Hướng ngoại hay vừa nói vừa nghĩ, nói ra rồi mới biết mình nghĩ gì. |
| **E** Hướng ngoại | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Hướng ngoại nha, quẩy được mà chill một mình cũng ok. | Kiểu tuỳ mood này có tên hẳn hoi đó: ambivert. |
| **I** Hướng nội | Rõ | Bạn nghiêng hẳn về Hướng nội ({n}/10), sạc pin bằng giờ me-time. | Hướng nội không phải là ngại người đâu, chỉ là bạn thích nghĩ kỹ rồi mới nói. |
| **I** Hướng nội | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Hướng nội nha, đi tiệc vẫn vui nhưng về nhà nằm mới là chân ái. | Kiểu tuỳ mood này có tên hẳn hoi đó: ambivert. |

## Phần 2 — S · N (Cách bạn tiếp nhận)

| Hướng | Mức | Kết luận | 💡 Mách nhỏ |
|---|---|---|---|
| **S** Thực tế | Rõ | Bạn nghiêng hẳn về Thực tế ({n}/10), mắt thấy tai nghe mới tin. | Thấy tin hot là bạn hỏi "nguồn đâu?" đầu tiên. |
| **S** Thực tế | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Thực tế nha, chân chạm đất mà đầu thỉnh thoảng vẫn bay. | Bạn đọc được cả chi tiết lẫn ý ngầm, combo này hiếm phết. |
| **N** Trực giác | Rõ | Bạn nghiêng hẳn về Trực giác ({n}/10), nhìn đâu cũng thấy bức tranh lớn. | Não bạn lúc nào cũng mở sẵn 10 tab "lỡ như thì sao". |
| **N** Trực giác | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Trực giác nha, mơ to nhưng vẫn check kỹ. | Bạn đọc được cả chi tiết lẫn ý ngầm, combo này hiếm phết. |

## Phần 3 — T · F (Cách bạn quyết định)

| Hướng | Mức | Kết luận | 💡 Mách nhỏ |
|---|---|---|---|
| **T** Lý trí | Rõ | Bạn nghiêng hẳn về Lý trí ({n}/10), não nhảy số nhanh hơn tim. | Lý trí không phải lạnh lùng đâu, bạn chỉ muốn mọi thứ hợp lý và công bằng. |
| **T** Lý trí | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Lý trí nha, phân tích kỹ mà vẫn để ý cảm xúc người khác. | Cân được cả logic lẫn lòng người là skill làm leader xịn đó. |
| **F** Cảm xúc | Rõ | Bạn nghiêng hẳn về Cảm xúc ({n}/10), quyết gì cũng nghĩ tới người trong cuộc trước. | Cảm xúc không phải mau nước mắt, mà là bạn sống theo giá trị mình tin. |
| **F** Cảm xúc | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Cảm xúc nha, nghe tim trước rồi để não duyệt lại. | Cân được cả logic lẫn lòng người là skill làm leader xịn đó. |

## Phần 4 — J · P (Cách bạn sắp xếp)

| Hướng | Mức | Kết luận | 💡 Mách nhỏ |
|---|---|---|---|
| **J** Nguyên tắc | Rõ | Bạn nghiêng hẳn về Nguyên tắc ({n}/10), có plan rõ ràng mới thấy yên tâm. | Gạch xong một dòng to-do list là đủ làm bạn vui cả buổi. |
| **J** Nguyên tắc | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Nguyên tắc nha, thích có plan nhưng lệch plan cũng không sập. | Lúc nào cũng có sẵn plan B là kiểu sống an toàn nhất. |
| **P** Linh hoạt | Rõ | Bạn nghiêng hẳn về Linh hoạt ({n}/10), nước đến chân mới nhảy mà nhảy vẫn đẹp. | Bạn thích để ngỏ lựa chọn, biết đâu lại có option xịn hơn. |
| **P** Linh hoạt | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Linh hoạt nha, ứng biến giỏi nhưng việc quan trọng vẫn lên lịch. | Lúc nào cũng có sẵn plan B là kiểu sống an toàn nhất. |

Câu gợi mở sau phần 4 (`RESULT_HOOK`): Đủ 4 chữ rồi, linh vật của bạn đang chờ được đánh thức!

---

## Cần bạn quyết trước khi code

1. **Phần 4:** (a) thêm một màn nghỉ ngắn trước kết quả để hiện câu J/P + ô khoá `I N T J` mở khoá, hay (b) bỏ, chữ J/P để màn kết quả hé lộ? Mình đề xuất **(b)**: thêm màn là thêm một lần bấm ngay trước khoảnh khắc đáng share nhất.
2. **Câu cân bằng dùng chung fact** cho hai hướng của cùng một chiều (ví dụ "ambivert"). Như vậy có được không, hay cần 16 fact khác nhau?
3. **Màn sau phần 2** đang có cung hoàng đạo + số chủ đạo. Tóm tắt S/N nằm **trên** hai ô đó, ô khoá MBTI chuyển thành `I N _ _`. Như vậy có ổn không?
