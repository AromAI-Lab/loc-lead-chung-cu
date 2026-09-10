# Bộ tiêu chí chấm điểm lead căn hộ chung cư — v1.0

*Dự án: tool lọc lead cho sale căn hộ chung cư · AromAI Lab · 10/09/2026*
*Nền: skill `bds-lead-qualifier` (AromAI-Lab). Bản này chuyên biệt hoá cho chung cư Việt Nam và tách riêng cơ chế phát hiện lead Ảo.*

---

## 0. Vì sao phải tách 2 trục

**Dữ kiện:** các tool chấm lead sẵn có trên thị trường (Roof AI và tương tự) đã có thang điểm Hot/Warm/Cold. Nếu ta cũng chỉ chấm một thang rồi cắt ngưỡng thì trùng phần lớn với họ — phương án đó đã bị loại ở bước kiểm tra khác biệt.

**Suy luận:** "Ảo" **không phải** là "điểm thấp". Hai thứ này khác nhau về bản chất:

- Một khách **thật** mới bắt đầu tìm hiểu sẽ chấm điểm thấp, nhưng vẫn đáng nuôi 3–6 tháng.
- Một **môi giới đối thủ** giả làm khách có thể trả lời trơn tru và chấm điểm **cao**.

Gộp hai thứ vào một thang điểm là sai. Gộp xong thì tool sẽ ném đi lead thật và giữ lại lead ảo — đúng ngược với việc nó phải làm.

**Kết luận thiết kế: chấm trên 2 trục độc lập.**

| Trục | Trả lời câu hỏi | Thang |
|---|---|---|
| **Trục 1 — Tiềm năng** | Người này *nếu là khách thật* thì gần chốt đến đâu? | 0–12 điểm |
| **Trục 2 — Cờ Ảo** | Người này có thật sự là người mua không? | Đếm cờ |

Đây là phần khó sao chép nhất: **nền tảng bán lead không có động cơ tự nhận lead mình bán là ảo**, nên họ sẽ không làm trục 2.

---

## 1. Tách lời khách khỏi lời sale — làm trước khi chấm

Nguồn sai số lớn nhất của cách chấm theo khối văn bản: chính lời chào hàng của sale ("dạ căn này 3,2 tỷ, sổ hồng lâu dài, bàn giao full nội thất") bị đếm thành tín hiệu của khách, làm điểm phồng lên.

Tool nhận diện tiền tố đầu dòng `K:` / `Khách:` cho khách và `S:` / `Sale:` cho sale. Tách được thì **trục 1 chỉ chấm trên lời khách**; cờ Ảo vẫn quét toàn hội thoại. Không tách được thì tool hạ độ tin cậy xuống "thấp" và nói rõ lý do thay vì im lặng chấm sai.

---

## 2. TRỤC 1 — bốn tiêu chí, mỗi tiêu chí 0–3 điểm

### T1. Tài chính — có tiền và có đường ra tiền không?

Khác đất nền, chung cư gần như luôn đi kèm vay. Khách "biến mất giữa chừng" hầu hết là khách chưa kiểm tra được khả năng vay của mình.

**Câu hỏi vàng để lọc:** *"sau ưu đãi thì lãi thả nổi lên bao nhiêu?"* — người hỏi câu này đã tính tới khoản trả góp năm thứ ba, tức là đã tính chuyện mua thật. Người chỉ hỏi "trả góp mỗi tháng bao nhiêu" thường mới nhìn con số đẹp của năm đầu.

| Điểm | Tín hiệu trong lời khách |
|---|---|
| **3** | Nêu con số vốn tự có **và** nhắc tới lãi sau ưu đãi / thả nổi / đã thẩm định vay |
| **2** | Nêu được con số vốn tự có hoặc tỷ lệ vay dự kiến |
| **1** | Có nhắc vay hoặc tiền nhưng không con số |
| **0** | Không đả động gì tới tiền |

> ⚠️ **Cần hiệu chuẩn:** con số lãi suất cụ thể (ưu đãi năm đầu và thả nổi sau đó) phải xác nhận lại theo thời điểm trước khi đưa vào lời tư vấn cho khách. Tool chỉ nhận diện *việc khách có nhắc tới lãi thả nổi hay không*, không khẳng định mức lãi.

### T2. Quyền quyết định — ai chọn, ai chi tiền?

Ở Việt Nam người ưng căn và người duyệt ngân sách thường không phải một. Với chung cư, cặp vợ chồng trẻ mua căn đầu tiên có bố mẹ hỗ trợ là mẫu điển hình. Hỏi gộp hai vai dẫn tới mời sai người đi xem nhà và mất buổi chốt.

| Điểm | Tín hiệu |
|---|---|
| **3** | Tự quyết được, hoặc đã thống nhất trong nhà |
| **2** | Nêu được người cùng quyết nhưng chưa thống nhất ("để anh hỏi lại vợ") |
| **1** | Không rõ ai quyết |
| **0** | Hỏi hộ người khác, không nắm nhu cầu thật |

### T3. Nhu cầu thực — độ cụ thể của câu hỏi

Chỉ báo mạnh nhất và rẻ nhất để đo. Người sắp mua hỏi về thứ họ sẽ phải sống cùng; người tham khảo hỏi thứ ai cũng hỏi.

| Câu hỏi của khách thật | Câu hỏi của người tham khảo |
|---|---|
| "Giá này là thông thuỷ hay tim tường?" | "Giá bao nhiêu?" |
| "Phí quản lý bao nhiêu một mét vuông?" | "Có rẻ không?" |
| "Bàn giao thô hay full nội thất?" | "Còn căn nào không?" |
| "Chỗ để ô tô có cố định không?" | "Gửi em bảng giá" |
| "Sổ hồng lâu dài hay 50 năm?" | *(không hỏi gì)* |

| Điểm | Tín hiệu |
|---|---|
| **3** | Hỏi từ 2 chi tiết cụ thể trở lên **và** nêu lý do mua (sinh con, chuyển việc, hết hợp đồng thuê, con vào lớp 1) |
| **2** | Có chi tiết cụ thể nhưng thiếu một trong hai vế |
| **1** | Mới một tín hiệu |
| **0** | Chỉ hỏi chung chung |

### T4. Thời điểm và mức độ đã đi xem

Khách chung cư gần như luôn so sánh 2–4 dự án cùng phân khúc trước khi chốt. Người **chưa xem dự án nào** đang ở đầu phễu. Người **đã xem 2–3 dự án** sắp chốt, và việc biết họ đã xem gì cho sale biết phải đánh vào đâu.

| Điểm | Tín hiệu |
|---|---|
| **3** | Đã xem dự án khác **và** có mốc thời gian cụ thể |
| **2** | Một trong hai |
| **1** | Chưa có gì rõ ràng |
| **0** | Nói thẳng chưa định mua trong 6–12 tháng tới |

---

## 3. TRỤC 2 — cờ Ảo

Hai loại cờ, xử lý khác nhau:

**Cờ quyết định** — nói lên người này *là ai*, một cờ là đủ kết luận Ảo:

| Mã | Cờ | Cách nhận ra |
|---|---|---|
| **A1** | Môi giới đối thủ dò giá | Hỏi chiết khấu, hoa hồng, bảng hàng, rổ hàng, "gửi khách sang", phí môi giới — nhưng xưng là khách mua |
| **A7** | Lừa đảo hoặc spam | Gửi link lạ, xin giấy tờ, mời chào ngược, "việc nhẹ lương cao", "nạp tiền sinh lời" |

**Cờ tình huống** — cần từ 2 cờ để kết luận Ảo; 1 cờ chỉ hạ 1 bậc:

| Mã | Cờ | Nguồn |
|---|---|---|
| **A2** | Ngân sách lệch quá 40% so với giá căn mà không nhắc vay | Tính từ 2 ô nhập |
| **A3** | Chỉ hỏi giá lặp lại, không lộ bất kỳ tín hiệu nào khác | Hội thoại |
| **A4** | Im quá 48h sau khi nhận báo giá | Sale tự đánh dấu |
| **A5** | Không nghe máy từ 3 lần | Sale tự đánh dấu |
| **A6** | Tài khoản Zalo/FB đáng ngờ | Sale tự đánh dấu |

**A1 là cờ giá trị nhất.** Đây là loại lead ảo tốn thời gian nhất của sale và không tool nào trên thị trường bắt.

**A3 được siết chặt có chủ ý:** chỉ bật khi khách hỏi giá lặp lại mà tuyệt nhiên không để lộ tín hiệu nào khác. Nếu có nhắc tiền, lý do mua, hay người cùng quyết thì đó là khách thật còn sớm — bật cờ ở đây là oan cho họ.

---

## 4. Quy tắc phân loại

```
BƯỚC 1 — Cờ quyết định (A1, A7) có không?
           Có  → ẢO, dừng.
BƯỚC 2 — Đếm cờ tình huống.
           ≥ 2 → ẢO, dừng.
BƯỚC 3 — Cộng điểm trục 1, cắt ngưỡng:
           9–12 → NÓNG      6–8 → ẤM
           3–5  → LẠNH      0–2 → LẠNH SÂU
BƯỚC 4 — Có đúng 1 cờ tình huống → hạ 1 bậc.
```

**Vì sao có "Lạnh sâu" thay vì gộp vào Ảo:** khách thật nhưng còn quá sớm không đáng gọi hôm nay, nhưng đáng nuôi 3–6 tháng. Gộp họ vào Ảo là ném đi lead thật.

---

## 5. Hành động tiếp theo

Bắt buộc phải có. Không có phần này thì tool chỉ là cái nhãn dán.

| Loại | % thời gian trong ngày | Việc làm ngay |
|---|---|---|
| **NÓNG** | 60% | Gọi trong 1 giờ. Chốt lịch xem nhà **có ngày giờ cụ thể**, không hỏi "khi nào anh rảnh". Mời cả người cùng quyết đi cùng. |
| **ẤM** | 30% | Nhắn trong 24h, gửi đúng thứ họ đã hỏi. Đặt 1 câu hỏi lấp ô điểm còn thiếu. |
| **LẠNH** | 10% | Chuỗi nuôi Zalo, chạm 2 tuần/lần bằng nội dung hữu ích. Không gọi dồn. |
| **LẠNH SÂU** | 0% chủ động | Nuôi tự động 3–6 tháng, đặt lịch nhắc quay lại. **Đừng xoá.** |
| **ẢO** | 0% | Dừng. Nếu là A1: trả lời khoảng giá, không gửi bảng hàng chi tiết. |

---

## 6. Tool này **chưa** làm được gì — nói thẳng

| Hạn chế | Ảnh hưởng | Hướng xử lý |
|---|---|---|
| Ngưỡng 9/6/3 là **suy luận**, chưa hiệu chuẩn bằng dữ liệu thật | Có thể lệch với thực tế | Chấm thử 30 lead đã biết kết quả sau khi phỏng vấn 5 sale |
| Cờ A4, A5, A6 phải sale tự tick | Thêm thao tác | Bản sau: đọc từ lịch sử cuộc gọi |
| Chưa phân biệt phân khúc | Khách 2 tỷ và khách 15 tỷ hỏi khác nhau | Bản sau: chọn phân khúc trước khi chấm |
| Không tách được lời khách nếu hội thoại không có tiền tố | Điểm phồng lên | Tool tự hạ độ tin cậy và nói rõ, không im lặng chấm sai |
| Hội thoại dưới 25 từ | Không đủ căn cứ | Tool **từ chối chấm** và trả về 3 câu hỏi nên hỏi trước |

Hạng mục cuối là quan trọng nhất về mặt sản phẩm: **thà tool nói "chưa đủ dữ liệu" còn hơn chấm bừa.** Chấm bừa ba lần là sale bỏ tool.
