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

Mỗi kết luận tối đa 2 câu, giọng Gen Z, **không dùng gạch ngang nối câu** (có test kiểm tra). Câu 1 = kết luận, câu 2 = "fun fact". Các fact **diễn giải lại định nghĩa cực trong `questions.json`** (pole_definitions), không phải số liệu thống kê, nên không bịa nghiên cứu nào.

`{n}` = số câu nghiêng. Ô khoá MBTI hiện dần: sau phần 1 `I _ _ _`, sau phần 2 `I N _ _`, sau phần 3 `I N T _`.

---

## Phần 1 — E · I (Bạn giữa mọi người)

| Hướng | Mức | Nội dung |
|---|---|---|
| **E** Hướng ngoại | Rõ | Bạn nghiêng hẳn về Hướng ngoại ({n}/10), đông người là pin full vạch. Fun fact: hội Hướng ngoại hay vừa nói vừa nghĩ, nói ra rồi mới biết mình nghĩ gì. |
| **E** Hướng ngoại | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Hướng ngoại nha. Quẩy được mà chill một mình cũng ok, kiểu này người ta gọi là ambivert đó. |
| **I** Hướng nội | Rõ | Bạn nghiêng hẳn về Hướng nội ({n}/10), sạc pin bằng giờ me-time. Fun fact: hướng nội không phải là ngại người đâu, chỉ là bạn thích nghĩ kỹ rồi mới nói. |
| **I** Hướng nội | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Hướng nội nha. Đi tiệc vẫn vui nhưng về nhà nằm mới là chân ái, kiểu này người ta gọi là ambivert đó. |

## Phần 2 — S · N (Cách bạn tiếp nhận)

| Hướng | Mức | Nội dung |
|---|---|---|
| **S** Thực tế | Rõ | Bạn nghiêng hẳn về Thực tế ({n}/10), mắt thấy tai nghe mới tin. Fun fact: thấy tin hot là bạn hỏi "nguồn đâu?" đầu tiên. |
| **S** Thực tế | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Thực tế nha. Chân chạm đất mà đầu thỉnh thoảng vẫn bay, đọc được cả chi tiết lẫn ý ngầm luôn. |
| **N** Trực giác | Rõ | Bạn nghiêng hẳn về Trực giác ({n}/10), nhìn đâu cũng thấy bức tranh lớn. Fun fact: não bạn lúc nào cũng mở sẵn 10 tab "lỡ như thì sao". |
| **N** Trực giác | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Trực giác nha. Mơ to nhưng vẫn check kỹ, đọc được cả chi tiết lẫn ý ngầm luôn. |

## Phần 3 — T · F (Cách bạn quyết định)

| Hướng | Mức | Nội dung |
|---|---|---|
| **T** Lý trí | Rõ | Bạn nghiêng hẳn về Lý trí ({n}/10), não nhảy số nhanh hơn tim. Fun fact: lý trí không phải lạnh lùng đâu, bạn chỉ muốn mọi thứ hợp lý và công bằng. |
| **T** Lý trí | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Lý trí nha. Phân tích kỹ mà vẫn để ý cảm xúc người khác, combo này làm leader là hợp lắm. |
| **F** Cảm xúc | Rõ | Bạn nghiêng hẳn về Cảm xúc ({n}/10), quyết gì cũng nghĩ tới người trong cuộc trước. Fun fact: cảm xúc không phải mau nước mắt, mà là bạn sống theo giá trị mình tin. |
| **F** Cảm xúc | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Cảm xúc nha. Nghe tim trước rồi để não duyệt lại, combo này làm leader là hợp lắm. |

## Phần 4 — J · P (Cách bạn sắp xếp)

| Hướng | Mức | Nội dung |
|---|---|---|
| **J** Nguyên tắc | Rõ | Bạn nghiêng hẳn về Nguyên tắc ({n}/10), có plan rõ ràng mới thấy yên tâm. Fun fact: gạch xong một dòng to-do list là đủ làm bạn vui cả buổi. |
| **J** Nguyên tắc | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Nguyên tắc nha. Thích có plan nhưng lệch plan cũng không sập, lúc nào cũng có sẵn plan B. |
| **P** Linh hoạt | Rõ | Bạn nghiêng hẳn về Linh hoạt ({n}/10), nước đến chân mới nhảy mà nhảy vẫn đẹp. Fun fact: bạn thích để ngỏ lựa chọn, biết đâu lại có option xịn hơn. |
| **P** Linh hoạt | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Linh hoạt nha. Ứng biến giỏi nhưng việc quan trọng vẫn lên lịch đàng hoàng, lúc nào cũng có sẵn plan B. |

Câu gợi mở sau phần 4 (`RESULT_HOOK`): Đủ 4 chữ rồi, linh vật của bạn đang chờ được đánh thức!

---

## Cần bạn quyết trước khi code

1. **Phần 4:** (a) thêm một màn nghỉ ngắn trước kết quả để hiện câu J/P + ô khoá `I N T J` mở khoá, hay (b) bỏ, chữ J/P để màn kết quả hé lộ? Mình đề xuất **(b)**: thêm màn là thêm một lần bấm ngay trước khoảnh khắc đáng share nhất.
2. **Câu cân bằng dùng chung fact** cho hai hướng của cùng một chiều (ví dụ "ambivert"). Như vậy có được không, hay cần 16 fact khác nhau?
3. **Màn sau phần 2** đang có cung hoàng đạo + số chủ đạo. Tóm tắt S/N nằm **trên** hai ô đó, ô khoá MBTI chuyển thành `I N _ _`. Như vậy có ổn không?
