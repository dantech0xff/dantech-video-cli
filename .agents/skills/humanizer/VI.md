# Humanizer cho lời đọc tiếng Việt (Dan Tech)

`SKILL.md` viết cho văn bản tiếng Anh. Ở repo này, áp dụng **nguyên tắc** của nó cho `say` (lời voiceover tiếng Việt, đọc bằng Gemini TTS), không áp dụng máy móc các quy tắc về định dạng.

## Cắt bỏ (dấu hiệu "mùi AI")
- Sáo rỗng, mở bài dàn dựng: "trong thời đại số", "trong kỷ nguyên AI", "hãy cùng tìm hiểu", "bạn có biết", "không thể phủ nhận", "điều này cho thấy", "có thể nói".
- Đối lập giả: "không chỉ… mà còn…", "không phải X, mà là Y" khi không có ý đối lập thật.
- Bộ ba ép buộc ("nhanh, mạnh, hiệu quả") khi thực tế chỉ có 1–2 ý.
- Thổi phồng, giọng bán hàng: "cực kỳ", "siêu", "đỉnh cao", "thay đổi cuộc chơi", "cách mạng" khi nguồn không nói vậy.
- Câu chốt lặp lại ý ("Và đó chính là điều quan trọng nhất."), filler ("thực ra thì", "về cơ bản", "nói chung là").

## Giữ / hướng tới
- Văn nói, giọng YouTuber tự nhiên: câu ngắn (≤ 15–18 chữ), một ý một câu, xưng "anh em"/"mình" như các video mẫu.
- Chi tiết cụ thể thay cho tính từ: con số, tên, hành động.
- Hook cụ thể ở câu đầu, không mở bằng câu dàn dựng.

## Không cắt từ nối
Không xoá từ nối và câu dẫn có chức năng giải thích: "vì vậy", "lúc này", "nói cách khác", "thử tưởng tượng", "tức là", "nghĩa là", "trước khi", "thay vì". Những từ này không phải filler: chúng giúp người nghe theo được mạch (đặc biệt ở video giải thích code). Văn kiểu ghi chú, liệt kê từ khoá ("tạo khi nào, ra sao, framework") cũng là dấu hiệu AI/thiếu tự nhiên: viết lại thành câu nói đầy đủ.

## Bài học = nguồn, không phải dàn ý
Humanize xong vẫn phải cắt: câu nào bỏ đi mà người xem vẫn hiểu thì bỏ; không kể lại mọi ví dụ/phương án trong bài; hook tối đa 2 câu. Cắt **ý**, không cắt từ nối (ngắn gọn ≠ điện tín). Xem write-script.

## Hook trực diện
Không humanize câu đầu thành lời dẫn vòng. Câu đầu cảnh 1 phải gọi tên chủ đề (vd "Vì sao app Flutter cần MVVM?"), ≤ ~12 từ. Xem write-script.

## Độ dài
Không humanize để rút ngắn video, và không viết lại sau khi đã có giọng chỉ vì độ dài. Độ dài theo nội dung; chỉ bỏ câu thừa, lặp hoặc lạc đề.

## Không được đổi
- Sự kiện, con số, tên riêng, trích dẫn, `sources`.
- Câu kết có **"follow Dan Tech"**.
- **Anchor `@chữ`**: nếu sửa/xoá một chữ đang được anchor dùng (trong `props` hoặc `sfx` của cảnh đó), cập nhật anchor sang chữ mới (kể cả `#n` nếu số lần xuất hiện thay đổi). Sau khi sửa luôn chạy `python3 scripts/validate_script.py <script>`.
