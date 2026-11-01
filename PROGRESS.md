# PROGRESS

Live: https://personality-test-virid.vercel.app (Vercel `personality-test`, manual CLI deploy from `web/`).
Branch: `feature/personal-definition/ui`. North Star: see `CLAUDE.md`.

## 2026-10-31 — UI round from user feedback

| # | Việc | Trạng thái | Commit |
|---|---|---|---|
| 1 | Landing: carousel nhỏ lại, ~2.5 thẻ trên mobile, cả 4 trên desktop (md+), tự cuộn chậm | ✅ | `91e225a` |
| 2 | Bấm thẻ để vào bài test (hover/active, cursor, Enter, vuốt không kích hoạt) | ✅ | `1f470af` |
| 3 | CTA mobile: hiện không cần cuộn ở 375×667 / 390×844 / 360×740 + sticky dự phòng có safe-area | ✅ | `d90af5b` |
| 4 | Màn nghỉ: tóm tắt sau mỗi phần (phần 1→4) + chữ hiện dần `I _ _ _` + câu gợi mở phần sau | ✅ đã code; nội dung từng câu vẫn chờ Khanh duyệt | `c9b8c2e` (doc), xem commit feat(interlude) |
| 5 | Màn nghỉ: bỏ chữ hồng, chuyển sang chữ trung tính | ✅ | `04fda27` |

**Kiểm tra:** 329/329 test, `tsc --noEmit` sạch, `next build` pass. **Không có script lint** (không cài ESLint), nên chưa chạy lint.
Kiểm tra trong trình duyệt (Playwright, bản build production): đo được 2.5 thẻ ở cả 3 viewport, CTA nằm trong màn hình; sticky ẩn ở hero / hiện khi CTA khuất / ẩn ở cuối trang; tự cuộn chạy, dừng tại chỗ khi chạm, không chạy khi bật reduced motion; tap và Enter trên thẻ đều mở form.
Ảnh trước/sau: `docs/screenshots/2026-10-31-feedback-round/`.

Thêm sau đó: câu hỏi chữ đen đậm (`16c4792`); form chỉ hỏi tên hiển thị, bỏ họ tên đầy đủ (`3e2ba30`); màn nghỉ dùng màu + mascot đầy đủ của thẻ phần, chữ đậm, copy Gen Z không gạch ngang; tách 2 khối (thẻ mascot nhỏ hơn + thẻ kết luận), confetti + bong bóng chúc mừng, ô "💡 Mách nhỏ".

Màn kết quả: nút **Chia sẻ kết quả** (Web Share kèm file ảnh, máy không hỗ trợ thì tự tải về), **Tải ảnh về** (PNG 1080×1350 vẽ bằng canvas: tên hiển thị, mascot, nhóm, loại, biệt danh, 4 thanh, không có ngày sinh), và **Khám phá lộ trình nghề nghiệp phù hợp** → CareerPath của team app (`?title=<nghề gợi ý đầu tiên>&mbti=<loại>`, mở tab mới). URL lấy từ biến `NEXT_PUBLIC_CAREERPATH_URL`, mặc định `/careerpath` (đúng khi chạy trong team app; bản standalone trên Vercel **cần set biến này** nếu không sẽ 404). Chưa có analytics nên `share_success` chưa đo được.

Màn kết quả thêm: thẻ **Số chủ đạo của bạn** (số + diễn giải, tính từ ngày sinh; vẫn không hiện cung hoàng đạo và các số theo tên); **chưa có link/refID**, thẻ đang hiện trạng thái "đang được cập nhật"); thẻ teaser **"Xác định năm cá nhân của bạn có gì tại đây"** gắn nhãn Sắp ra mắt, không bấm được.

Tiếp: quiz hiện **đủ 10 câu cùng lúc** (bỏ accordion), trả lời xong tự cuộn câu kế tiếp ra giữa màn hình (bàn phím thì không cuộn, không cướp focus), câu đã trả lời mờ đi; **gộp "Tải ảnh về" vào "Chia sẻ kết quả"**, file tên `ten_MBTI_sochudao.png` (vd `Khanh-Trang_ENTJ_4.png`); màn kết quả **xếp lại**: thẻ mascot bên trái, Số chủ đạo + Cung hoàng đạo bên phải, bên dưới là loại/biệt danh/đoạn mô tả và các thẻ chi tiết (thẻ "Số chủ đạo & cung hoàng đạo" có đủ diễn giải + các nét của cung). Cung hoàng đạo được đưa trở lại màn kết quả.

Đã **bỏ** thẻ thưởng "Chúc mừng bạn đã khám phá bản thân…" và cấu hình voucher (theo yêu cầu Khanh); chỉ giữ teaser "Năm cá nhân".

Thẻ chi tiết tách đôi: **Số chủ đạo của bạn** (diễn giải + "Mọi người hay nhìn số X là" + "Cùng số X với" người nổi tiếng) và **Cung hoàng đạo của bạn** ("X là người thế nào" + "Mọi người hay nhìn X là" + nét đặc trưng + "Cùng cung X với"). Nội dung mới ở `_lib/data/astro-profiles.json` (tự viết). Danh sách 52 người nổi tiếng ở `_lib/data/famous-birthdays.json`; số/cung của họ do app tự tính. ⚠ **Ngày sinh do Claude soạn từ trí nhớ, cần Khanh kiểm tra từng dòng** trong `docs/famous-birthdays-review.md` trước khi launch. (Theo cách tính của app, Obama là số 2, không phải số 4.)

Đã **bỏ** thẻ Điểm mạnh / Điểm cần cải thiện và nút "Khám phá lộ trình nghề nghiệp phù hợp" (cùng biến NEXT_PUBLIC_CAREERPATH_URL). Thẻ "Nghề nghiệp phù hợp" vẫn giữ.

**Hợp nhau (so sánh với bạn bè): ĐÃ GỠ BỎ (2026-11-01, Khanh yêu cầu).** Đã code xong 8/8 task (commit `de00f90`..`94ecae1`) rồi revert toàn bộ trong một commit. Muốn lấy lại: `git revert <commit gỡ bỏ>`. Spec `docs/hop-nhau-spec.md` và plan vẫn giữ.

**Bỏ ô "Trường của bạn"** khỏi form (2026-11-01). Form giờ chỉ còn tên hiển thị + ngày sinh; `university` cũng bỏ khỏi state, profile và types. File `_lib/data/universities.json` (70 trường) vẫn giữ nhưng không dùng.

**Chưa deploy lên Vercel.** Bản mới đang chạy ở localhost:3000 (production build). Live site vẫn là bản 10-01.

### Ghi chú
- Thẻ carousel bỏ dòng mô tả dài và tên cực (tên cực vẫn còn cho screen reader); thanh chấm và dòng "Vuốt ngang" ẩn từ md trở lên (cả 4 thẻ đã vừa màn hình).
- Thêm token `--color-worker-text-primary: #1E293B` vào `web/app/globals.css`. Team repo không có token chữ chính.
- Root layout thêm `viewport-fit=cover` để `env(safe-area-inset-bottom)` có giá trị trên iPhone.
- `next dev/build` cảnh báo workspace root bị đoán thành `C:\Users\KHANH TRANG` (có nhiều lockfile). Chưa sửa.
- `merchant_job_board` (team repo) **chưa** nhận các thay đổi này.

### Chữ hồng ở các màn khác (đã liệt kê, CHƯA sửa)
1. ~~`QuizItem.tsx:36`: câu hỏi màu hồng~~ → **đã sửa**: câu đang mở / chưa trả lời giờ là chữ đen đậm (`text-worker-text-primary font-semibold`), câu đã trả lời vẫn xám.
2. `LikertScale.tsx:72`: nhãn đáp án đã chọn ("Hơi giống mình"…) màu hồng.
3. `QuizPart.tsx:75`: tiêu đề phần ("Bạn giữa mọi người") theo màu phần, phần 1 là hồng `#db2777`.
4. `Hero.tsx:50`: nửa sau tiêu đề "Bạn có đang lạc lối?" gradient hồng→tím.
5. `OnboardingForm.tsx:70`: chữ "bản thân" trong tiêu đề form gradient hồng→tím.
6. `QuizPreview.tsx`: dòng eyebrow "40 CÂU HỎI · 4 PHẦN" `#ec4899`; nhãn "Phần 1 · Câu 1–10" + chữ E↔I trên thẻ 1 màu hồng.
7. Kết quả, nhóm **Nhóm Lý Tưởng (NF)**: accent `#be185d`, nên tên loại (h1), nhãn cực thắng, tiêu đề/chip các thẻ kết quả đều hồng với INFP/INFJ/ENFP/ENFJ.
8. (Icon, không phải chữ) dấu ✓ câu đã trả lời `QuizItem.tsx:42`.
