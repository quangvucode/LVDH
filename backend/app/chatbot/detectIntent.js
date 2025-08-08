function detectIntent(message) {
  const raw = message;
  const msg = message
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  // ====== Intent: Chào hỏi ======
  if (
    msg.match(/^(hi|hello|xin chào|chào|yo|alo|hey|bạn có thể giúp gì|bạn là ai|chức năng của bạn)/)
  ) {
    console.log(`[DetectIntent] "${raw}" → intent: greeting`);
    return { intent: "greeting" };
  }

  // ====== Intent: Danh sách phòng còn trống (today/tomorrow) ======
  if (
    /(phòng nào|loại phòng nào|phòng gì|phòng gi|hôm nay.*phòng nào|còn phòng nào|phòng nào còn|phòng nào trống|hôm nay còn phòng nào|hôm nay còn trống phòng nào)/.test(msg)
  ) {
    let date = null;
    if (msg.includes("hôm nay") || msg.includes("nay")) date = new Date();
    else if (msg.includes("ngày mai") || msg.includes("mai")) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      date = d;
    }
    console.log(`[DetectIntent] "${raw}" → intent: available_rooms_on_date | date: ${date?.toISOString().slice(0, 10) || "null"}`);
    return {
      intent: "available_rooms_on_date",
      entities: { date },
    };
  }

  // ====== Intent: Hỏi phòng cụ thể còn slot nào? ======
  if (
    /(phòng|loại phòng).*(còn|trống|slot|có không|hết chưa|khả dụng)/.test(msg)
  ) {
    let date = null;
    if (msg.includes("hôm nay") || msg.includes("nay")) date = new Date();
    else if (msg.includes("ngày mai") || msg.includes("mai")) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      date = d;
    }
    // Bắt tên phòng
    const roomNameMatch = raw.match(/ph[oóòõọơô]ng\s+([a-zA-Z0-9\-]+)/i);
    const roomName = roomNameMatch &&
      !/n[aàáảãạăâ]|g[iìíỉĩị]/i.test(roomNameMatch[1])
      ? roomNameMatch[1].toUpperCase()
      : null;
    if (roomName) {
      console.log(`[DetectIntent] "${raw}" → intent: check_available_slot | room: ${roomName} | date: ${date?.toISOString().slice(0, 10) || "null"}`);
      return {
        intent: "check_available_slot",
        entities: { roomName, date },
      };
    }
  }

  // ====== Intent: Hỏi slot cụ thể còn không ======
  if (
    /(slot|khung giờ|giờ).*(còn|trống|có không|hết chưa|khả dụng)/.test(msg)
  ) {
    // Entity slot (extract bằng regex nếu đủ mạnh)
    const slotMatch = msg.match(/(0?\d{1,2}[:h]\d{0,2})\s*(\-|đến|->|–)\s*(0?\d{1,2}[:h]\d{0,2})/);
    const slot = slotMatch ? slotMatch[0] : null;
    // Extract ngày
    let date = null;
    if (msg.includes("hôm nay") || msg.includes("nay")) date = new Date();
    else if (msg.includes("ngày mai") || msg.includes("mai")) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      date = d;
    }
    console.log(`[DetectIntent] "${raw}" → intent: check_specific_slot | slot: ${slot || "null"} | date: ${date?.toISOString().slice(0, 10) || "null"}`);
    return {
      intent: "check_specific_slot",
      entities: { slot, date },
    };
  }

  // ====== Intent: Hỏi các slot có thể đặt, slot kéo dài bao lâu ======
  if (
    /(các khung giờ|slot|giờ đặt|các giờ đặt|mỗi slot kéo dài|slot kéo dài|đặt liên tục|liên tiếp|liền kề|có thể đặt slot linh hoạt)/.test(msg)
  ) {
    return { intent: "ask_slot_info" };
  }

  // ====== Intent: Đặt nhiều slot liên tiếp ======
  if (
    /(2|hai|nhiều).*(slot|khung giờ|giờ).*(liên tiếp|liền kề|liên tục)/.test(msg)
  ) {
    return { intent: "ask_slot_consecutive" };
  }

  // ====== Intent: Hỏi chi tiết phòng ======
  if (
    /(phòng|loại phòng).*(có gì|bao gồm|chi tiết|thông tin|mô tả|ra sao|thế nào)/.test(msg) ||
    /^ph[oóòõọơô]ng\s+([a-zA-Z0-9\-]+)(\s+(có gì|ra sao|thế nào))?$/.test(msg)
  ) {
    const roomNameMatch = raw.match(/ph[oóòõọơô]ng\s+([a-zA-Z0-9\-]+)/i);
    const roomName = roomNameMatch ? roomNameMatch[1].toUpperCase() : null;
    console.log(`[DetectIntent] "${raw}" → intent: ask_room_detail | room: ${roomName}`);
    return {
      intent: "ask_room_detail",
      entities: { roomName },
    };
  }

  // ====== Intent: Hỏi về tiện ích đặc biệt (máy chiếu, bồn tắm, ...) ======
  if (
    /(phòng nào|loại phòng nào|có phòng nào).*(máy chiếu|máy lạnh|ban công|bồn tắm|netflix|chỗ đậu xe|parking)/.test(msg)
  ) {
    const amenityMatch = msg.match(/(máy chiếu|máy lạnh|ban công|bồn tắm|netflix|chỗ đậu xe|parking)/);
    const amenity = amenityMatch ? amenityMatch[1] : null;
    console.log(`[DetectIntent] "${raw}" → intent: ask_room_with_amenity | amenity: ${amenity}`);
    return {
      intent: "ask_room_with_amenity",
      entities: { amenity },
    };
  }

  // ====== Intent: Hỏi giá phòng ======
  if (
    /(giá|bao nhiêu|giá phòng|giá tiền).*(phòng)?/.test(msg) ||
    msg.includes("phòng này bao nhiêu")
  ) {
    const roomNameMatch = raw.match(/ph[oóòõọơô]ng\s+([a-zA-Z0-9\-]+)/i);
    const roomName = roomNameMatch ? roomNameMatch[1].toUpperCase() : null;
    console.log(`[DetectIntent] "${raw}" → intent: ask_room_price | room: ${roomName}`);
    return {
      intent: "ask_room_price",
      entities: { roomName },
    };
  }

  // ====== Intent: Đặt phòng (booking request) ======
  if (
    /(đặt|muốn đặt|book|cần đặt).*(phòng|room)/.test(msg)
  ) {
    const roomNameMatch = raw.match(/ph[oóòõọơô]ng\s+([a-zA-Z0-9\-]+)/i);
    const roomName = roomNameMatch ? roomNameMatch[1].toUpperCase() : null;
    let date = null;
    if (msg.includes("hôm nay") || msg.includes("nay")) date = new Date();
    else if (msg.includes("ngày mai") || msg.includes("mai")) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      date = d;
    }
    return {
      intent: "booking_request",
      entities: { roomName, date },
    };
  }

  // ====== Intent: Hỏi về đặt phòng ("làm sao để đặt phòng", "hướng dẫn đặt phòng") ======
  if (
    /(làm sao|hướng dẫn|cách).*(đặt phòng|đặt chỗ|book phòng)/.test(msg)
  ) {
    return { intent: "ask_booking_howto" };
  }

  // ====== Intent: Đặt slot liên tiếp ======
  if (
    /(đặt|book).*(2|hai|liên tiếp|liền kề).*(slot|khung giờ|giờ)/.test(msg)
  ) {
    return { intent: "ask_booking_multiple_slots" };
  }

  // ====== Intent: Có cần thanh toán trước không ======
  if (
    /(có cần|phải|bắt buộc).*(thanh toán trước|trả trước)/.test(msg)
  ) {
    return { intent: "ask_payment_required" };
  }

  // ====== Intent: Hủy đơn ======
  if (
    /(hủy|cancel).*(đơn|đặt phòng|booking)/.test(msg) ||
    /(gửi|yêu cầu).*?(hủy|hủy đơn)/.test(msg)
  ) {
    return { intent: "cancel_booking" };
  }

  // ====== Intent: Tra cứu đơn ======
  if (
    /(tra|tìm|xem).*(mã đơn|đặt phòng|đơn hàng|đơn)/.test(msg)
  ) {
    return { intent: "lookup_booking" };
  }

  // ====== Intent: Địa chỉ, chỗ đậu xe ======
  if (
    /(địa chỉ|chỗ đậu xe|parking|có chỗ gửi xe|bãi đậu xe)/.test(msg)
  ) {
    return { intent: "ask_hotel_info" };
  }

  // ====== Không xác định intent ======
  console.log(`[DetectIntent] "${raw}" → intent: unknown`);
  return { intent: "unknown" };
}

module.exports = detectIntent;
