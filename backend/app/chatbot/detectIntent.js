function detectIntent(message) {
  const raw = message;
  const msg = message
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  function extractDate(msg) {
    const setSafeDate = (day, month, year) => {
      const d = new Date();
      d.setFullYear(year, month - 1, day);
      d.setHours(7, 0, 0, 0);
      return d;
    };

    // "ngày X tháng Y (năm Z)"
    const verbose = msg.match(/ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})(?:\s+năm\s+(\d{4}))?/i);
    if (verbose) {
      const [_, day, month, year] = verbose;
      const y = year || new Date().getFullYear();
      return setSafeDate(+day, +month, +y);
    }

    // dd/mm
    const partialDate = msg.match(/ngày\s+(\d{1,2})[\/\-\.](\d{1,2})/);
    if (partialDate) {
      const [_, day, month] = partialDate;
      const year = new Date().getFullYear();
      return setSafeDate(+day, +month, year);
    }

    // dd/mm/yyyy
    const compact = msg.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (compact) {
      const [_, day, month, year] = compact;
      return setSafeDate(+day, +month, +year);
    }

    // nay, mai
    if (msg.includes("hôm nay") || msg.includes("nay")) {
      const t = new Date();
      t.setHours(7, 0, 0, 0);
      return t;
    }
    if (msg.includes("ngày mai") || msg.includes("mai")) {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(7, 0, 0, 0);
      return t;
    }

    return null;
  }

  function extractEntities(msg, raw) {
    const entities = {};

    // Ngày
    entities.date = extractDate(msg);

    // Tên phòng
    const roomNameMatch = raw.match(/ph[oóòõọơô]ng\s+([a-zA-Z0-9\-]+)/i);
    entities.roomName =
      roomNameMatch &&
      !/n[aàáảãạăâ]|g[iìíỉĩị]/i.test(roomNameMatch[1])
        ? roomNameMatch[1].toUpperCase()
        : null;

    // Slot
    const slotMatch = msg.match(/(0?\d{1,2}[:h]\d{0,2})\s*(\-|đến|->|–)\s*(0?\d{1,2}[:h]\d{0,2})/);
    entities.slot = slotMatch ? slotMatch[0] : null;

    // Tiện ích
    const amenityMatch = msg.match(/(máy chiếu|máy lạnh|ban công|bồn tắm|netflix|máy nước nóng|bàn bida)/);
    entities.amenity = amenityMatch ? amenityMatch[1] : null;
    
    // Tra cứu
    const bookingCodeMatch = msg.match(/\b[A-Z0-9]{6,10}\b/i); // Ví dụ: BK123456
    entities.bookingCode = bookingCodeMatch ? bookingCodeMatch[0].toUpperCase() : null;

    // Số điện thoại
    const phoneMatch = msg.match(/0\d{9}/);
    entities.phone = phoneMatch ? phoneMatch[0] : null;

    return entities;
  }

  const entities = extractEntities(msg, raw);

  // Chào
  if (
    msg.match(/^(hi|hello|xin chào|chào|yo|alo|hey|bạn có thể giúp gì|bạn là ai|chức năng của bạn)/)
  ) {
    console.log(`[DetectIntent] "${raw}" → intent: greeting`);
    return { intent: "greeting" };
  }

  // phòng nào trống nay/mai
  if (
    /(phòng nào|loại phòng nào|phòng gì|phòng gi|hôm nay.*phòng nào|còn phòng nào|phòng nào còn|phòng nào trống|hôm nay còn phòng nào|hôm nay còn trống phòng nào)/.test(msg)
  ) {
    console.log(`[DetectIntent] "${raw}" → intent: available_rooms_on_date | date: ${entities.date?.toISOString().slice(0, 10) || "null"}`);
    return {
      intent: "available_rooms_on_date",
      entities: { date: entities.date }
    };
  }

  // phòng () còn giờ nào nay/mai
  if (
    /(phòng|loại phòng).*(còn|trống|slot|có không|hết chưa|khả dụng)/.test(msg) &&
    entities.roomName
  ) {
    console.log(`[DetectIntent] "${raw}" → intent: check_available_slot | room: ${entities.roomName} | date: ${entities.date?.toISOString().slice(0, 10) || "null"}`);
    return {
      intent: "check_available_slot",
      entities: { roomName: entities.roomName, date: entities.date }
    };
  }

  // khung giờ còn
  if (
    /(slot|khung giờ|giờ).*(còn|trống|có không|hết chưa|khả dụng)/.test(msg)
  ) {
    console.log(`[DetectIntent] "${raw}" → intent: check_specific_slot | slot: ${entities.slot || "null"} | date: ${entities.date?.toISOString().slice(0, 10) || "null"}`);
    return {
      intent: "check_specific_slot",
      entities: { slot: entities.slot, date: entities.date }
    };
  }

  // slot có thể đặt
  if (
    /(các khung giờ|slot|giờ đặt|các giờ đặt|mỗi slot kéo dài|slot kéo dài|đặt liên tục|liên tiếp|liền kề|có thể đặt slot linh hoạt)/.test(msg)
  ) {
    return { intent: "ask_slot_info" };
  }

  // Intent: Đặt nhiều slot liên tiếp
  if (
    /(2|hai|nhiều).*(slot|khung giờ|giờ).*(liên tiếp|liền kề|liên tục)/.test(msg)
  ) {
    return { intent: "ask_slot_consecutive" };
  }

  // Intent: Hỏi chi tiết phòng
  if (
    /(phòng|loại phòng).*(có gì|bao gồm|chi tiết|thông tin|mô tả|ra sao|thế nào)/.test(msg) ||
    /^ph[oóòõọơô]ng\s+([a-zA-Z0-9\-]+)(\s+(có gì|ra sao|thế nào))?$/.test(msg)
  ) {
    console.log(`[DetectIntent] "${raw}" → intent: ask_room_detail | room: ${entities.roomName}`);
    return {
      intent: "ask_room_detail",
      entities: { roomName: entities.roomName }
    };
  }

  // Intent: Hỏi giá phòng
  if (
    /(giá|bao nhiêu|giá phòng|giá tiền).*(phòng)?/.test(msg) ||
    msg.includes("phòng này bao nhiêu")
  ) {
    console.log(`[DetectIntent] "${raw}" → intent: ask_room_price | room: ${entities.roomName}`);
    return {
      intent: "ask_room_price",
      entities: { roomName: entities.roomName }
    };
  }

  // Intent: Đặt phòng
  if (/(đặt|muốn đặt|book|cần đặt).*(phòng|room)/i.test(msg)) {
  let rn = entities.roomName?.trim();

  // bỏ qua kí tự rác
  if (!rn || rn.length < 3) {
    rn = null;
  }

  return {
    intent: "booking_request",
    entities: { roomName: rn, date: entities.date }
  };
}


  // Intent: Hỏi cách đặt phòng
  if (
    /(làm sao|hướng dẫn|cách).*(đặt phòng|đặt chỗ|book phòng)/.test(msg)
  ) {
    return { intent: "ask_booking_howto" };
  }

  // Intent: Đặt slot liên tiếp
  if (
    /(đặt|book).*(2|hai|liên tiếp|liền kề).*(slot|khung giờ|giờ)/.test(msg)
  ) {
    return { intent: "ask_booking_multiple_slots" };
  }

  // Intent: Có cần thanh toán trước không
  if (
    /(có cần|phải|bắt buộc).*(thanh toán trước|trả trước)/.test(msg)
  ) {
    return { intent: "ask_payment_required" };
  }

  // Intent: Hủy đơn
  if (
    /(hủy|cancel).*(đơn|đặt phòng|booking)/.test(msg) ||
    /(gửi|yêu cầu).*?(hủy|hủy đơn)/.test(msg)
  ) {
    return { intent: "cancel_booking" };
  }

  // Intent: Tra cứu đơn
  if (entities.phone && entities.date) {
    return { intent: "lookup_booking", 
      entities: { phone: entities.phone, date: entities.date } };
}

  if (
    /(tra|tìm|xem).*(mã đơn|đặt phòng|đơn hàng|đơn)/.test(msg)
  ) {
    return { intent: "lookup_booking",
      entities: {
      phone: entities.phone,
      date: entities.date}};
  }

  // Intent: Liên hệ
  if (/((liên hệ|liên lạc|hotline|gọi).*(khách sạn)?)|((địa chỉ|tọa lạc|nằm ở đâu|vị trí).*(khách sạn)?)/i.test(msg)) {
    return { intent: "ask_contact_info", entities: {} };
  }

  // Không xác định intent
  console.log(`[DetectIntent] "${raw}" → intent: unknown`);
  return { intent: "unknown" };
}

module.exports = detectIntent;
