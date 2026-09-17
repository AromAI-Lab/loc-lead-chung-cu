# Bàn giao — LỌC LEAD - XÂY HỒ SƠ KHÁCH HÀNG

*Cập nhật 17/09/2026 (lần 2, sau khi xong lớp chuẩn hoá đầu vào). Mở phiên mới thì đọc file này trước, đừng hỏi lại từ đầu.*
*File này THAY THẾ bản `BAN-GIAO-BUOI-7.md` cũ. Quy trình nộp Campus nằm ở skill `build-to-own-campus`.*

---

## 1. Một phút bối cảnh

| | |
|---|---|
| Tên sản phẩm | **LỌC LEAD - XÂY HỒ SƠ KHÁCH HÀNG** (đổi 16/09, trước là "Lọc lead chung cư") |
| Chạy thật | https://loc-lead-chung-cu.vercel.app |
| Mã nguồn | https://github.com/AromAI-Lab/loc-lead-chung-cu (công khai) |
| Trên máy | `~/Downloads/loc-lead-chung-cu` |
| Kiểm thử | `npm test` → **ESLint + 161 phép**, phải xanh hết trước mỗi lần push |

**Địa chỉ web vẫn mang tên cũ `loc-lead-chung-cu` và KHÔNG được đổi** — mọi link UTM đã phát đi và link trong GitHub Skill đều trỏ về đó.

**Định vị đã chốt:** không bán "chỗ lưu hồ sơ" (Meey CRM cho không từ 2021), mà bán **"máy điền hồ sơ khách từ hội thoại Zalo — không phải gõ chữ nào"**. Khác biệt nằm ở chữ **TỰ ĐIỀN**, không nằm ở chữ "có hồ sơ".

**Phạm vi:** dùng cho sale bất động sản nói chung, nhưng bộ tiêu chí **hiện hiệu chuẩn cho căn hộ chung cư**. Dòng nói rõ chuyện này đã in trên đầu trang. Xem mục *Mở rộng phân khúc* ở cuối `README.md` — ước lượng 70% dùng lại được, phần phải viết riêng là T3 và một nửa bộ cờ Ảo.

**Cách giao code:** Claude sửa được tệp trực tiếp trong thư mục, nhưng **không push được** (thông tin đăng nhập GitHub nằm ở Terminal của chị Hương). Quy trình:
```
cd ~/Downloads/loc-lead-chung-cu && rm -f .git/index.lock && npm test && git add -A && git commit -m "..." && git push
```
`rm -f .git/index.lock` là bắt buộc — Claude hay làm kẹt tệp khoá đó và không xoá được.

---

## 2. ✅ ĐÃ XONG 17/09 — đầu vào hỗn hợp đã chấm đúng

**Vấn đề:** bộ từ khoá viết bằng tiếng Việt có dấu đầy đủ chữ, trong khi sale gõ lẫn lộn bốn kiểu — có dấu, không dấu, lẫn tiếng Anh, viết tắt. Đo 16/09: cùng một hội thoại, có dấu **NÓNG 9/12**, bỏ dấu **LẠNH 3/12**. Bản 16/09 mới chỉ cảnh báo, chưa chấm đúng.

**Đã làm:** thêm `public/lib/chuanhoa.js` — bỏ dấu, bảng viết tắt, và danh sách chữ cấm dùng ở dạng bỏ dấu. `criteria.js` và `profile.js` nay so khớp trên **cả hai dạng**: nguyên văn trên văn bản gốc, và bản bỏ dấu trên văn bản đã bỏ dấu. Một trong hai khớp là tính.

**Đo lại chính ca đó: 10/12 NÓNG ở cả hai bản — lệch 0 điểm.**

Kiểm thử: **161 phép** (trước 115), thêm `test/chuanhoa-tests.js` 34 phép. `test/khong-dau-tests.js` đã viết lại — các phép cũ đòi máy *thú nhận là chấm sai*, giữ lại thì khoá chặt cái sai vào chỗ cũ.

### Ba phát hiện ngày 17/09 — quan trọng hơn phần đã sửa

**1. `vậy` bỏ dấu ra đúng mặt chữ `vay`.** *"Giá bao nhiêu vậy em"* là câu hỏi phổ thông nhất của khách Việt. Để nguyên thì mọi hội thoại không dấu đều được không một điểm T1. Chính ca kiểm thử "khách thật mới tìm hiểu" bị đẩy từ LẠNH SÂU lên LẠNH vì lỗi này.

Bài học đắt hơn bản thân lỗi: **chặn ở lớp bỏ dấu là chặn hụt.** Khi sale gõ thẳng không dấu, văn bản GỐC đã là `vay` rồi, nên mẫu gốc khớp trước khi tới lượt lớp bỏ dấu. Những từ khoá vốn đã viết không dấu phải siết ngay trong `criteria.js`. Nay `vay` đứng trơ không còn được tính, phải đi kèm một chữ chỉ rõ nghĩa.

**2. `lãi sau` bỏ dấu ra `lai sau`, đụng `lại sau`** — *"để em nhắn lại sau"*. Nhánh này thuộc `VAY_SAU`, cho thẳng **3 điểm T1**. Đã loại khỏi dạng bỏ dấu; hỏi lãi sau ưu đãi thật vẫn bắt được qua nhánh `sau ưu đãi`.

**3. Năm chữ viết tắt trong bàn giao cũ KHÔNG được mở.** Bàn giao 16/09 liệt kê một bảng viết tắt gồm `ck`, `kh`, `dt`, `sh`, `nt`. Trong tin nhắn người Việt chúng có nghĩa khác phổ biến hơn:

| Viết tắt | Bảng cũ định mở thành | Nghĩa hay gặp hơn | Vì sao không mở |
|---|---|---|---|
| `ck` | chiết khấu | **chuyển khoản** | "chiết khấu" nằm trong cờ **A1** — cờ quyết định, một cờ đủ xếp ẢO. Mở sai là bảo sale vứt đi khách thật. Đây là cái giá đắt nhất sản phẩm có thể trả |
| `kh` | khách hàng | **không** ("kh có") | Đảo ngược nghĩa câu |
| `dt` | diện tích | **điện thoại** | Cộng điểm nhu cầu không có thật |
| `nt` | nội thất | **nhắn tin** | Như trên |
| `sh` | sổ hồng | **xe SH** | Như trên |

Mở: `pn` / `2BR` → phòng ngủ · `bg` → bàn giao · `ntt` → nội thất · `vc` → vợ chồng · `ls` → lãi suất. Có 4 phép kiểm thử khoá chiều ngược lại: ai thêm `ck`, `kh`, `dt`, `nt` vào bảng thì `npm test` đỏ ngay.

### Còn nợ ở phần này

- **Bộ kiểm thử phần C và D dựng từ hội thoại nghĩ ra**, không phải hội thoại thật (chị Hương xác nhận 17/09 là chưa có sẵn). Theo mục 6, xanh trên hội thoại nghĩ ra không chứng minh người viết nghĩ đúng. Có hội thoại thật kiểu hỗn hợp thì **phải thay**.
- **Nhánh `ck bao nhiêu` trong cờ A1 vẫn khớp ở dạng không dấu.** Khách thật hỏi "ck bao nhiêu" theo nghĩa chuyển khoản vẫn có thể bị gắn A1 → ẢO. Nhánh này có từ trước, không phải do bản này sinh ra, nên chưa tự ý bỏ. Cần hội thoại thật để quyết.
- **Mất một ít ở bản không dấu**, chấp nhận có chủ đích: *"sắp cưới nên cần nhà"* viết không dấu không còn tính là lý do mua, và *"anh vay đây"* trơ không cue thì mất. Đổi lại không nhận nhầm cả một lớp hội thoại.

---

## 3. Bốn lỗi đã sửa ngày 16/09 — đọc để không lặp lại

| # | Lỗi | Nguyên nhân gốc | Nay được khoá bởi |
|---|---|---|---|
| 1 | Khách nói "có tài chính 5 tỷ" mà máy báo "chưa rõ khả năng tài chính" | Danh sách `VON` thiếu hẳn hai chữ phổ biến nhất: "tài chính" và "ngân sách". Và thang điểm thưởng cho TỪ NGỮ thay vì THÔNG TIN — một con số cụ thể chỉ được 1 điểm rồi rơi vào ngưỡng "còn thiếu" | `test/taichinh-tests.js` |
| 2 | **Lời của SALE bị tính thành cờ Ảo của KHÁCH** | Cờ Ảo quét toàn hội thoại. Câu chào hàng bình thường ("để em gửi anh bảng hàng") làm khách dính cờ A1 — mà A1 là cờ quyết định nên một cờ đủ xếp ẢO. **Lead 9/12 NÓNG bị bảo vứt đi** | `test/loi-sale-tests.js` |
| 3 | Hội thoại không dấu chấm lệch 6 điểm, im lặng | Bộ từ khoá viết có dấu | `test/khong-dau-tests.js` |
| 4 | Ca "khách thật mới tìm hiểu" xanh **một cách tình cờ** | Nó được cứu bởi chính lỗi số 2: câu báo giá của sale bị đếm thành tín hiệu tiền của khách, vô tình tắt cờ A3. Sửa lỗi 2 thì chỗ chắn tình cờ mất | chặn có chủ đích bằng `MO_HO` |

**Lỗi số 2 là lỗi đắt nhất sản phẩm này có thể mắc** — không phải lệch vài điểm, mà ném đi đúng khách sắp mua. Bốn câu sale nói hằng ngày đều gây ra nó: *"để em gửi anh bảng hàng"*, *"bên em đang có chiết khấu 3%"*, *"em gửi khách bảng giá"*, *"quỹ căn tầng trung còn ít"*.

**Nguyên tắc rút ra:** cờ Ảo nói *người kia là ai*, nên chỉ được đọc từ những gì **người kia** nói. Không tách được lời khách thì vẫn quét toàn bộ, nhưng phải hạ độ tin cậy và cảnh báo cờ có thể bị gắn oan.

---

## 4. Cách kiểm thử — đã đổi, đọc kỹ

`npm test` giờ chạy **ESLint trước, rồi mới chạy 161 phép**. Lint đỏ là dừng.

**ESLint chỉ bật một luật có ý nghĩa: `no-undef`.** Lý do: ngày 16/09, khi sửa bố cục trang, hai dòng khai báo biến (`chanDungHienTai` và `NGUON_LEAD`) bị xoá nhầm cùng đoạn mã cũ. Hậu quả: khối *Chân dung khách* và nút *Lưu hồ sơ* biến mất khỏi trang, trong khi `npm test` vẫn báo 94 phép xanh.

Cố ý **không** bật luật về cách viết (dấu cách, chấm phẩy, độ dài dòng) — bật vào thì ra hàng trăm cảnh báo vô hại rồi ai cũng bỏ qua, và một công cụ bị bỏ qua thì không bảo vệ được gì.

**⚠️ Lỗ hổng còn nguyên: `public/app.js` không có một phép kiểm thử nào.** Các phép hiện có chỉ chạy phần lõi tính toán bằng Node — không có `document` nên không chạy được phần nối vào trang.

**Quy tắc bắt buộc:** sửa bất cứ thứ gì trong `app.js` thì `npm test` xanh **KHÔNG ĐỦ**. Phải mở trang thật, dán một đoạn chat thật, bấm hết luồng (chấm → chân dung → lưu → mở kho), và đọc lỗi trình duyệt. Bốn lỗi ngày 16/09 đều chỉ lộ ra theo cách đó.

---

## 5. Đo lường — PostHog

- Dự án: `loc-lead-chung-cu`, vùng **US Cloud**, project id 611781
- Khoá công khai phía trình duyệt nằm thẳng trong `public/index.html` (chuỗi `phc_...`). Đây là khoá **chỉ gửi vào được, không đọc ra được** — nằm trong repo công khai là đúng thiết kế, không phải lộ khoá.
- Đã kiểm chứng máy chủ nhận: HTTP 200, `{"status":"Ok"}`

**Cấu hình cố ý tắt bớt so với mặc định** — đây chính là lời hứa in ở khối *Dữ liệu của bạn đi đâu*, ai sửa thì phải sửa cả câu chữ:
`autocapture: false` · `capture_heatmaps: false` · `capture_dead_clicks: false` · `rageclick: false` · `disable_session_recording: true` · `mask_all_text: true` · `persistence: 'localStorage'` (không đặt cookie)

> Cạm bẫy: dòng `defaults: '2026-05-30'` của PostHog **tự bật** bản đồ nhiệt, rage-click và dead-click. Phải tắt tay từng cái. Đã bị dính một lần.

**Ba sự kiện:** `thu_ca_mau` · `bam_cham` · `luu_ho_so`.
Lọc bằng `tu_ca_mau = false` để đếm **người dùng thật** — người dán hội thoại của chính họ, không phải người bấm ca mẫu.
Bỏ `utm_source = kiem-thu` và sự kiện `kiem_thu_ky_thuat` khi đếm — đó là dữ liệu thử của Claude ngày 16/09.

**Lớp bọc `public/lib/dolen.js`** có bộ lọc trắng: chỉ 7 tên thuộc tính được phép gửi, chuỗi dài quá 40 ký tự bị chặn. 17 phép kiểm thử cố tình nhét hội thoại thật, tên khách, số điện thoại vào để xem có lọt không. **Một lời hứa không có mã chặn ở dưới thì chỉ là câu chữ.**

---

## 6. Vì sao 94 phép kiểm thử không thấy lỗi nào trong bốn lỗi

Các phép đó chạy trên **hội thoại mẫu do chính người viết mã nghĩ ra**. Hội thoại mẫu không có câu chào hàng của sale ở cuối. Một sale thật thì **luôn có**.

Kiểm thử xanh chứng minh mã chạy đúng như người viết nghĩ. **Nó không chứng minh người viết nghĩ đúng.**

→ Mọi bộ kiểm thử thêm từ nay phải dựng từ hội thoại thật của chị Hương.

---

## 7. Quyết định đã chốt — đừng bàn lại

- **Không nhúng thư viện Zalo không chính thức** (zca-js). Không đọc được lịch sử mà vẫn gánh rủi ro khoá tài khoản cho chính người trả tiền.
- **Không dùng popup hối thúc kiểu FOMO.** Khách là dân sale, họ nhận ra ngay. Sức ép đến từ kết quả chấm.
- **Không dồn nhắn nhiều lần với cùng một sale.** Tìm người mới tốt hơn.
- **Hồ sơ khách lưu trong trình duyệt người dùng**, không lên máy chủ.
- **Không nhắc thời hạn lưu 30 ngày trên giao diện** — gây lo ngược.
- **Không đổi địa chỉ web** dù đã đổi tên sản phẩm.
- **Hai thứ không bao giờ được gập vào phần chi tiết:** cờ Ảo (dù chỉ một cờ) và độ tin cậy thấp. Gọn là bớt thứ người ta không cần, không phải bớt thứ mình ngại nói.
- **Không nhúng biểu mẫu bên thứ ba vào trang** — trái lời hứa "ngoài PostHog ra không có gì khác". Dùng link mở tab mới.

---

## 8. Bố cục trang — đã đảo 16/09, hiểu lý do trước khi sửa

Thứ tự: **ô dán → KẾT QUẢ → chân dung khách → kiểm chứng dữ liệu đã che**.

Khối minh bạch *"Dữ liệu đã che đi tới đâu"* nằm **trên nút chấm**, tách khỏi khối kiểm chứng. Lý do: khối đó gánh hai việc khác nhau. **Lời hứa** phải đến TRƯỚC lúc người ta dán — nó là thứ khiến sale dám dán hội thoại khách vào trang lạ. **Bằng chứng** thì chỉ cần khi người ta nghi ngờ, và chỉ có nghĩa sau khi đã chấm.

Mặc định chỉ hiện ba khối: phân loại, *Việc làm ngay*, *một câu nên hỏi tiếp* (kèm nút Chép). Bảng 4 tiêu chí gập sau dòng *"Vì sao chấm vậy"*.

Rút từ ba câu gợi ý xuống **một** câu — của tiêu chí điểm thấp nhất. Người đang vội không đọc ba câu rồi chọn; họ đọc một câu rồi gõ luôn.

---

## 9. Phản hồi người dùng thật — nguồn của mọi thay đổi trên

**Sale #1 (15/09):** *"cái này em thấy ko trực quan lắm"*. Công ty bạn ấy dùng phần mềm "Happy IPLand", *"còn 1 số cái em đang cần update để tiện hơn"*. Đã mời chị Hương xuống công ty xem.

**Sale #2 (16/09), trả lời đủ 6 câu:**
- Có phù hợp? **Có** · Có tiện? **Có** · Có cần dùng? **Có** · Có hợp lý? **Có**
- Cái nào vô lý: *"k tài chính 5 tỷ mà câu lệnh còn thiếu — khách ghi có tài chính mà dữ liệu hiện ra báo còn thiếu"* → **lỗi số 1, đã sửa**
- Cái nào cần thêm: *"hệ thống đánh giá nhiều tiêu chí quá, dài dòng cần rút gọn hơn"* → **đã rút gọn giao diện**
- *"Cứ có nhu cầu, khách cần tìm mua hay bán là hệ thống ghi nhận thông tin có. Từ đó dùng bộ lọc và khai thác thêm."* → **CHƯA LÀM.** Đây là đề xuất đổi mô hình chấm: cổng chặn nhị phân trước, đào sâu sau. Việc lớn, làm sau Demo Day.
- Cũng xác nhận cần **chụp ảnh tải lên**.
- Góp ý thêm: nên chia câu hỏi khảo sát theo nhiều nhóm agent, vì tuỳ thâm niên mà nhu cầu khác nhau.

**Bộ 6 câu đó là tài sản.** Nó moi ra 2 lỗi và 1 hướng sản phẩm, trong khi hai sale khác chỉ nhận link trần thì im luôn. Câu mạnh nhất là **"cái nào vô lý"** — nó buộc người ta chê cụ thể. Bỏ câu đó thì form chỉ còn "Có/Có/Có".

---

## 10. Việc còn treo, theo thứ tự ưu tiên

*Cập nhật 17/09/2026 — việc số 1 cũ đã xong, xem mục 2.*

1. **Nhận ảnh chụp hội thoại.** Ghi chú thiết kế đầy đủ ở `docs/tinh-nang-anh.md`, gồm cả phần chị Hương đính chính: ảnh chụp Zalo **gần như không có số điện thoại trong thân chat** — chỉ có ở thanh trên cùng. Luật đã chốt: *"chỉ chụp phần nội dung trao đổi, không lấy thanh trên cùng"*. **Nay là việc ưu tiên cao nhất.**
2. **Thay bộ kiểm thử chuẩn hoá bằng hội thoại thật** — xem phần "Còn nợ" ở mục 2. Rẻ và xoá được một giả định lớn.
3. **Cổng chặn nhị phân theo đề xuất sale #2** (mục 9).
4. **Hiệu chuẩn ngưỡng 9/6/3** bằng 30 lead đã biết kết quả. Chưa làm — trang và skill đều đang ghi rõ là chưa hiệu chuẩn xong.
5. **Mở rộng phân khúc** — ô chọn phân khúc, mỗi phân khúc một bộ T3 và cờ Ảo riêng. Xem README.
6. **Kiểm thử cho `public/app.js`** — lỗ hổng ở mục 4.
7. Xuống công ty sale #1 xem "Happy IPLand" (đã được mời).
8. Tên miền `huongai.com` — mua rồi, chưa trỏ được, đang 401.

---

## 11. Tệp cần đọc

| Tệp | Nội dung |
|---|---|
| `docs/bai-nop-buoi-7.md` | Bài nộp Campus Buổi 7, chỗ 【 】 là điền số thật |
| `docs/buoi7-phan-phoi.md` | 5 link UTM, 2 bài Facebook, tin nhắn Zalo, hoạt động email |
| `docs/tinh-nang-anh.md` | Ghi chú thiết kế tính năng ảnh |
| `docs/scoring-criteria.md` | Bộ tiêu chí đầy đủ — GitHub Skill đọc tệp này qua web. Mục 7 là phần đầu vào hỗn hợp |
| `public/lib/chuanhoa.js` | Lớp chuẩn hoá: bỏ dấu, viết tắt, danh sách chữ cấm — đọc phần chú thích trước khi thêm từ khoá |
| `README.md` | Có mục *Mở rộng phân khúc* ở cuối |

**GitHub Skill công khai:** https://github.com/AromAI-Lab/b2o-research-skills/tree/main/skills/cham-lead-bds
Mã nguồn skill ở `~/Downloads/b2o-research-skills`. Skill đọc `docs/scoring-criteria.md` từ trang sản phẩm để lấy bản mới nhất — **đổi đường dẫn tệp đó là làm hỏng skill.**

---

## 12. Cách làm việc với chị Mai Hương

- Tiếng Việt. Có cấu trúc, nêu rõ **dữ kiện / giả định / suy luận**.
- Nêu rủi ro **kèm giải pháp đã nghiên cứu**, không chỉ liệt kê vấn đề.
- Tối đa 2 câu hỏi làm rõ trước khi bắt tay.
- **Việc kỹ thuật: hướng dẫn từng bước, giải thích trước khi chị gõ.** Không tự làm một mạch rồi bàn giao.
- Chị chốt bài trước 18h dù hạn Campus là 20h.
- **Không tâng bốc. Sai thì nhận và nói rõ sai chỗ nào.**
- **Chị biết nghề bất động sản, Claude thì không.** Ngày 16/09 Claude đã dựng cả một lý lẽ về quyền riêng tư của ảnh chụp trên một giả định sai, và chị đính chính. Gặp câu hỏi về hành vi sale hay hành vi khách thì **hỏi chị, đừng suy**.
