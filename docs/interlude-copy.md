# Màn nghỉ — nội dung tóm tắt sau mỗi phần (CHỜ DUYỆT)

> Trạng thái: **bản nháp, chưa code.** Duyệt xong nội dung + 3 câu hỏi ở cuối thì mới làm.

## Cách chọn câu (đề xuất)

Mỗi phần = 10 câu của đúng 1 chiều. Mỗi câu trả lời là −2…+2. Sau khi nhân với `key`, câu đó **nghiêng về** cực A (>0), cực B (<0) hoặc **trung lập** (0, "Tuỳ lúc"/"Còn tuỳ").

- `n` = số câu nghiêng về cực thắng (0–10; câu trung lập không tính cho bên nào).
- **Nghiêng rõ:** khi một cực có `n ≥ 7` → dùng câu *rõ* và hiện `n/10`.
- **Cân bằng:** mọi trường hợp còn lại (5-5, 6-4, 4-3 kèm 3 câu trung lập…) → dùng câu *cân bằng*, **không hiện số**.
- Chữ cái được hé lộ = chữ của engine: dấu của `S = Σ(r × key)`, hoà thì về cực mặc định (I, N, F, P). Vì vậy chữ ở màn nghỉ **luôn trùng** chữ ở kết quả cuối.
- Lý do bảo đảm khớp: nếu `n ≥ 7` thì phía đó được ít nhất +7, phía kia nhiều nhất 3 câu × −2 = −6, nên `S` không thể đổi dấu. Ở trường hợp cân bằng mình không hiện con số, nên không có chuyện "7/10 nghiêng E nhưng kết quả ra I".

Mỗi kết luận tối đa 2 câu: câu 1 = kết luận, câu 2 = "fact" vui. Các fact **diễn giải lại định nghĩa cực trong `questions.json`** (pole_definitions), không phải số liệu thống kê, nên không bịa nghiên cứu nào.

`{n}` = số câu nghiêng. Ô khoá MBTI hiện dần: sau phần 1 `I _ _ _`, sau phần 2 `I N _ _`, sau phần 3 `I N T _`.

---

## Phần 1 — E · I (Bạn giữa mọi người)

| Hướng | Mức | Nội dung |
|---|---|---|
| **E** Hướng ngoại | Rõ | Bạn nghiêng về Hướng ngoại ({n}/10) — đông người là pin đầy. Fact: dân Hướng ngoại hay nghĩ bằng miệng, nói ra rồi mới thấy rõ ý mình. |
| **E** Hướng ngoại | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Hướng ngoại — vui được, chill một mình cũng được. Fact: kiểu "tuỳ mood" này có tên hẳn hoi đó: ambivert. |
| **I** Hướng nội | Rõ | Bạn nghiêng về Hướng nội ({n}/10) — sạc pin bằng thời gian một mình. Fact: Hướng nội không phải là ngại người, chỉ là bạn nghĩ xong rồi mới nói. |
| **I** Hướng nội | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Hướng nội — đi tiệc được, nhưng về nhà vẫn thấy sướng hơn. Fact: kiểu "tuỳ mood" này có tên hẳn hoi đó: ambivert. |

## Phần 2 — S · N (Cách bạn tiếp nhận)

| Hướng | Mức | Nội dung |
|---|---|---|
| **S** Thực tế | Rõ | Bạn nghiêng về Thực tế ({n}/10) — tin những gì thấy được, kiểm chứng được. Fact: team Thực tế là kiểu hỏi "nguồn đâu?" trước khi tin một cái tin hot. |
| **S** Thực tế | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Thực tế — chân vẫn chạm đất nhưng đầu thỉnh thoảng bay. Fact: bạn đọc được cả chi tiết lẫn "ý ngầm", combo này hiếm phết. |
| **N** Trực giác | Rõ | Bạn nghiêng về Trực giác ({n}/10) — thấy được bức tranh lớn sau mấy con số. Fact: team Trực giác hay hỏi "nếu như…", đầu lúc nào cũng mở 10 tab. |
| **N** Trực giác | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Trực giác — mơ to nhưng vẫn check lại cho chắc. Fact: bạn đọc được cả chi tiết lẫn "ý ngầm", combo này hiếm phết. |

## Phần 3 — T · F (Cách bạn quyết định)

| Hướng | Mức | Nội dung |
|---|---|---|
| **T** Lý trí | Rõ | Bạn nghiêng về Lý trí ({n}/10) — não nhảy số trước khi tim kịp lên tiếng. Fact: Lý trí không có nghĩa là lạnh lùng, bạn chỉ muốn mọi thứ hợp lý và công bằng. |
| **T** Lý trí | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Lý trí — phân tích kỹ nhưng vẫn để ý cảm xúc người khác. Fact: cân được cả logic lẫn lòng người là skill làm leader xịn đó. |
| **F** Cảm xúc | Rõ | Bạn nghiêng về Cảm xúc ({n}/10) — quyết gì cũng nghĩ tới người trong cuộc trước. Fact: Cảm xúc không phải là dễ khóc, mà là bạn chọn theo giá trị mình tin. |
| **F** Cảm xúc | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Cảm xúc — nghe tim trước, rồi để não duyệt lại. Fact: cân được cả logic lẫn lòng người là skill làm leader xịn đó. |

## Phần 4 — J · P (Cách bạn sắp xếp)

> ⚠ Hiện tại **không có màn nghỉ sau phần 4** — bấm "Xem kết quả" là vào thẳng kết quả. Xem câu hỏi 1 ở cuối.

| Hướng | Mức | Nội dung |
|---|---|---|
| **J** Nguyên tắc | Rõ | Bạn nghiêng về Nguyên tắc ({n}/10) — có kế hoạch là thấy yên tâm. Fact: gạch xong một dòng to-do list là kiểu sướng rất riêng của team Nguyên tắc. |
| **J** Nguyên tắc | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Nguyên tắc — thích có plan nhưng lệch plan cũng không sập. Fact: có plan A mà vẫn sẵn plan B là kiểu sống an toàn nhất. |
| **P** Linh hoạt | Rõ | Bạn nghiêng về Linh hoạt ({n}/10) — nước đến chân mới nhảy, mà nhảy vẫn đẹp. Fact: team Linh hoạt thích để ngỏ lựa chọn, vì biết đâu có option xịn hơn. |
| **P** Linh hoạt | Cân bằng | Bạn khá cân bằng, nhích nhẹ về Linh hoạt — ứng biến giỏi nhưng việc quan trọng vẫn lên lịch. Fact: có plan A mà vẫn sẵn plan B là kiểu sống an toàn nhất. |

---

## Cần bạn quyết trước khi code

1. **Phần 4:** (a) thêm một màn nghỉ ngắn trước kết quả để hiện câu J/P + ô khoá `I N T J` mở khoá, hay (b) bỏ, chữ J/P để màn kết quả hé lộ? Mình đề xuất **(b)**: thêm màn là thêm một lần bấm ngay trước khoảnh khắc đáng share nhất.
2. **Câu cân bằng dùng chung fact** cho hai hướng của cùng một chiều (ví dụ "ambivert"). Như vậy có được không, hay cần 16 fact khác nhau?
3. **Màn sau phần 2** đang có cung hoàng đạo + số chủ đạo. Tóm tắt S/N nằm **trên** hai ô đó, ô khoá MBTI chuyển thành `I N _ _`. Như vậy có ổn không?
