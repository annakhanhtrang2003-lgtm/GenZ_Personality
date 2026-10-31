# Người nổi tiếng: kiểm tra ngày sinh trước khi launch

Danh sách do Claude soạn **từ trí nhớ**, chưa đối chiếu nguồn. Số chủ đạo và cung trong bảng là do app **tự tính** từ ngày sinh (cùng công thức với người dùng), nên chỉ cần kiểm tra **ngày sinh**. Ngày nào sai thì sửa trong `web/app/personal-definition/_lib/data/famous-birthdays.json`; số và cung tự cập nhật. Muốn bỏ ai thì xoá dòng của người đó trong file JSON.

Cách tính số chủ đạo: rút gọn ngày, tháng, năm riêng rồi cộng lại (giữ 11/22/33). Ví dụ Obama 04/08/1961 → 4 + 8 + 8 = 20 → **2** (không phải 4).

| Tên | Nổi tiếng vì | Ngày sinh | Số chủ đạo | Cung | Đã kiểm tra |
|---|---|---|---|---|---|
| Sơn Tùng M-TP | ca sĩ | 05/07/1994 | 8 | Cự Giải | ☐ |
| Mỹ Tâm | ca sĩ | 16/01/1981 | 9 | Ma Kết | ☐ |
| Đen Vâu | rapper | 13/05/1989 | 9 | Kim Ngưu | ☐ |
| Trấn Thành | MC, đạo diễn | 05/02/1987 | 5 | Bảo Bình | ☐ |
| Hoàng Thùy Linh | ca sĩ | 11/08/1988 | 9 | Sư Tử | ☐ |
| HIEUTHUHAI | rapper | 28/09/1999 | 11 | Thiên Bình | ☐ |
| Nguyễn Quang Hải | cầu thủ | 12/04/1997 | 6 | Bạch Dương | ☐ |
| Ngô Bảo Châu | nhà toán học | 28/06/1972 | 8 | Cự Giải | ☐ |
| Đặng Thái Sơn | nghệ sĩ piano | 02/07/1958 | 5 | Cự Giải | ☐ |
| Barack Obama | cựu Tổng thống Mỹ | 04/08/1961 | 2 | Sư Tử | ☐ |
| Taylor Swift | ca sĩ | 13/12/1989 | 7 | Nhân Mã | ☐ |
| Elon Musk | doanh nhân | 28/06/1971 | 7 | Cự Giải | ☐ |
| Steve Jobs | đồng sáng lập Apple | 24/02/1955 | 1 | Song Ngư | ☐ |
| Bill Gates | đồng sáng lập Microsoft | 28/10/1955 | 4 | Bọ Cạp | ☐ |
| Albert Einstein | nhà vật lý | 14/03/1879 | 6 | Song Ngư | ☐ |
| Marie Curie | nhà khoa học | 07/11/1867 | 4 | Bọ Cạp | ☐ |
| Lionel Messi | cầu thủ | 24/06/1987 | 1 | Cự Giải | ☐ |
| Cristiano Ronaldo | cầu thủ | 05/02/1985 | 3 | Bảo Bình | ☐ |
| Son Heung-min | cầu thủ | 08/07/1992 | 9 | Cự Giải | ☐ |
| Oprah Winfrey | người dẫn chương trình | 29/01/1954 | 4 | Bảo Bình | ☐ |
| Leonardo DiCaprio | diễn viên | 11/11/1974 | 7 | Bọ Cạp | ☐ |
| Keanu Reeves | diễn viên | 02/09/1964 | 4 | Xử Nữ | ☐ |
| Thành Long | diễn viên | 07/04/1954 | 3 | Bạch Dương | ☐ |
| Zendaya | diễn viên | 01/09/1996 | 8 | Xử Nữ | ☐ |
| Tom Holland | diễn viên | 01/06/1996 | 5 | Song Tử | ☐ |
| Emma Watson | diễn viên | 15/04/1990 | 11 | Bạch Dương | ☐ |
| Beyoncé | ca sĩ | 04/09/1981 | 5 | Xử Nữ | ☐ |
| Lady Gaga | ca sĩ | 28/03/1986 | 1 | Bạch Dương | ☐ |
| Rihanna | ca sĩ, doanh nhân | 20/02/1988 | 3 | Song Ngư | ☐ |
| Ariana Grande | ca sĩ | 26/06/1993 | 9 | Cự Giải | ☐ |
| Billie Eilish | ca sĩ | 18/12/2001 | 6 | Nhân Mã | ☐ |
| Ed Sheeran | ca sĩ | 17/02/1991 | 3 | Bảo Bình | ☐ |
| Justin Bieber | ca sĩ | 01/03/1994 | 9 | Song Ngư | ☐ |
| Michael Jackson | ca sĩ | 29/08/1958 | 6 | Xử Nữ | ☐ |
| Mark Zuckerberg | đồng sáng lập Facebook | 14/05/1984 | 5 | Kim Ngưu | ☐ |
| Jeff Bezos | nhà sáng lập Amazon | 12/01/1964 | 6 | Ma Kết | ☐ |
| Walt Disney | nhà sáng lập Disney | 05/12/1901 | 1 | Nhân Mã | ☐ |
| Jennie | BLACKPINK | 16/01/1996 | 6 | Ma Kết | ☐ |
| Lisa | BLACKPINK | 27/03/1997 | 2 | Bạch Dương | ☐ |
| Rosé | BLACKPINK | 11/02/1997 | 3 | Bảo Bình | ☐ |
| Jisoo | BLACKPINK | 03/01/1995 | 1 | Ma Kết | ☐ |
| RM | BTS | 12/09/1994 | 8 | Xử Nữ | ☐ |
| Jimin | BTS | 13/10/1995 | 11 | Thiên Bình | ☐ |
| V | BTS | 30/12/1995 | 3 | Ma Kết | ☐ |
| Jungkook | BTS | 01/09/1997 | 9 | Xử Nữ | ☐ |
| IU | ca sĩ | 16/05/1993 | 7 | Kim Ngưu | ☐ |
| Meryl Streep | diễn viên | 22/06/1949 | 33 | Cự Giải | ☐ |
| Will Smith | diễn viên | 25/09/1968 | 22 | Thiên Bình | ☐ |
| Paul McCartney | nhạc sĩ, The Beatles | 18/06/1942 | 22 | Song Tử | ☐ |
| Angelina Jolie | diễn viên | 04/06/1975 | 5 | Song Tử | ☐ |
| Daniel Radcliffe | diễn viên | 23/07/1989 | 3 | Sư Tử | ☐ |
| Jennifer Lopez | ca sĩ, diễn viên | 24/07/1969 | 2 | Sư Tử | ☐ |
