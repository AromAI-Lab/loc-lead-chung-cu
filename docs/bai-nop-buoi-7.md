# BÀI NỘP BUỔI 7 — Đưa ra cho người lạ dùng thật

*Chỗ nào có 【 】 là chị điền số thật vào rồi xoá ngoặc. Đừng để nguyên ngoặc khi nộp.*
*Dán toàn bộ phần dưới dòng kẻ vào ô nộp trên Campus. Campus hiện Markdown đúng, kể cả bảng.*

---

**Sản phẩm: LỌC LEAD - XÂY HỒ SƠ KHÁCH HÀNG**
Chạy thật: https://loc-lead-chung-cu.vercel.app · Mã nguồn mở: https://github.com/AromAI-Lab/loc-lead-chung-cu

Dán đoạn chat Zalo với khách bất động sản → biết lead nào Ảo để bỏ, lead nào Nóng để gọi trước, và có luôn hồ sơ khách đã điền sẵn. Dữ liệu cá nhân được che ngay trên máy người dùng trước khi có bất kỳ kết nối mạng nào.

---

## Bài 1 — 100 người dùng đầu tiên

**Con số thật đo được lúc 10:15 ngày 17/09, lấy thẳng từ PostHog:**

| | Tất cả | Sau khi bỏ dữ liệu thử của em |
|---|---|---|
| Lượt xem trang | 13 lượt · 6 người | **6 lượt · 4 người** |
| Bấm chấm | 12 lần · 4 người | |
| — trong đó bấm **ca mẫu** | 9 lần · 3 người | |
| — trong đó **dán hội thoại thật** | 3 lần · 2 người | **2 lần · 1 người** |
| Lưu hồ sơ khách | 3 lần · 2 người | **2 lần · 1 người** |

**Người lạ thật sự dùng: 1.** Không phải 100.

Con số 1 đó là con số em quan tâm nhất trong bảng, vì nó là người duy nhất tự dán hội thoại khách của chính họ vào và bấm chấm hai lần rồi lưu hồ sơ — tức là dùng hết luồng, không phải xem thử. Chín lần bấm còn lại là bấm ca mẫu: người ta tò mò, bấm thử cái nút, rồi thoát.

Em nộp đúng số đo được, không độn. Chưa đạt 100. Ba lý do, nói thẳng:

**1. Tệp sẵn có của em không trùng tệp khách của sản phẩm.** Fanpage cá nhân của em là người 40–55 muốn đưa AI vào nghề, không phải sale bất động sản. Đăng vào đó ra lượt truy cập nhưng phần lớn là người xem thử rồi thoát. Em đo được chuyện đó, vì công cụ phân biệt "bấm ca mẫu" với "dán hội thoại thật" — hai con số này chênh nhau rất xa, và con số thứ hai mới là người dùng thật.

**2. Kênh của khách là Zalo cá nhân, không phải quảng cáo.** Sale căn hộ dùng Zalo cá nhân là chính, Facebook cũng là tài khoản cá nhân chứ không có fanpage. Không có đường nào tiếp cận hàng loạt. Mỗi người là một tin nhắn riêng, và em đã chốt nguyên tắc không nhắn dồn một người nhiều lần.

**3. Em chọn sửa sản phẩm thay vì chạy số.** Ngày 16/09 em test lại toàn bộ luồng và tìm ra bốn lỗi, trong đó hai lỗi có sẵn trong mã từ trước:
- Khách nói "có tài chính 5 tỷ" mà máy vẫn báo "chưa rõ khả năng tài chính"
- **Câu chào hàng của chính sale ("để em gửi anh bảng hàng") làm khách của họ bị gắn cờ "nghi môi giới đối thủ" và bị xếp ẢO** — tức là công cụ bảo sale vứt đi đúng khách sắp mua
- Hội thoại gõ không dấu bị chấm lệch 6 điểm mà máy không cảnh báo gì
- Một ca kiểm thử cốt lõi đang xanh một cách tình cờ, nhờ chính lỗi số 2 che đi

Sáng nay 17/09 em làm tiếp việc lớn nhất trong số đó. Sale gõ Zalo thì lẫn lộn cả bốn kiểu: có dấu, không dấu, lẫn tiếng Anh, viết tắt. Bộ tiêu chí của em viết bằng tiếng Việt có dấu đầy đủ chữ — nên **cùng một hội thoại, bản có dấu chấm NÓNG 9/12, bản không dấu chấm LẠNH 3/12.** Lệch 6 điểm, và máy im lặng. Em đã dựng lớp chuẩn hoá bỏ dấu cho cả văn bản lẫn từ khoá: **đo lại cùng ca đó, 10/12 NÓNG ở cả hai bản, lệch 0.**

Phần khó không phải bỏ dấu, mà là mấy chữ bỏ dấu xong thì đụng chữ khác nghĩa: *"vậy"* thành *"vay"* (mà "giá bao nhiêu **vậy** em" là câu hỏi phổ thông nhất của khách), *"lại sau"* thành *"lãi sau"*, *"cuối năm"* thành *"cưới"*. Em phải viết bộ kiểm thử riêng để chặn từng chữ một — 34 phép, tổng lên 167.

Em quyết định sửa trước rồi mới đăng. Kéo 100 người vào một công cụ đang ném đi lead nóng thì được con số đẹp trong bài nộp và mất sạch người dùng ngoài đời.

**Thứ em có mà con số không thể hiện được:** phản hồi đầy đủ 6 câu từ một sale đang hành nghề, và phản hồi ấy đẻ ra 2 lỗi đã sửa, 1 thay đổi giao diện, và 1 hướng sản phẩm. Người thứ hai nói y hệt người thứ nhất — "nhiều tiêu chí quá, dài dòng" và "không trực quan lắm" — nên đó là tín hiệu, không phải ý kiến lẻ.

**Ảnh chụp minh chứng:** 【ảnh PostHog · ảnh phản hồi sale trên Zalo】

---

## Bài 2 — Ba kênh phân phối, có gắn đo lường

Ba kênh chọn từ bản đồ phân phối Buổi 7:

| # | Kênh | Cách làm | Mã nguồn trên link |
|---|---|---|---|
| 1 | **Facebook** — Fanpage "Bà Cô Làm Chủ AI" + nhóm sale BĐS | Fanpage kể cách làm sản phẩm cho một nghề không phải nghề mình; nhóm sale thì cho trước bộ tiêu chí đọc được, công cụ nằm ở dòng cuối | `utm_source=facebook` |
| 2 | **Zalo** — nhắn riêng từng sale + nhóm | Kênh ICP thật sự sống. Xin một việc nhỏ ("dán thử một đoạn chat cũ"), không xin mua. Một người nhắn một lần | `utm_source=zalo` |
| 3 | **GitHub Skill** — skill công khai `cham-lead-bds` | Skill lấy bộ tiêu chí gốc từ chính trang sản phẩm, và tự nhận ba giới hạn của nó | `utm_source=github` |

**Công cụ đo: PostHog** (bài giảng 8 Buổi 7). Đã gắn và **đã kiểm chứng máy chủ nhận được** — HTTP 200, `{"status":"Ok"}`.

Ba sự kiện được ghi: `thu_ca_mau`, `bam_cham`, `luu_ho_so`.

**Chỗ em xử lý khác với làm cho xong:**

Sáng 15/09 em đã in lên trang câu in đậm *"Không có công cụ theo dõi nào trong trang"*. Gắn PostHog vào là làm câu đó thành sai. Em không để vậy, mà sửa lại câu chữ cho đúng sự thật: có đếm lượt truy cập ẩn danh, nói rõ đếm cái gì.

Rồi em bọc PostHog bằng một lớp có **bộ lọc trắng**: chỉ 7 tên thuộc tính được phép gửi đi, chuỗi dài quá 40 ký tự bị chặn — nội dung hội thoại luôn dài hơn. Có **17 phép kiểm thử** cố tình nhét hội thoại thật, tên khách, số điện thoại vào để xem có lọt không. Ai thêm một thuộc tính chứa chữ người dùng gõ thì `npm test` đỏ ngay.

Chạy thử lần đầu em phát hiện dòng `defaults` của PostHog **tự bật bản đồ nhiệt** — ghi toạ độ chỗ người ta bấm. Nó không gửi nội dung, nhưng trang vừa hứa "đã tắt phần đọc thao tác". Em tắt bản đồ nhiệt, rage-click, dead-click và cả cookie. Kiểm lại bằng cách xoá sạch cookie rồi tải lại từ đầu — không có cookie mới nào, chỉ còn `localStorage`.

**Một lời hứa không có mã chặn ở dưới thì chỉ là câu chữ.**

**Số đo được của ba kênh — và đây là chỗ em phải nói thẳng:**

| Kênh | `utm_source` | Người bấm vào |
|---|---|---|
| Zalo | `zalo` | **3** |
| Facebook | `facebook` | **0** |
| GitHub Skill | `github` | **0** |

**Chỉ kênh Zalo ra người. Hai kênh kia bằng không.** Link đã gắn đúng, đo lường chạy đúng — nên số 0 này là số thật chứ không phải lỗi đo. Nó nói rằng bài đăng Facebook của em không tới được sale bất động sản (đúng như em phân tích ở Bài 1: tệp Fanpage của em không trùng tệp khách của sản phẩm), và GitHub Skill thì mới đăng, chưa ai cài.

Giá trị của việc gắn đo lường nằm ở đây: không gắn thì em vẫn tưởng ba kênh đều đang chạy. Gắn rồi mới biết chỉ có một kênh sống, và đó là kênh tốn công nhất — nhắn tay từng người.

**Ảnh chụp minh chứng:** 【ảnh PostHog Web analytics · ảnh danh sách sự kiện `bam_cham` có cột `tu_ca_mau`】

---

## Bài 3 — Phân phối qua GitHub Skill

**Skill công khai:** https://github.com/AromAI-Lab/b2o-research-skills/tree/main/skills/cham-lead-bds
Cài: `git clone` rồi `cp -r skills/* ~/.claude/skills/`. Gõ `/cham-lead-bds` hoặc chỉ cần nói "chấm giúp lead này".

**Cách lồng sản phẩm — em cố tình không nhét link quảng cáo:**

**Một, skill lấy bộ tiêu chí gốc từ chính trang sản phẩm.** Bản chép trong skill là bản rút gọn; bản đầy đủ và mới nhất nằm ở `loc-lead-chung-cu.vercel.app/docs/scoring-criteria.md`. Skill bảo AI đọc tệp đó trước khi chấm nếu có mạng — vì ngưỡng điểm đang được hiệu chuẩn nên bản chép sẽ cũ. Người dùng skill có lý do thật để đi về sản phẩm: **lấy dữ liệu đúng**.

**Hai, skill tự nhận ba giới hạn của nó:**

| Skill làm được | Bản web làm được |
|---|---|
| Che dữ liệu bằng tay theo mô tả | Che trên máy bạn, trước mọi kết nối mạng |
| Chấm từng lead một | Chấm rồi lưu vào kho, tra lại được |
| Hết phiên là mất | Hồ sơ nằm trong trình duyệt, xuất JSON sao lưu được |

Rồi nói thẳng: *"Từ lead thứ năm trở đi trong ngày thì nên dùng bản web — không phải vì skill này kém, mà vì thứ sale cần lúc đó là kho hồ sơ tra lại được, và một tệp markdown không làm được việc đó."*

Đây là mô hình **sản phẩm vệ tinh kéo về sản phẩm chủ lực** ở bài giảng 11: skill là vệ tinh, cho không, mã nguồn mở; lõi dữ liệu nằm ở sản phẩm.

**Skill cũng mang theo nguyên tắc sản phẩm, không chỉ mang chức năng:** bắt buộc che dữ liệu cá nhân TRƯỚC khi phân tích, từ chối chấm khi hội thoại dưới 25 từ, và bắt AI trích đúng câu trong hội thoại làm căn cứ cho mỗi điểm — không có câu làm chứng thì cho 0, không đoán.

**Ảnh chụp minh chứng:** 【ảnh trang GitHub của skill · ảnh chạy skill trong Claude Code】

---

## Bài 4 — Email marketing

**Hoạt động:** thu thập email đổi lấy bộ tiêu chí, rồi gửi một thư có nội dung thật.

**Vì sao chọn cách này:** chưa có danh sách email nào. Xây từ số không bằng một thứ người ta thật sự muốn thì đúng hơn là mua danh sách.

**Vì sao là link chứ không nhúng biểu mẫu vào trang:** nhúng biểu mẫu là thêm script bên thứ ba — trái với lời hứa "ngoài PostHog ra không có gì khác" vừa in trên trang. Một cái link mở tab mới thì không phá lời hứa đó.

**Biểu mẫu đã tạo và đã xuất bản:** https://docs.google.com/forms/d/e/1FAIpQLScVBBpD5vCpCEkFTXXZgXy1CLNwWMVp6wK5oS0UlqtkVQ_V_Q/viewform

Đúng hai ô, cố ý không hỏi thêm: **email** (người nhập tay, không bắt đăng nhập Google) và **anh/chị đang bán căn hộ ở khu vực nào** (5 lựa chọn cố định).

**Vì sao chỉ hai ô, và vì sao không bắt đăng nhập Google:** người của em bấm link từ tin nhắn Zalo, mà trình duyệt trong Zalo không mang theo phiên đăng nhập Google. Bật chế độ email đã xác thực thì sale gặp tường đăng nhập ngay ở bước đầu và thoát. Em chọn email gõ tay — chấp nhận vài cái sai chính tả để đổi lấy người thật sự vào được. Chỗ rớt người nguy hiểm hơn chỗ sai chính tả.

**Bộ 6 câu khảo sát là việc khác, không nằm trong biểu mẫu này.** Bộ đó em gửi riêng cho người **đã dùng thử công cụ**, vì nó hỏi về trải nghiệm dùng. Hỏi "cái nào vô lý" với người chưa dùng thì không ra gì. Câu đó mới là câu mạnh nhất của bộ 6 — nó buộc người ta chê cụ thể, và chính nó đẻ ra lỗi tài chính em đã sửa. Biểu mẫu ở đây làm một việc khác hẳn: đổi bộ tiêu chí lấy một địa chỉ email.

**Thư gửi ngay cho người đăng ký** có một đoạn em cố ý đưa vào:

> *Em nói trước một điều để anh/chị dùng cho đúng: ngưỡng 9/6/3 chưa được hiệu chuẩn xong. Nên lúc này hãy coi điểm số là cách xếp thứ tự gọi ai trước, đừng coi là phán quyết.*

**Ảnh chụp minh chứng:** 【ảnh màn hình Phản hồi của Google Biểu mẫu · ảnh thư đã gửi】

---

## Điều em học được

Ngày 16/09 em test lại toàn bộ trên trang thật và tìm ra bốn lỗi. `npm test` lúc đó đang 94 phép xanh hết.

**Bốn lỗi đều nằm ngoài tầm nhìn của 94 phép đó.** Hai lỗi do sửa mã cắt nhầm dòng khai báo, hai lỗi có sẵn trong lõi từ trước — trong đó lỗi "lời sale bị tính thành cờ Ảo của khách" đã nằm im từ đầu, và nó làm công cụ bảo sale **vứt đi đúng khách sắp mua**.

Vì sao kiểm thử không thấy: các phép đó chạy trên hội thoại mẫu do chính người viết mã nghĩ ra. Hội thoại mẫu không có câu chào hàng của sale ở cuối. Một sale thật thì luôn có.

Hai việc em làm sau đó:
- Gắn **ESLint luật `no-undef`** để bắt lỗi cắt nhầm — và **kiểm chứng bằng cách xoá lại dòng đó rồi chạy thử**, thấy nó chỉ ra đúng chỗ.
- Thêm **21 phép kiểm thử mới** viết từ hội thoại thật, không phải hội thoại nghĩ ra. Tổng 115 phép.

**Bài học:** kiểm thử xanh chứng minh mã chạy đúng như người viết nghĩ. Nó không chứng minh người viết nghĩ đúng. Chỉ có gõ một đoạn chat thật vào trang thật rồi nhìn kết quả mới trả lời được câu đó.

Đó cũng là lý do em nộp con số thật ở Bài 1 thay vì con số đẹp.
