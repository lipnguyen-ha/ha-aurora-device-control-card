/*
 * Aurora Device Control Card - card Lovelace dieu khien thiet bi theo mot kieu thong nhat.
 *
 * File nay dang ky hai card:
 *   custom:aurora-ir-remote-card      thiet bi hong ngoai (mot chieu, phat qua bo phat IR)
 *   custom:aurora-smart-device-card   thiet bi thong minh (hai chieu, dieu khien theo entity)
 * Card cu custom:aurora-device-control-card nhan ca hai nhom va van chay.
 *
 * Thiet bi hong ngoai (quat, loa, TV) phat qua bo phat IR chay ESPHome:
 *   type: custom:aurora-device-control-card
 *   device: fan                # loai thiet bi
 *   model: hsv                 # mau remote hong ngoai cua loai do
 *   blaster: sr06_t1_3s_01     # ten node ESPHome phat IR (phan giua cua esphome.<ten>_send_nec)
 *   entity: switch.o_cam_quat  # tuy chon: entity cho biet thiet bi dang bat hay tat
 *
 * Thiet bi theo entity (dieu hoa, den, cua cuon / rem, robot hut bui, camera):
 *   type: custom:aurora-device-control-card
 *   device: climate
 *   entity: climate.s06_ir_toshiba_ac
 *
 * Cau hinh cu "remote: hsv_fan" va ten card cu "custom:ir-remote-card" van chay.
 * Khong can build, khong phu thuoc thu vien nao.
 */

const VERSION = "2.2.3";

// Ma NEC 8 bit -> 16 bit theo kieu ESPHome: byte cao la dao bit cua byte thap (0x08 -> 0xF708)
const nec = (code) => (((~code & 0xff) << 8) | code) >>> 0;

// Chu hien tren card, pop-up va form: tieng Viet khi Home Assistant dat tieng Viet, con lai tieng Anh.
// Them ngon ngu = them mot khoi cung khoa vao day; khoa thieu thi lay ban tieng Anh.
const STRINGS = {
  en: {
    device_fan: "Fan",
    device_speaker: "Speaker",
    device_tv: "TV",
    device_appletv: "Apple TV",
    device_climate: "Air conditioner",
    device_light: "Light",
    device_cover: "Roller door / curtain",
    device_lock: "Door lock",
    device_media_player: "Speaker / smart TV",
    device_water_heater: "Water heater",
    device_humidifier: "Humidifier / dehumidifier",
    device_switch: "Socket / switch",
    device_alarm: "Alarm",
    device_valve: "Water valve",
    device_lawn_mower: "Lawn mower",
    device_projector: "Projector",
    device_receiver: "AV receiver / amplifier",
    device_stb: "Set-top box / tuner",
    device_streamer: "Streaming box",
    device_player: "Disc player (DVD, Blu-ray, CD)",
    device_led: "LED light / LED strip",
    device_purifier: "Air purifier",
    device_heater: "Heater",
    device_humidifier_ir: "Humidifier",
    device_vacuum_ir: "Robot vacuum",
    device_monitor: "Monitor",
    quick_slider: "slider",
    label_brand: "Brand",
    label_codeset: "Code set (if the buttons do nothing, try the next one)",
    codeset_builtin: "built in",
    missing_brand: "No brand selected",
    loading_codes: "Loading codes…",
    codes_failed: "Could not load the IR code database",
    codes_not_found: "Code set not found",
    ir_unsupported: "this code cannot be sent",
    name_lock: "Door lock",
    name_fan: "Fan",
    name_media_player: "Media player",
    name_water_heater: "Water heater",
    name_humidifier: "Humidifier",
    name_switch: "Socket",
    name_alarm_control_panel: "Alarm",
    name_valve: "Water valve",
    name_lawn_mower: "Lawn mower",
    act_power: "Power",
    act_lock: "Lock",
    act_unlock: "Unlock",
    act_open: "Open",
    act_stop: "Stop",
    act_close: "Close",
    act_low: "Low",
    act_medium: "Medium",
    act_high: "High",
    act_oscillate: "Oscillate",
    act_direction: "Reverse",
    act_previous: "Previous",
    act_play_pause: "Play / pause",
    act_next: "Next",
    act_vol_down: "Volume down",
    act_vol_up: "Volume up",
    act_mute: "Mute",
    act_arm_home: "Arm home",
    act_arm_away: "Arm away",
    act_arm_night: "Arm night",
    act_arm_vacation: "Arm vacation",
    act_disarm: "Disarm",
    act_start: "Start",
    act_pause: "Pause",
    act_dock: "Return to dock",
    slider_fan_speed: "Speed",
    slider_volume: "Volume",
    slider_temperature: "Target temperature",
    slider_humidity: "Target humidity",
    slider_position: "Position",
    chip_preset_mode: "Mode",
    chip_mode: "Mode",
    chip_operation_mode: "Mode",
    chip_source: "Source",
    chip_sound_mode: "Sound mode",
    enter_code: "Enter the code",
    label_confirm: "Ask before unlocking or opening",
    device_vacuum: "Robot vacuum",
    device_camera: "Camera",
    name_climate: "Air conditioner",
    name_light: "Light",
    name_cover: "Roller door",
    name_vacuum: "Robot vacuum",
    light_brightness: "Brightness",
    light_temperature: "Colour temperature",
    light_color: "Colour",
    white_warm: "Warm white",
    white_neutral: "Neutral white",
    white_cool: "Cool white",
    color_red: "Red",
    color_orange: "Orange",
    color_yellow: "Yellow",
    color_green: "Green",
    color_cyan: "Cyan",
    color_blue: "Blue",
    color_purple: "Purple",
    color_pink: "Pink",
    cover_open: "Open",
    cover_stop: "Stop",
    cover_close: "Close",
    cover_position: "Position",
    cover_tilt: "Tilt",
    hvac_cool: "Cool",
    hvac_dry: "Dry",
    hvac_fan_only: "Fan only",
    hvac_heat: "Heat",
    hvac_heat_cool: "Auto (heat/cool)",
    hvac_auto: "Auto",
    privacy: "Privacy",
    missing_entity: "No entity selected",
    missing_blaster: "No IR blaster selected",
    keyboard_placeholder: "Type to enter text on the device",
    paused: "Paused",
    playing: "Playing",
    more_keys: "Number keys and more",
    no_config_entry: "could not find the device's config entry",
    pad_title: "Navigation pad in the pop-up (four direction buttons)",
    label_device: "Device type",
    label_model: "Infrared remote model",
    label_blaster: "IR blaster (ESPHome node)",
    label_entity: "State entity (optional: lets the card know whether the device is on)",
    label_device_entity: "Device entity",
    label_name: "Display name (empty = default name)",
    label_icon: "Icon (empty = default icon)",
    label_color: "Icon colour (empty = default colour of the device type)",
    label_availability_entity: "Entity that reports lost connection (empty = automatic)",
    label_badge_entity: "Status badge, top right: entity to show (empty = default)",
    label_badge_icon: "Status badge, top right: leading icon (empty = default of the device type)",
    label_hide_quick: "Hide the quick button row (card as short as a tile)",
    label_quick: "Quick buttons on the card (pick one or more, drag to reorder)",
    label_quick_entities: "Quick buttons on the card",
    label_remote_entity: "Remote entity used to send commands (empty = found by name)",
    label_apps: "Apps shown in the pop-up (tap to open)",
    label_controls: "Buttons in the pop-up",
    label_columns: "Number of columns of the pop-up button grid",
    label_up: "Up",
    label_down: "Down",
    label_left: "Left",
    label_right: "Right",
    field_entity: "Entity (button, switch, light...)",
    field_name: "Label (empty = entity name)",
    field_icon: "Icon (empty = entity icon)",
    field_service: "Action to call instead of pressing the entity (e.g. vacuum.return_to_base)",
    field_name_popup: "Label (empty = icon only)",
    field_color: "Colour when on (colour name or #hex code)",
    field_path: "Navigate to a page (instead of an entity)",
    field_confirm: "Confirmation question before pressing",
    field_wide: "Take the whole row",
  },
  vi: {
    device_fan: "Quạt",
    device_speaker: "Loa",
    device_tv: "TV",
    device_appletv: "Apple TV",
    device_climate: "Điều hòa",
    device_light: "Đèn",
    device_cover: "Cửa cuốn / rèm",
    device_lock: "Khóa cửa",
    device_media_player: "Loa / TV thông minh",
    device_water_heater: "Bình nóng lạnh",
    device_humidifier: "Máy tạo ẩm / hút ẩm",
    device_switch: "Ổ cắm / công tắc",
    device_alarm: "Báo động",
    device_valve: "Van nước",
    device_lawn_mower: "Máy cắt cỏ",
    device_projector: "Máy chiếu",
    device_receiver: "Amply / đầu thu AV",
    device_stb: "Đầu thu truyền hình",
    device_streamer: "Hộp phát trực tuyến",
    device_player: "Đầu đĩa (DVD, Blu-ray, CD)",
    device_led: "Đèn LED / dây LED",
    device_purifier: "Máy lọc không khí",
    device_heater: "Máy sưởi",
    device_humidifier_ir: "Máy tạo ẩm",
    device_vacuum_ir: "Robot hút bụi",
    device_monitor: "Màn hình",
    quick_slider: "thanh trượt",
    label_brand: "Hãng",
    label_codeset: "Bộ mã (nếu bấm không ăn, hãy thử bộ kế tiếp)",
    codeset_builtin: "có sẵn",
    missing_brand: "Chưa chọn hãng",
    loading_codes: "Đang tải mã…",
    codes_failed: "Không tải được kho mã IR",
    codes_not_found: "Không tìm thấy bộ mã",
    ir_unsupported: "không gửi được mã này",
    name_lock: "Khóa cửa",
    name_fan: "Quạt",
    name_media_player: "Thiết bị phát",
    name_water_heater: "Bình nóng lạnh",
    name_humidifier: "Máy tạo ẩm",
    name_switch: "Ổ cắm",
    name_alarm_control_panel: "Báo động",
    name_valve: "Van nước",
    name_lawn_mower: "Máy cắt cỏ",
    act_power: "Nguồn",
    act_lock: "Khóa",
    act_unlock: "Mở khóa",
    act_open: "Mở",
    act_stop: "Dừng",
    act_close: "Đóng",
    act_low: "Thấp",
    act_medium: "Vừa",
    act_high: "Cao",
    act_oscillate: "Đảo gió",
    act_direction: "Đảo chiều",
    act_previous: "Bài trước",
    act_play_pause: "Phát / dừng",
    act_next: "Bài sau",
    act_vol_down: "Giảm âm",
    act_vol_up: "Tăng âm",
    act_mute: "Tắt tiếng",
    act_arm_home: "Bật ở nhà",
    act_arm_away: "Bật vắng nhà",
    act_arm_night: "Bật ban đêm",
    act_arm_vacation: "Bật đi xa",
    act_disarm: "Tắt báo động",
    act_start: "Bắt đầu",
    act_pause: "Tạm dừng",
    act_dock: "Về dock",
    slider_fan_speed: "Tốc độ",
    slider_volume: "Âm lượng",
    slider_temperature: "Nhiệt độ đặt",
    slider_humidity: "Độ ẩm đặt",
    slider_position: "Vị trí",
    chip_preset_mode: "Chế độ",
    chip_mode: "Chế độ",
    chip_operation_mode: "Chế độ",
    chip_source: "Nguồn phát",
    chip_sound_mode: "Chế độ âm thanh",
    enter_code: "Nhập mã",
    label_confirm: "Hỏi lại trước khi mở khóa hoặc mở cửa",
    device_vacuum: "Robot hút bụi",
    device_camera: "Camera",
    name_climate: "Điều hòa",
    name_light: "Đèn",
    name_cover: "Cửa cuốn",
    name_vacuum: "Robot hút bụi",
    light_brightness: "Độ sáng",
    light_temperature: "Nhiệt độ màu",
    light_color: "Màu",
    white_warm: "Trắng ấm",
    white_neutral: "Trắng trung tính",
    white_cool: "Trắng lạnh",
    color_red: "Đỏ",
    color_orange: "Cam",
    color_yellow: "Vàng",
    color_green: "Xanh lá",
    color_cyan: "Xanh ngọc",
    color_blue: "Xanh dương",
    color_purple: "Tím",
    color_pink: "Hồng",
    cover_open: "Mở",
    cover_stop: "Dừng",
    cover_close: "Đóng",
    cover_position: "Vị trí",
    cover_tilt: "Góc lật",
    hvac_cool: "Làm lạnh",
    hvac_dry: "Hút ẩm",
    hvac_fan_only: "Quạt",
    hvac_heat: "Sưởi",
    hvac_heat_cool: "Tự động (sưởi/lạnh)",
    hvac_auto: "Tự động",
    privacy: "Riêng tư",
    missing_entity: "Chưa chọn entity",
    missing_blaster: "Chưa chọn bộ phát",
    keyboard_placeholder: "Gõ để nhập trên thiết bị",
    paused: "Tạm dừng",
    playing: "Đang phát",
    more_keys: "Phím số và phím khác",
    no_config_entry: "không tìm thấy config entry của thiết bị",
    pad_title: "Vòng điều hướng trong pop-up (bốn nút hướng)",
    label_device: "Loại thiết bị",
    label_model: "Mẫu remote hồng ngoại",
    label_blaster: "Bộ phát IR (node ESPHome)",
    label_entity: "Entity trạng thái (tùy chọn: để card biết đang bật hay tắt)",
    label_device_entity: "Entity của thiết bị",
    label_name: "Tên hiển thị (để trống = tên mặc định)",
    label_icon: "Icon (để trống = icon mặc định)",
    label_color: "Màu icon (để trống = màu mặc định của loại thiết bị)",
    label_availability_entity: "Entity báo mất kết nối (để trống = tự động)",
    label_badge_entity: "Ô trạng thái góc phải: entity hiển thị (để trống = mặc định)",
    label_badge_icon: "Ô trạng thái góc phải: icon đứng trước (để trống = mặc định của loại thiết bị)",
    label_hide_quick: "Ẩn hàng nút nhanh (card thấp bằng một tile)",
    label_quick: "Nút nhanh trên card (chọn một hoặc nhiều, kéo để đổi thứ tự)",
    label_quick_entities: "Nút nhanh trên card",
    label_remote_entity: "Entity remote để gửi lệnh (để trống = tự tìm theo tên)",
    label_apps: "Ứng dụng hiện trong pop-up (bấm để mở)",
    label_controls: "Nút trong pop-up",
    label_columns: "Số cột của lưới nút trong pop-up",
    label_up: "Lên",
    label_down: "Xuống",
    label_left: "Trái",
    label_right: "Phải",
    field_entity: "Entity (nút bấm, công tắc, đèn...)",
    field_name: "Chữ hiển thị (để trống = tên entity)",
    field_icon: "Icon (để trống = icon của entity)",
    field_service: "Action gọi thay cho bấm entity (vd. vacuum.return_to_base)",
    field_name_popup: "Chữ hiển thị (để trống = chỉ icon)",
    field_color: "Màu khi bật (tên màu hoặc mã #hex)",
    field_path: "Chuyển tới trang (thay cho entity)",
    field_confirm: "Câu hỏi xác nhận trước khi bấm",
    field_wide: "Chiếm cả hàng",
  },
};

// Ngon ngu dang dung, lay tu ho so nguoi dung cua Home Assistant moi khi card nhan hass
let LANG = "en";
function setLang(hass) {
  const code = String((hass && ((hass.locale && hass.locale.language) || hass.language)) || "en").toLowerCase();
  const base = code.split("-")[0];
  LANG = STRINGS[code] ? code : STRINGS[base] ? base : "en";
}
const tr = (key, fallback) => STRINGS[LANG][key] || STRINGS.en[key] || fallback || key;

// Cac giao thuc ESPHome khong co san (RCA, Kaseikyo, quat 12 bit...) duoc doi thanh chuoi Pronto
// va gui bang action send_pronto, nen khong can them action moi tren bo phat.
// pronto(): tan so (Hz) + day thoi luong micro giay (bat, tat, bat, tat...) -> chuoi Pronto.
function pronto(frequency, timings) {
  const list = timings.length % 2 ? [...timings, 10000] : timings;
  const unit = 1e6 / frequency;
  const words = [0, Math.round(1e6 / (frequency * 0.241246)), list.length / 2, 0];
  for (const us of list) words.push(Math.max(1, Math.round(us / unit)));
  return words.map((n) => n.toString(16).toUpperCase().padStart(4, "0")).join(" ");
}

// Day bit "1011..." -> cac cap bat/tat. one/zero: [bat, tat] cua bit 1 va bit 0.
const bitTimings = (bits, one, zero) => [...bits].flatMap((bit) => (bit === "1" ? one : zero));
// Byte -> 8 bit, bit thap di truoc
const lsbBits = (byte) => [...Array(8)].map((_, i) => (byte >> i) & 1).join("");

// RCA 38 kHz (TV TCL): 4 bit dia chi + 8 bit lenh, roi ban dao bit cua ca hai. Gui 2 khung nhu remote that.
function rca(address, command) {
  const bits =
    lsbBits(address).slice(0, 4) + lsbBits(command) + lsbBits(~address & 0xf).slice(0, 4) + lsbBits(~command & 0xff);
  const frame = [4000, 4000, ...bitTimings(bits, [500, 2000], [500, 1000]), 500, 8000];
  return pronto(38000, [...frame, ...frame]);
}

// Kaseikyo cua Panasonic (37 kHz): ma hang 0x2002, thiet bi, thiet bi phu, lenh, byte kiem tra.
function kaseikyo(device, subdevice, command) {
  const bytes = [0x02, 0x20, device, subdevice, command, device ^ subdevice ^ command];
  const bits = bytes.map(lsbBits).join("");
  return pronto(37000, [3456, 1728, ...bitTimings(bits, [432, 1296], [432, 432]), 432, 74000]);
}

// Quat dung chip remote 12 bit (Senko va nhieu quat Viet Nam): bit 1 = bat dai/tat ngan, bit 0 nguoc lai.
// Moi lan bam remote that phat khung nay 3 lan, cach nhau khoang 7,4 ms.
function fan12(code) {
  const frame = bitTimings(code.toString(2).padStart(12, "0"), [1280, 420], [420, 1280]);
  frame[frame.length - 1] += 7400;
  return pronto(38000, [...frame, ...frame, ...frame]);
}

// Quat Mitsubishi: khung 64 bit viet dang hex, bit cao di truoc.
function mitsubishiFan(hex) {
  const bits = [...hex].map((digit) => parseInt(digit, 16).toString(2).padStart(4, "0")).join("");
  return pronto(38000, [2840, 1420, ...bitTimings(bits, [355, 1065], [355, 355]), 355, 10000]);
}

// TV Sharp: khung 15 bit (5 bit dia chi, 8 bit lenh, 2 bit phu "10"), bit thap di truoc.
// Khung thu hai lap lai dia chi va dao 10 bit con lai de TV doi chieu.
function sharp(address, command) {
  const low = (value, count) => [...Array(count)].map((_, i) => (value >> i) & 1).join("");
  const head = low(address, 5);
  const tail = `${low(command, 8)}10`;
  const inverted = [...tail].map((bit) => (bit === "1" ? "0" : "1")).join("");
  const frame = (bits) => [...bitTimings(bits, [320, 1680], [320, 680]), 320, 44000];
  return pronto(38000, [...frame(head + tail), ...frame(head + inverted)]);
}

// Quat KDK: khung 56 bit viet dang hex, bit cao di truoc, remote that phat hai lan.
function kdkFan(hex) {
  const bits = [...hex].map((digit) => parseInt(digit, 16).toString(2).padStart(4, "0")).join("");
  const frame = [3500, 1700, ...bitTimings(bits, [450, 1270], [450, 420]), 450, 74500];
  return pronto(38000, [...frame, ...frame]);
}

// Bo cuc cho may chieu: vong dieu huong va phim co ban nhu TV, phan mo rong la cac phim rieng cua may chieu.
// extras: [id, icon, nhan]
function projectorLayout(codes, extras) {
  const base = tvLayout(codes);
  const buttons = extras.map(([id, icon, label]) => ({ id, icon, label, ...codes[id] }));
  return {
    ...base,
    groups: [...base.groups, { columns: 3, buttons }],
    pad: { ...base.pad, extra: [{ columns: 3, buttons }] },
  };
}

// ----- Kho ma IR (Flipper-IRDB), nam trong file aurora-ir-codes.js canh file nay, chi nap khi can -----
// Moi ma la chuoi "<giao thuc>:<dia chi hex>:<lenh hex>" hoac tin hieu tho "r:<kHz>:<bang do dai>:<chi so>".
// Tat ca duoc doi thanh chuoi Pronto luc bam nut, nen bo phat chi can action send_pronto.
const necFrame = (bytes, frequency, header, mark, one, zero, gap) =>
  pronto(frequency, [...header, ...bitTimings(bytes.map(lsbBits).join(""), [mark, one], [mark, zero]), mark, gap]);
const lowBits = (value, count) => [...Array(count)].map((_, i) => Math.floor(value / 2 ** i) % 2).join("");
const highBits = (value, count) => [...lowBits(value, count)].reverse().join("");

// Ma hoa Manchester: moi bit la hai nua, levels la chuoi muc 1 (phat) / 0 (nghi) theo don vi "unit"
function levelTimings(levels, unit, gap) {
  const start = levels.indexOf(1);
  const timings = [];
  let last = null;
  for (const level of levels.slice(start)) {
    if (level === last) timings[timings.length - 1] += unit;
    else timings.push(unit);
    last = level;
  }
  if (timings.length % 2) timings.push(gap);
  else timings[timings.length - 1] += gap;
  return timings;
}

function irPronto(code, toggle) {
  const parts = code.split(":");
  if (parts[0] === "r") {
    const palette = parts[2].split(".").map(Number);
    return pronto(Number(parts[1]) * 1000, [...parts[3]].map((digit) => palette[parseInt(digit, 36)]));
  }
  const address = parseInt(parts[1], 16);
  const command = parseInt(parts[2], 16);
  const inv = (byte) => ~byte & 0xff;
  switch (parts[0]) {
    case "N":
      return necFrame([address & 0xff, inv(address), command & 0xff, inv(command)], 38000, [9000, 4500], 560, 1690, 560, 40000);
    case "X":
      return necFrame([address & 0xff, (address >> 8) & 0xff, command & 0xff, (command >> 8) & 0xff], 38000, [9000, 4500], 560, 1690, 560, 40000);
    case "N42":
    case "X42": {
      // 42 bit: dia chi 13 bit + ban dao, lenh 8 bit + ban dao; kieu mo rong gui thang 26 + 16 bit
      const bits =
        parts[0] === "N42"
          ? lowBits(address, 13) + lowBits(~address & 0x1fff, 13) + lowBits(command, 8) + lowBits(inv(command), 8)
          : lowBits(address, 26) + lowBits(command, 16);
      return pronto(38000, [9000, 4500, ...bitTimings(bits, [560, 1690], [560, 560]), 560, 40000]);
    }
    case "S":
      return necFrame([address & 0xff, address & 0xff, command & 0xff, inv(command)], 38000, [4500, 4500], 550, 1650, 550, 46000);
    case "P": {
      const frame = [8500, 4250, ...bitTimings([address & 0xff, inv(address), command & 0xff, inv(command)].map(lsbBits).join(""), [500, 1500], [500, 500]), 500, 26000];
      return pronto(40000, [...frame, ...frame]);
    }
    case "RCA":
      return rca(address, command);
    case "K": {
      // Dia chi cua Flipper: id (2 bit) | ma hang (16 bit) | nhom 1 | nhom 2; lenh 10 bit
      const vendor = (address >> 8) & 0xffff;
      const parity = (vendor ^ (vendor >> 4) ^ (vendor >> 8) ^ (vendor >> 12)) & 0xf;
      const bytes = [
        vendor & 0xff,
        vendor >> 8,
        parity | (((address >> 4) & 0xf) << 4),
        (address & 0xf) | ((command & 0xf) << 4),
        ((command >> 4) & 0x3f) | (((address >> 24) & 3) << 6),
      ];
      bytes.push(bytes[2] ^ bytes[3] ^ bytes[4]);
      return necFrame(bytes, 37000, [3456, 1728], 432, 1296, 432, 74000);
    }
    case "S12":
    case "S15":
    case "S20": {
      // Sony: 7 bit lenh roi dia chi, bit thap truoc; moi khung dai 45 ms, phat 3 lan
      const bits = lowBits(command, 7) + lowBits(address, Number(parts[0].slice(1)) - 7);
      const frame = [2400, 600, ...bitTimings(bits, [1200, 600], [600, 600])];
      frame[frame.length - 1] += 45000 - frame.reduce((sum, value) => sum + value, 0);
      return pronto(40000, [...frame, ...frame, ...frame]);
    }
    case "R5": {
      // RC5: 2 bit mo dau (bit thu hai la dao cua bit 6 cua lenh), bit lat, 5 bit dia chi, 6 bit lenh
      const bits = `1${command & 0x40 ? 0 : 1}${toggle ? 1 : 0}${highBits(address, 5)}${highBits(command & 0x3f, 6)}`;
      const levels = [...bits].flatMap((bit) => (bit === "1" ? [0, 1] : [1, 0]));
      return pronto(36000, levelTimings(levels, 889, 89000));
    }
    case "R6": {
      // RC6 che do 0: dau khung, bit mo dau, 3 bit che do, bit lat (dai gap doi), 8 bit dia chi, 8 bit lenh
      const half = (bit, width = 1) => (bit === "1" ? [...Array(width).fill(1), ...Array(width).fill(0)] : [...Array(width).fill(0), ...Array(width).fill(1)]);
      const levels = [
        ...Array(6).fill(1), 0, 0,
        ...[..."1000"].flatMap((bit) => half(bit)),
        ...half(toggle ? "1" : "0", 2),
        ...[...highBits(address, 8) + highBits(command, 8)].flatMap((bit) => half(bit)),
      ];
      return pronto(36000, levelTimings(levels, 444, 83000));
    }
    default:
      return null;
  }
}

// Dia chi file nay, de tim file kho ma nam canh no (HACS, hoac thu muc www khi chep tay)
const SCRIPT_URL = (() => {
  try {
    const match = (new Error().stack || "").match(/(https?:\/\/[^\s)]*\/)aurora-device-control-card\.js/);
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
})();
let CODES = (typeof window !== "undefined" && window.AURORA_IR_CODES) || null;
let codesPromise = null;
function loadCodes() {
  if (CODES) return Promise.resolve(CODES);
  if (!codesPromise) {
    const base = SCRIPT_URL || "/hacsfiles/ha-aurora-device-control-card/";
    codesPromise = import(`${base}aurora-ir-codes.js?v=${VERSION}`)
      .then(() => {
        CODES = window.AURORA_IR_CODES;
        if (!CODES) throw new Error("empty");
        return CODES;
      })
      .catch((err) => {
        codesPromise = null;
        throw err;
      });
  }
  return codesPromise;
}

// Icon va nhan cua cac phim co id chung trong kho ma
const IR_KEYS = {
  power: ["mdi:power", ""], power_on: ["mdi:power-on", "ON"], power_off: ["mdi:power-off", "OFF"],
  vol_up: ["mdi:volume-plus", ""], vol_down: ["mdi:volume-minus", ""], mute: ["mdi:volume-off", ""],
  ch_up: ["mdi:chevron-up", "CH +"], ch_down: ["mdi:chevron-down", "CH −"],
  up: ["mdi:arrow-up-bold", ""], down: ["mdi:arrow-down-bold", ""], left: ["mdi:arrow-left-bold", ""],
  right: ["mdi:arrow-right-bold", ""], ok: ["mdi:circle-outline", "OK"],
  menu: ["mdi:menu", "MENU"], home: ["mdi:home", "HOME"], return: ["mdi:arrow-u-left-top", "BACK"],
  exit: ["mdi:exit-to-app", "EXIT"], source: ["mdi:import", "INPUT"], info: ["mdi:information-outline", "INFO"],
  guide: ["mdi:television-guide", "GUIDE"], pre_ch: ["mdi:history", "PRE-CH"],
  play: ["mdi:play", "PLAY"], pause: ["mdi:pause", "PAUSE"], play_pause: ["mdi:play-pause", "PLAY/PAUSE"],
  stop: ["mdi:stop", "STOP"], rewind: ["mdi:rewind", "REW"], fast_forward: ["mdi:fast-forward", "FF"],
  next: ["mdi:skip-next", "NEXT"], prev: ["mdi:skip-previous", "PREV"], record: ["mdi:record", "REC"],
  red: ["mdi:circle", "RED"], green: ["mdi:circle", "GREEN"], yellow: ["mdi:circle", "YELLOW"], blue: ["mdi:circle", "BLUE"],
  white: ["mdi:circle-outline", "WHITE"],
  speed: ["mdi:fan", "SPEED"], speed_up: ["mdi:fan-plus", "SPEED +"], speed_down: ["mdi:fan-minus", "SPEED −"],
  speed_1: ["mdi:fan-speed-1", "LOW"], speed_2: ["mdi:fan-speed-2", "MED"], speed_3: ["mdi:fan-speed-3", "HIGH"],
  swing: ["mdi:arrow-oscillating", "SWING"], timer: ["mdi:timer-outline", "TIMER"], sleep: ["mdi:weather-night", "SLEEP"],
  mode: ["mdi:tune-variant", "MODE"], light: ["mdi:lightbulb", "LIGHT"],
  bright_up: ["mdi:brightness-7", "BRIGHT +"], bright_down: ["mdi:brightness-5", "BRIGHT −"],
  flash: ["mdi:flash", "FLASH"], strobe: ["mdi:flash-alert", "STROBE"], fade: ["mdi:gradient-horizontal", "FADE"],
  smooth: ["mdi:wave", "SMOOTH"],
  temp_up: ["mdi:thermometer-plus", "TEMP +"], temp_down: ["mdi:thermometer-minus", "TEMP −"],
  eject: ["mdi:eject", "EJECT"], subtitle: ["mdi:subtitles-outline", "SUB"], audio: ["mdi:music-note", "AUDIO"],
  netflix: ["mdi:netflix", "NETFLIX"], youtube: ["mdi:youtube", "YOUTUBE"],
};
const IR_KEY_COLORS = { power: "#e53935", red: "#e53935", green: "#43a047", yellow: "#fdd835", blue: "#1e88e5" };
for (let n = 0; n < 10; n++) IR_KEYS[`num_${n}`] = [`mdi:numeric-${n}-circle`, ""];
// Nut nhanh mac dinh, lay bo dau tien co du phim
const IR_QUICK = [
  ["mute", "vol_down", "vol_up"],
  ["speed", "swing", "timer"],
  ["speed_1", "speed_2", "speed_3"],
  ["bright_down", "bright_up", "white"],
  ["play_pause", "prev", "next"],
  ["play", "pause", "stop"],
];

// Dung dinh nghia remote (cung dang voi mot muc trong REMOTES) tu mot bo ma trong kho
function buildDbRemote(type, brand, set) {
  const meta = IR_DEVICES[type];
  const full = (code) => (code.includes(":") ? code : `${set.d}:${code}`);
  const codes = mapValues(set.k, (code) => ({ ir: full(code) }));
  const ids = Object.keys(codes);
  const button = (id) => {
    const [iconName, label] = IR_KEYS[id] || ["mdi:gesture-tap-button", id.toUpperCase()];
    return { id, icon: iconName, ...(label ? { label } : {}), ...(IR_KEY_COLORS[id] ? { color: IR_KEY_COLORS[id] } : {}), ...codes[id] };
  };
  const extras = (set.x || []).map(([label, code], n) => ({
    id: `x_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${n}`,
    icon: "mdi:gesture-tap-button",
    label,
    ir: full(code),
  }));
  const def = {
    name: brand,
    icon: meta.icon,
    color: meta.color,
    button_height: 58,
    power: ["power", "power_on"].find((id) => codes[id]),
    codeset: set.i,
  };
  const pick = IR_QUICK.find((list) => list.every((id) => codes[id]));
  def.quick = pick || ids.filter((id) => id !== def.power).slice(0, 3);

  if (["up", "down", "left", "right", "ok"].every((id) => codes[id])) {
    // Du phim dieu huong: bo cuc vong tron nhu TV; phim khong co cho trong bo cuc do nam o phan phim phu
    const base = tvLayout(codes);
    const placed = new Set(base.groups.flatMap((group) => group.buttons).map((btn) => btn.id));
    const rest = [...ids.filter((id) => !placed.has(id)).map(button), ...extras];
    const filled = base.pad.extra.filter((group) => group.buttons.some((btn) => btn.id));
    const more = rest.length ? [{ columns: 3, buttons: rest }] : [];
    return { ...def, ...base, groups: [...base.groups, ...more], pad: { ...base.pad, extra: [...filled, ...more] } };
  }
  return { ...def, buttons: [...ids.map(button), ...extras] };
}

const dbRemoteCache = new Map();
// Dinh nghia remote theo cau hinh { device, brand, codeset }; kho chua nap thi tra ve khung cho
function dbRemote(config) {
  const meta = IR_DEVICES[config.device];
  if (!meta) return undefined;
  const pending = (state) => ({ name: config.brand || meta.name, icon: meta.icon, color: meta.color, buttons: [], pending: state });
  if (!config.brand) return pending("missing_brand");
  if (!CODES) return pending("loading_codes");
  const sets = (CODES.types[dbType(config.device)] || {})[config.brand] || [];
  const set = sets.find((item) => item.i === config.codeset) || (config.codeset ? null : sets[0]);
  if (!set) return pending("codes_not_found");
  const key = `${config.device}|${config.brand}|${set.i}`;
  if (!dbRemoteCache.has(key)) dbRemoteCache.set(key, buildDbRemote(config.device, config.brand, set));
  return dbRemoteCache.get(key);
}

// Bo cuc chung cho remote TV. codes: id nut -> cac truong ma IR ({ command } hoac { data, nbits }).
// Nut nao khong co ma thi de o trong, nen cac hang TV khac nhau van thang hang.
function tvGroups(codes) {
  const b = (id, icon, extra = {}) => (codes[id] ? { id, icon, ...extra, ...codes[id] } : { spacer: true });
  const num = (n) => b(`num_${n}`, `mdi:numeric-${n}-circle`, { icon_size: 34 });
  const arrow = (id, icon) => b(id, icon, { highlight: true });
  return [
    {
      columns: 3,
      buttons: [
        b("power", "mdi:power", { color: "#e53935" }),
        { spacer: true },
        b("source", "mdi:import"),
        num(1), num(2), num(3),
        num(4), num(5), num(6),
        num(7), num(8), num(9),
        b("pre_ch", "mdi:history", { label: "PRE-CH" }),
        num(0),
        b("info", "mdi:information-outline", { label: "INFO" }),
        b("vol_up", "mdi:volume-plus"),
        b("home", "mdi:home"),
        b("ch_up", "mdi:chevron-up"),
        b("vol_down", "mdi:volume-minus"),
        b("mute", "mdi:volume-off"),
        b("ch_down", "mdi:chevron-down"),
        b("menu", "mdi:menu", { label: "MENU" }),
        arrow("up", "mdi:arrow-up-bold"),
        b("guide", "mdi:television-guide", { label: "GUIDE" }),
        arrow("left", "mdi:arrow-left-bold"),
        b("ok", "mdi:check-circle-outline", { label: "OK", highlight: true }),
        arrow("right", "mdi:arrow-right-bold"),
        b("return", "mdi:arrow-u-left-top", { label: "RETURN" }),
        arrow("down", "mdi:arrow-down-bold"),
        b("exit", "mdi:exit-to-app", { label: "EXIT" }),
      ],
    },
    {
      columns: 4,
      buttons: [
        b("red", "mdi:circle", { color: "#e53935" }),
        b("green", "mdi:circle", { color: "#43a047" }),
        b("yellow", "mdi:circle", { color: "#fdd835" }),
        b("blue", "mdi:circle", { color: "#1e88e5" }),
      ],
    },
    {
      columns: 5,
      buttons: [
        b("rewind", "mdi:rewind"),
        b("play", "mdi:play"),
        b("pause", "mdi:pause"),
        b("stop", "mdi:stop"),
        b("fast_forward", "mdi:fast-forward"),
      ],
    },
  ];
}

// Bo cuc pop-up kieu remote Apple cho TV: vong dieu huong + cac phim co ban,
// phim so va phim phu nam trong phan mo rong. Tra ve cac truong de trai vao dinh nghia remote.
function tvLayout(codes) {
  const b = (id, icon, extra = {}) => (codes[id] ? { id, icon, ...extra, ...codes[id] } : { spacer: true });
  const num = (n) => b(`num_${n}`, `mdi:numeric-${n}-circle`, { icon_size: 34 });
  return {
    groups: tvGroups(codes),
    layout: "pad",
    pad: {
      ok: "ok",
      main: ["return", "home", "mute", "source"],
      pairs: [["vol_down", "vol_up"], ["ch_down", "ch_up"]],
      round: "power",
      extra: [
        {
          columns: 3,
          buttons: [
            num(1), num(2), num(3),
            num(4), num(5), num(6),
            num(7), num(8), num(9),
            b("pre_ch", "mdi:history", { label: "PRE-CH" }),
            num(0),
            b("info", "mdi:information-outline", { label: "INFO" }),
            b("menu", "mdi:menu", { label: "MENU" }),
            b("guide", "mdi:television-guide", { label: "GUIDE" }),
            b("exit", "mdi:exit-to-app", { label: "EXIT" }),
          ],
        },
        {
          columns: 4,
          buttons: [
            b("red", "mdi:circle", { color: "#e53935" }),
            b("green", "mdi:circle", { color: "#43a047" }),
            b("yellow", "mdi:circle", { color: "#fdd835" }),
            b("blue", "mdi:circle", { color: "#1e88e5" }),
          ],
        },
        {
          columns: 5,
          buttons: [
            b("rewind", "mdi:rewind"),
            b("play", "mdi:play"),
            b("pause", "mdi:pause"),
            b("stop", "mdi:stop"),
            b("fast_forward", "mdi:fast-forward"),
          ],
        },
      ],
    },
  };
}

const mapValues = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));

// Bo ma IR. Them thiet bi moi = them mot muc o day.
//   protocol: phan duoi cua action ESPHome (nec, samsung, sony, ...)
//   address/repeats/nbits: mac dinh cho moi nut, tung nut co the ghi de
//   color: mau icon mac dinh cua loai thiet bi (nguoi dung ghi de bang tuy chon "color" cua card)
//   power: id nut duoc gui khi bam vao icon cua card
//   quick: 3 id nut hien o hang duoi cua card
//   buttons: luoi 3 cot trong pop-up; hoac groups: nhieu luoi, moi luoi co so cot rieng.
//     Nut gui { address, command } hoac { data, nbits } tuy giao thuc.
//     label co => icon nho + chu; khong co label => chi icon to. { spacer: true } la o trong.
const REMOTES = {
  hsv_fan: {
    name: "HSV Fan",
    icon: "mdi:ceiling-fan-light",
    color: "#5CC8BE",
    protocol: "nec",
    address: 23175,
    repeats: 1,
    button_height: 54,
    power: "all_off",
    quick: ["light", "swing", "speed_3"],
    buttons: [
      { id: "light", icon: "mdi:lightbulb-on", label: "LIGHT", address: 64931, command: 62730 },
      { id: "all_off", icon: "mdi:power", label: "ALL OFF", address: 64931, command: 64770, color: "#e53935" },
      { id: "fan_off", icon: "mdi:fan-off", label: "FAN OFF", command: 46155 },
      { id: "light_down", icon: "mdi:brightness-4", label: "LIGHT −", address: 64931, command: 17340 },
      { id: "light_up", icon: "mdi:brightness-7", label: "LIGHT +", address: 64931, command: 21675 },
      { id: "night", icon: "mdi:weather-night", label: "NIGHT", command: 47685 },
      { id: "color_down", icon: "mdi:thermometer-minus", label: "COLOR −", address: 64931, command: 4335 },
      { id: "color_up", icon: "mdi:thermometer-plus", label: "COLOR +", address: 64931, command: 6120 },
      { id: "led", icon: "mdi:led-on", label: "LED", command: 47175 },
      { id: "speed_1", icon: "mdi:numeric-1-circle", command: 60180, icon_size: 34 },
      { id: "speed_2", icon: "mdi:numeric-2-circle", command: 59925, icon_size: 34 },
      { id: "speed_3", icon: "mdi:numeric-3-circle", command: 59415, icon_size: 34 },
      { id: "speed_4", icon: "mdi:numeric-4-circle", command: 59160, icon_size: 34 },
      { id: "speed_5", icon: "mdi:numeric-5-circle", command: 58905, icon_size: 34 },
      { id: "speed_6", icon: "mdi:numeric-6-circle", command: 59670, icon_size: 34 },
      { id: "swing", icon: "mdi:arrow-oscillating", label: "SWING", command: 48960 },
      { id: "direction", icon: "mdi:swap-horizontal", label: "FWD/REV", command: 48705 },
      { id: "timer", icon: "mdi:timer-outline", label: "24/4H", command: 46410 },
    ],
  },

  toshiba_fan: {
    name: "Toshiba Fan",
    icon: "mdi:fan",
    color: "#5CC8BE",
    protocol: "nec",
    address: 65025,
    repeats: 2,
    button_height: 64,
    power: "power",
    quick: ["swing", "speed_down", "speed_up"],
    buttons: [
      { id: "speed_down", icon: "mdi:fan-minus", command: 46155 },
      { id: "power", icon: "mdi:power", command: 64515, color: "#e53935" },
      { id: "speed_up", icon: "mdi:fan-plus", command: 63495 },
      { id: "swing", icon: "mdi:arrow-oscillating", label: "SWING", command: 60435 },
      { id: "mode", icon: "mdi:fan-auto", label: "MODE", command: 61455 },
      { id: "timer", icon: "mdi:timer-outline", label: "TIMER", command: 62475 },
    ],
  },

  lg_soundbar: {
    name: "LG Soundbar",
    icon: "mdi:speaker",
    color: "#B394E8",
    protocol: "samsung",
    address: 13364,
    button_height: 54,
    power: "power",
    quick: ["function", "vol_down", "vol_up"],
    buttons: [
      { id: "power", icon: "mdi:power", command: 30855, color: "#e53935" },
      { spacer: true },
      { id: "function", icon: "mdi:import", command: 20910 },
      { id: "asc", icon: "mdi:auto-fix", label: "ASC", command: 27030 },
      { id: "vol_up", icon: "mdi:volume-plus", command: 59415 },
      { id: "bass", icon: "mdi:speaker", label: "BASS", command: 47175 },
      { id: "mute", icon: "mdi:volume-off", command: 63495 },
      { id: "vol_down", icon: "mdi:volume-minus", command: 26775 },
      { id: "cinema", icon: "mdi:movie-open", label: "CINEMA", command: 2550 },
      { id: "previous", icon: "mdi:skip-previous", command: 24735 },
      { id: "play_pause", icon: "mdi:play-pause", command: 61965 },
      { id: "next", icon: "mdi:skip-next", command: 57375 },
      { id: "rear_up", icon: "mdi:tune-variant", label: "REAR +", command: 7395 },
      { id: "woofer_up", icon: "mdi:speaker-wireless", label: "WOOFER +", command: 21420 },
      { id: "auto_on", icon: "mdi:power-plug", label: "AUTO ON", command: 58140 },
      { id: "rear_down", icon: "mdi:tune-variant", label: "REAR −", command: 60435 },
      { id: "woofer_down", icon: "mdi:speaker-wireless", label: "WOOFER −", command: 37740 },
      { id: "auto_off", icon: "mdi:power-plug-off", label: "AUTO OFF", command: 5100 },
    ],
  },

  // Ma hoc tu remote Samsung that (da dung tren TV Q70)
  samsung_tv: {
    name: "Samsung TV",
    icon: "mdi:television",
    color: "#6AA9F0",
    protocol: "samsung",
    address: 57568,
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    ...tvLayout(
      mapValues(
        {
          power: 16575, source: 32895,
          num_1: 8415, num_2: 41055, num_3: 24735, num_4: 4335, num_5: 36975,
          num_6: 20655, num_7: 12495, num_8: 45135, num_9: 28815, num_0: 34935,
          pre_ch: 51255, info: 63495,
          vol_up: 57375, vol_down: 53295, mute: 61455, home: 40545, ch_up: 18615, ch_down: 2295,
          menu: 22695, guide: 61965, return: 6885, exit: 46155,
          up: 1785, down: 34425, left: 42585, right: 18105, ok: 5865,
          red: 14025, green: 10455, yellow: 43095, blue: 26775,
          rewind: 41565, play: 57885, pause: 21165, stop: 25245, fast_forward: 4845,
        },
        (command) => ({ command })
      )
    ),
  },

  // Ma NEC chuan cua TV LG (dia chi 0x04). Lay tu bang ma pho bien, CHUA thu tren TV that.
  lg_tv: {
    name: "LG TV",
    icon: "mdi:television",
    color: "#6AA9F0",
    protocol: "nec",
    address: nec(0x04),
    repeats: 1,
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    ...tvLayout(
      mapValues(
        {
          power: 0x08, source: 0x0b,
          num_1: 0x11, num_2: 0x12, num_3: 0x13, num_4: 0x14, num_5: 0x15,
          num_6: 0x16, num_7: 0x17, num_8: 0x18, num_9: 0x19, num_0: 0x10,
          pre_ch: 0x1a, info: 0xaa,
          vol_up: 0x02, vol_down: 0x03, mute: 0x09, home: 0x7c, ch_up: 0x00, ch_down: 0x01,
          menu: 0x43, guide: 0xa9, return: 0x28, exit: 0x5b,
          up: 0x40, down: 0x41, left: 0x07, right: 0x06, ok: 0x44,
          red: 0x72, green: 0x71, yellow: 0x63, blue: 0x61,
          rewind: 0x8f, play: 0xb0, pause: 0xba, stop: 0xb1, fast_forward: 0x8e,
        },
        (code) => ({ command: nec(code) })
      )
    ),
  },

  // Ma SIRC cua TV Sony (12 bit, mot so nut 15 bit). Lay tu bang ma pho bien, CHUA thu tren TV that.
  // Can action esphome.<blaster>_send_sony nhan { data, nbits } (xem README).
  sony_tv: {
    name: "Sony TV",
    icon: "mdi:television",
    color: "#6AA9F0",
    protocol: "sony",
    nbits: 12,
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    ...tvLayout({
      ...mapValues(
        {
          power: 0xa90, source: 0xa50,
          num_1: 0x010, num_2: 0x810, num_3: 0x410, num_4: 0xc10, num_5: 0x210,
          num_6: 0xa10, num_7: 0x610, num_8: 0xe10, num_9: 0x110, num_0: 0x910,
          pre_ch: 0xdd0, info: 0x5d0,
          vol_up: 0x490, vol_down: 0xc90, mute: 0x290, home: 0x070, ch_up: 0x090, ch_down: 0x890,
          up: 0x2f0, down: 0xaf0, left: 0x2d0, right: 0xcd0, ok: 0xa70,
        },
        (data) => ({ data })
      ),
      ...mapValues(
        {
          menu: 0x36e9, guide: 0x6d25, return: 0x62e9,
          red: 0x52e9, green: 0x32e9, yellow: 0x72e9, blue: 0x12e9,
          rewind: 0x6ce9, play: 0x2ce9, pause: 0x4ce9, stop: 0x0ce9, fast_forward: 0x1ce9,
        },
        (data) => ({ data, nbits: 15 })
      ),
    }),
  },

  // Ma NEC cua TV Toshiba (dia chi 0x40). Lay tu Flipper-IRDB (CT-32F2), CHUA thu tren TV that.
  // TV Toshiba doi moi chay VIDAA do Hisense san xuat: neu khong an thi thu mau Hisense.
  toshiba_tv: {
    name: "Toshiba TV",
    icon: "mdi:television",
    color: "#6AA9F0",
    protocol: "nec",
    address: nec(0x40),
    repeats: 1,
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    ...tvLayout(
      mapValues(
        {
          power: 0x12, source: 0x14,
          num_1: 0x01, num_2: 0x02, num_3: 0x03, num_4: 0x04, num_5: 0x05,
          num_6: 0x06, num_7: 0x07, num_8: 0x08, num_9: 0x09, num_0: 0x00,
          info: 0x16,
          vol_up: 0x1a, vol_down: 0x1e, mute: 0x10, ch_up: 0x1b, ch_down: 0x1f,
          menu: 0x5b, return: 0x64,
          up: 0x19, down: 0x1d, left: 0x42, right: 0x40, ok: 0x21,
          red: 0x48, green: 0x49, yellow: 0x4a, blue: 0x4b,
          rewind: 0x53, play: 0x67, pause: 0x6a, stop: 0x68, fast_forward: 0x0d,
        },
        (code) => ({ command: nec(code) })
      )
    ),
  },

  // Ma NEC cua TV Hisense (dia chi 0xBF00). Lay tu Flipper-IRDB (EN3Y39H, 32A4HAU), CHUA thu tren TV that.
  hisense_tv: {
    name: "Hisense TV",
    icon: "mdi:television",
    color: "#6AA9F0",
    protocol: "nec",
    address: 0xbf00,
    repeats: 1,
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    ...tvLayout(
      mapValues(
        {
          power: 0x0d, source: 0x12,
          num_1: 0x01, num_2: 0x02, num_3: 0x03, num_4: 0x04, num_5: 0x05,
          num_6: 0x06, num_7: 0x07, num_8: 0x08, num_9: 0x09, num_0: 0x00,
          info: 0x0c,
          vol_up: 0x44, vol_down: 0x43, mute: 0x0e, home: 0x20, ch_up: 0x4a, ch_down: 0x4b,
          menu: 0x14, guide: 0x3a, return: 0x48, exit: 0x5c,
          up: 0x16, down: 0x17, left: 0x19, right: 0x18, ok: 0x15,
          red: 0x52, green: 0x53, yellow: 0x54, blue: 0x55,
          rewind: 0x58, play: 0xa8, pause: 0xa9, stop: 0x5a, fast_forward: 0x59,
        },
        (code) => ({ command: nec(code) })
      )
    ),
  },

  // TV TCL dung giao thuc RCA (dia chi 0x0F), gui qua send_pronto. Lay tu Flipper-IRDB (65C635K),
  // CHUA thu tren TV that.
  tcl_tv: {
    name: "TCL TV",
    icon: "mdi:television",
    color: "#6AA9F0",
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    ...tvLayout(
      mapValues(
        {
          power: 0x54, source: 0xc5,
          num_1: 0x8c, num_2: 0x4c, num_3: 0xcc, num_4: 0x2c, num_5: 0xac,
          num_6: 0x6c, num_7: 0xec, num_8: 0x1c, num_9: 0x9c, num_0: 0x0c,
          info: 0x3c,
          vol_up: 0xf4, vol_down: 0x74, mute: 0xfc, home: 0x10, ch_up: 0xb4, ch_down: 0x34,
          menu: 0x37, guide: 0x58, return: 0xe4, exit: 0x60,
          up: 0x9a, down: 0x1a, left: 0x6a, right: 0xea, ok: 0x2f,
          red: 0x00, green: 0x17, yellow: 0x27, blue: 0x1b,
          rewind: 0xb8, play: 0xa8, pause: 0x98, fast_forward: 0x38,
        },
        (code) => ({ pronto: rca(0x0f, code) })
      )
    ),
  },

  // TV Panasonic dung giao thuc Kaseikyo (thiet bi 128, thiet bi phu 0), gui qua send_pronto.
  // Lay tu irdb (Panasonic/TV/128,0), CHUA thu tren TV that.
  panasonic_tv: {
    name: "Panasonic TV",
    icon: "mdi:television",
    color: "#6AA9F0",
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    ...tvLayout(
      mapValues(
        {
          power: 61, source: 5,
          num_1: 16, num_2: 17, num_3: 18, num_4: 19, num_5: 20,
          num_6: 21, num_7: 22, num_8: 23, num_9: 24, num_0: 25,
          pre_ch: 55, info: 57,
          vol_up: 32, vol_down: 33, mute: 50, ch_up: 52, ch_down: 53,
          menu: 82, return: 212, exit: 211,
          up: 74, down: 75, left: 78, right: 79, ok: 73,
          red: 112, green: 113, yellow: 114, blue: 115,
        },
        (code) => ({ pronto: kaseikyo(128, 0, code) })
      )
    ),
  },

  // Quat Senko (remote 12 bit, nhieu quat Viet Nam dung chung chip nay), gui qua send_pronto.
  // Giai ma tu ban ghi remote that trong Flipper-IRDB (Senko TR828), CHUA thu tren quat that.
  senko_fan: {
    name: "Senko Fan",
    icon: "mdi:fan",
    color: "#5CC8BE",
    button_height: 64,
    power: "off",
    quick: ["on", "swing", "timer"],
    buttons: [
      { id: "on", icon: "mdi:fan-plus", label: "ON/SPEED", pronto: fan12(0xd82) },
      { id: "off", icon: "mdi:power", pronto: fan12(0xd81), color: "#e53935" },
      { id: "swing", icon: "mdi:arrow-oscillating", label: "SWING", pronto: fan12(0xd90) },
      { id: "mode", icon: "mdi:fan-auto", label: "MODE", pronto: fan12(0xd84) },
      { id: "timer", icon: "mdi:timer-outline", label: "TIMER", pronto: fan12(0xd88) },
      { id: "lamp", icon: "mdi:lightbulb-on", label: "LAMP", pronto: fan12(0xdc3) },
    ],
  },

  // Quat Mitsubishi, gui qua send_pronto. Giai ma tu ban ghi remote that trong Flipper-IRDB (R30J-HRV),
  // CHUA thu tren quat that.
  mitsubishi_fan: {
    name: "Mitsubishi Fan",
    icon: "mdi:fan",
    color: "#5CC8BE",
    button_height: 64,
    power: "power",
    quick: ["swing", "speed", "off_timer"],
    buttons: [
      { id: "speed", icon: "mdi:fan-plus", label: "SPEED", pronto: mitsubishiFan("c4d3682201914005") },
      { id: "power", icon: "mdi:power", pronto: mitsubishiFan("c4d3682201918009"), color: "#e53935" },
      { id: "swing", icon: "mdi:arrow-oscillating", label: "SWING", pronto: mitsubishiFan("c4d368220191c00d") },
      { id: "on_timer", icon: "mdi:timer-play-outline", label: "ON TIMER", pronto: mitsubishiFan("c4d3682201915004") },
      { spacer: true },
      { id: "off_timer", icon: "mdi:timer-off-outline", label: "OFF TIMER", pronto: mitsubishiFan("c4d3682201912003") },
    ],
  },

  // TV Sharp Aquos (giao thuc Sharp, dia chi 1 va 17), gui qua send_pronto.
  // Lay tu Flipper-IRDB (remote LC-RC1-16), CHUA thu tren TV that.
  sharp_tv: {
    name: "Sharp TV",
    icon: "mdi:television",
    color: "#6AA9F0",
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    ...tvLayout(
      mapValues(
        {
          power: [1, 0x16], source: [1, 0x13], num_1: [1, 0x01], num_2: [1, 0x02], num_3: [1, 0x03],
          num_4: [1, 0x04], num_5: [1, 0x05], num_6: [1, 0x06], num_7: [1, 0x07], num_8: [1, 0x08],
          num_9: [1, 0x09], num_0: [1, 0x0a], info: [17, 0x28], vol_up: [1, 0x14], vol_down: [1, 0x15],
          mute: [1, 0x17], home: [17, 0x27], ch_up: [1, 0x11], ch_down: [1, 0x12], menu: [1, 0x20],
          exit: [1, 0xf3], up: [1, 0x57], down: [1, 0x58], left: [1, 0xf5], right: [1, 0xf6],
          ok: [1, 0xf7], rewind: [17, 0xc4], play: [17, 0xc2], pause: [17, 0xcd], stop: [17, 0xc3],
          fast_forward: [17, 0xc5],
        },
        ([address, command]) => ({ pronto: sharp(address, command) })
      )
    ),
  },

  // Quat KDK (K14X5, K14Y5). Lay tu Flipper-IRDB, CHUA thu tren quat that.
  kdk_fan: {
    name: "KDK Fan",
    icon: "mdi:fan",
    color: "#5CC8BE",
    button_height: 64,
    power: "power",
    quick: ["speed_1", "speed_2", "speed_3"],
    buttons: [
      { id: "power", icon: "mdi:power", pronto: kdkFan("40040b210c8caa"), color: "#e53935" },
      { id: "sleep", icon: "mdi:weather-night", label: "SLEEP", pronto: kdkFan("40040b210c7254") },
      { id: "off_timer", icon: "mdi:timer-off-outline", label: "OFF TIMER", pronto: kdkFan("40040b210c0224") },
      { id: "speed_1", icon: "mdi:fan-speed-1", label: "SPEED 1", pronto: kdkFan("40040b210c84a2") },
      { id: "speed_2", icon: "mdi:fan-speed-2", label: "SPEED 2", pronto: kdkFan("40040b210c4462") },
      { id: "speed_3", icon: "mdi:fan-speed-3", label: "SPEED 3", pronto: kdkFan("40040b210cc4e2") },
      { id: "timer_1h", icon: "mdi:timer-outline", label: "1H", pronto: kdkFan("40040b210c82a4") },
      { id: "timer_3h", icon: "mdi:timer-outline", label: "3H", pronto: kdkFan("40040b210cc2e4") },
      { id: "timer_6h", icon: "mdi:timer-outline", label: "6H", pronto: kdkFan("40040b210c6244") },
    ],
  },

  // May chieu: deu dung NEC mo rong. Lay tu Flipper-IRDB, CHUA thu tren may that.
  // Epson (dia chi 0x5583): nut nguon bat may; khi tat, may hoi lai va can bam them lan nua.
  epson_projector: {
    name: "Epson",
    icon: "mdi:projector",
    color: "#6AA9F0",
    protocol: "nec",
    address: 0x5583,
    repeats: 1,
    button_height: 54,
    power: "power",
    quick: ["source", "vol_down", "vol_up"],
    ...projectorLayout(
      mapValues(
        {
          power: 0x90, source: 0x8c, home: 0x95, menu: 0x9a,
          up: 0xb0, down: 0xb2, left: 0xb3, right: 0xb1, ok: 0x85,
          vol_up: 0x98, vol_down: 0x99, play: 0x5e, pause: 0x5b, stop: 0x59,
          freeze: 0x92, hdmi_1: 0x73, hdmi_2: 0x77, lan: 0x74, zoom_in: 0x88, zoom_out: 0x89,
        },
        (code) => ({ command: nec(code) })
      ),
      [
        ["hdmi_1", "mdi:video-input-hdmi", "HDMI 1"],
        ["hdmi_2", "mdi:video-input-hdmi", "HDMI 2"],
        ["lan", "mdi:lan", "LAN"],
        ["freeze", "mdi:snowflake", "FREEZE"],
        ["zoom_out", "mdi:magnify-minus-outline", "ZOOM −"],
        ["zoom_in", "mdi:magnify-plus-outline", "ZOOM +"],
        ["play", "mdi:play", "PLAY"],
        ["pause", "mdi:pause", "PAUSE"],
        ["stop", "mdi:stop", "STOP"],
      ]
    ),
  },

  // BenQ (W1070 va cac may cung remote, dia chi 0x3000): nut nguon chi bat, tat bang nut OFF rieng.
  benq_projector: {
    name: "BenQ",
    icon: "mdi:projector",
    color: "#6AA9F0",
    protocol: "nec",
    address: 0x3000,
    repeats: 1,
    button_height: 54,
    power: "power",
    quick: ["power_off", "source", "mute"],
    ...projectorLayout(
      mapValues(
        {
          power: 0x4f, power_off: 0x4e, source: 0x04, menu: 0x0f, mute: 0x14,
          up: 0x0b, down: 0x0c, left: 0x0d, right: 0x0e, ok: 0x10,
          vol_down: 0x0d, vol_up: 0x0e,
          hdmi_1: 0x58, hdmi_2: 0x59, blank: 0x07, auto: 0x08, aspect: 0x13, freeze: 0x03,
        },
        (code) => ({ command: nec(code) })
      ),
      [
        ["power_off", "mdi:power-off", "OFF"],
        ["hdmi_1", "mdi:video-input-hdmi", "HDMI 1"],
        ["hdmi_2", "mdi:video-input-hdmi", "HDMI 2"],
        ["blank", "mdi:projector-off", "BLANK"],
        ["freeze", "mdi:snowflake", "FREEZE"],
        ["aspect", "mdi:aspect-ratio", "ASPECT"],
        ["auto", "mdi:auto-fix", "AUTO"],
      ]
    ),
  },

  // ViewSonic (PA503W va cac may cung remote, dia chi 0xF483): nut nguon chi bat, tat bang nut OFF rieng.
  viewsonic_projector: {
    name: "ViewSonic",
    icon: "mdi:projector",
    color: "#6AA9F0",
    protocol: "nec",
    address: 0xf483,
    repeats: 1,
    button_height: 54,
    power: "power",
    quick: ["power_off", "source", "mute"],
    ...projectorLayout(
      mapValues(
        {
          power: 0x4f, power_off: 0x4e, source: 0x40, menu: 0x30, info: 0x97, exit: 0x28, mute: 0x14,
          up: 0x0b, down: 0x0c, left: 0x0e, right: 0x0f, ok: 0x15,
          vol_up: 0x82, vol_down: 0x83,
          hdmi_1: 0x58, blank: 0x07, auto: 0x08, aspect: 0x13, freeze: 0x03, eco: 0x2b,
        },
        (code) => ({ command: nec(code) })
      ),
      [
        ["power_off", "mdi:power-off", "OFF"],
        ["hdmi_1", "mdi:video-input-hdmi", "HDMI"],
        ["exit", "mdi:exit-to-app", "EXIT"],
        ["blank", "mdi:projector-off", "BLANK"],
        ["freeze", "mdi:snowflake", "FREEZE"],
        ["aspect", "mdi:aspect-ratio", "ASPECT"],
        ["auto", "mdi:auto-fix", "AUTO"],
        ["eco", "mdi:leaf", "ECO"],
        ["info", "mdi:information-outline", "INFO"],
      ]
    ),
  },

  // Optoma doi cu (dia chi 0x504F). May Optoma doi moi dung bo ma khac.
  optoma_projector: {
    name: "Optoma",
    icon: "mdi:projector",
    color: "#6AA9F0",
    protocol: "nec",
    address: 0x504f,
    repeats: 1,
    button_height: 54,
    power: "power",
    quick: ["blank", "vol_down", "vol_up"],
    ...projectorLayout(
      mapValues(
        {
          power: 0x02, menu: 0x11,
          up: 0x13, down: 0x14, left: 0x16, right: 0x15, ok: 0x17,
          vol_up: 0x07, vol_down: 0x0a,
          blank: 0x03, auto: 0x04, freeze: 0x0c, keystone_up: 0x08, keystone_down: 0x0b,
        },
        (code) => ({ command: nec(code) })
      ),
      [
        ["blank", "mdi:projector-off", "HIDE"],
        ["freeze", "mdi:snowflake", "FREEZE"],
        ["auto", "mdi:auto-fix", "RESYNC"],
        ["keystone_down", "mdi:perspective-less", "KEYSTONE −"],
        ["keystone_up", "mdi:perspective-more", "KEYSTONE +"],
      ]
    ),
  },

  // Apple TV: lenh di qua mang bang remote.send_command (khong dung IR), trang thai lay tu media_player.
  // Pop-up co them o go chu (apple_tv.set_keyboard_text) va cac ung dung chon trong "apps".
  appletv: {
    kind: "media",
    domain: "media_player",
    transport: "remote",
    name: "Apple TV",
    icon: "mdi:apple",
    color: "#F08AA8",
    button_height: 54,
    off_states: ["off", "standby", "unavailable", "unknown"],
    default_quick: ["play_pause", "menu", "home"],
    keyboard: true,
    // Pop-up dung bo cuc vong tron dieu huong (_buildPadBody) thay cho luoi nut
    layout: "pad",
    pad: {
      ok: "select",
      main: ["menu", "play_pause", "home"],
      pairs: [["skip_backward", "skip_forward"], ["volume_down", "volume_up"]],
      round: "power",
    },
    buttons: [
      { id: "up", icon: "mdi:chevron-up", command: "up" },
      { id: "down", icon: "mdi:chevron-down", command: "down" },
      { id: "left", icon: "mdi:chevron-left", command: "left" },
      { id: "right", icon: "mdi:chevron-right", command: "right" },
      { id: "select", icon: "mdi:circle-outline", label: "OK", command: "select" },
      { id: "menu", icon: "mdi:arrow-u-left-top", label: "BACK", command: "menu" },
      { id: "play_pause", icon: "mdi:play-pause", command: "play_pause" },
      { id: "home", icon: "mdi:television", label: "TV", command: "home" },
      { id: "skip_backward", icon: "mdi:rewind-10", command: "skip_backward" },
      { id: "skip_forward", icon: "mdi:fast-forward-10", command: "skip_forward" },
      { id: "volume_down", icon: "mdi:volume-minus", command: "volume_down" },
      { id: "volume_up", icon: "mdi:volume-plus", command: "volume_up" },
      { id: "power", icon: "mdi:power", color: "#e53935", power: true },
    ],
  },

  // Khong phai bo ma IR: dieu khien mot entity climate (vi du climate IR cua ESPHome)
  climate: {
    kind: "climate",
    domain: "climate",
    name: "Air conditioner",
    icon: "mdi:air-conditioner",
    badge_icon: "mdi:thermometer",
    color: "#5CC4EA",
    button_height: 54,
  },

  // Den: do sang, nhiet do mau, mau va hieu ung, hien theo kha nang cua entity light
  light: {
    kind: "light",
    domain: "light",
    name: "Light",
    icon: "mdi:lightbulb",
    badge_icon: "mdi:brightness-6",
    color: "#F5C451",
    button_height: 54,
  },

  // Cua cuon, rem, cua gara: mo / dung / dong va vi tri, hien theo kha nang cua entity cover
  cover: {
    kind: "cover",
    domain: "cover",
    name: "Roller door",
    icon: "mdi:window-shutter",
    color: "#8FB8DE",
    button_height: 54,
    on_states: ["open", "opening", "closing"],
  },

  // ----- Thiet bi thong minh khai bao bang bang (kind "smart") -----
  //   tap(state): id hanh dong khi bam icon ("toggle" = bat / tat), bo trong thi mo pop-up
  //   toggle: cap action [bat, tat] neu khong phai turn_on / turn_off
  //   actions(state, on): cac nut; "feature" da loc san bang has(); row: hang trong pop-up
  //     confirm: hoi lai truoc khi lam; code: can ma neu entity co code_format
  //   sliders / chips: thanh truot va hang lua chon trong pop-up; quick_chips: nhom lua chon dau tien
  //     cung dung lam nut nhanh (id "mode:<gia tri>")
  //   badge(state): chu o goc phai; badge_state: khong co thi hien trang thai
  lock: {
    kind: "smart",
    domain: "lock",
    name: "Door lock",
    icon: "mdi:lock",
    color: "#F2A65A",
    on_states: ["unlocked", "unlocking", "open", "opening", "jammed"],
    badge_state: true,
    default_quick: ["lock", "unlock"],
    tap: (s) => (s.state === "locked" ? "unlock" : "lock"),
    actions: (s) => [
      { id: "lock", icon: "mdi:lock", service: "lock", active: s.state === "locked", code: true },
      { id: "unlock", icon: "mdi:lock-open-variant", service: "unlock", active: s.state === "unlocked", confirm: true, code: true },
      has(s, 1) && { id: "open", icon: "mdi:door-open", service: "open", active: s.state === "open", confirm: true, code: true },
    ],
  },

  smart_fan: {
    kind: "smart",
    domain: "fan",
    name: "Fan",
    icon: "mdi:fan",
    color: "#5CC8BE",
    default_quick: ["percentage", "oscillate"],
    quick_chips: true,
    tap: () => "toggle",
    badge: (s) => (s.state === "on" && s.attributes.percentage != null ? `${s.attributes.percentage}%` : ""),
    actions: (s, on) => {
      const pct = on ? s.attributes.percentage : null;
      const speed = (id, icon, value, above) =>
        has(s, 1) && {
          id,
          icon,
          service: "set_percentage",
          data: { percentage: value },
          active: pct != null && pct > above && pct <= value,
        };
      return [
        speed("low", "mdi:fan-speed-1", 33, 0),
        speed("medium", "mdi:fan-speed-2", 66, 33),
        speed("high", "mdi:fan-speed-3", 100, 66),
        { id: "power", icon: "mdi:power", service: "toggle", active: on, row: 1 },
        has(s, 2) && {
          id: "oscillate",
          icon: "mdi:arrow-oscillating",
          service: "oscillate",
          data: { oscillating: !s.attributes.oscillating },
          active: !!s.attributes.oscillating,
          row: 1,
        },
        has(s, 4) && {
          id: "direction",
          icon: "mdi:swap-horizontal",
          service: "set_direction",
          data: { direction: s.attributes.direction === "reverse" ? "forward" : "reverse" },
          active: s.attributes.direction === "reverse",
          row: 1,
        },
      ];
    },
    sliders: [
      {
        key: "percentage",
        label: "slider_fan_speed",
        feature: 1,
        min: 0,
        max: 100,
        unit: "%",
        value: (a, s) => (s.state === "on" ? a.percentage : 0),
        service: "set_percentage",
        data: (value) => ({ percentage: value }),
      },
    ],
    chips: [{ attribute: "preset_mode", list: "preset_modes", service: "set_preset_mode", feature: 8 }],
  },

  media_player: {
    kind: "smart",
    media: true,
    domain: "media_player",
    name: "Media player",
    icon: "mdi:speaker",
    color: "#B394E8",
    off_states: ["off", "standby", "unavailable", "unknown"],
    now_playing: true,
    default_quick: ["play_pause", "vol_down", "vol_up"],
    tap: (s) => (has(s, 128) || has(s, 256) ? "toggle" : "play_pause"),
    actions: (s, on) => {
      const playing = s.state === "playing";
      const muted = !!s.attributes.is_volume_muted;
      const volume = has(s, 1024) || has(s, 4);
      return [
        has(s, 16) && { id: "previous", icon: "mdi:skip-previous", service: "media_previous_track" },
        (has(s, 16384) || has(s, 1)) && {
          id: "play_pause",
          icon: playing ? "mdi:pause" : "mdi:play",
          service: "media_play_pause",
          active: playing,
        },
        has(s, 32) && { id: "next", icon: "mdi:skip-next", service: "media_next_track" },
        volume && { id: "vol_down", icon: "mdi:volume-minus", service: "volume_down", row: 1 },
        has(s, 8) && {
          id: "mute",
          icon: muted ? "mdi:volume-off" : "mdi:volume-high",
          service: "volume_mute",
          data: { is_volume_muted: !muted },
          active: muted,
          row: 1,
        },
        volume && { id: "vol_up", icon: "mdi:volume-plus", service: "volume_up", row: 1 },
        (has(s, 128) || has(s, 256)) && { id: "power", icon: "mdi:power", service: "toggle", active: on, row: 1 },
      ];
    },
    sliders: [
      {
        key: "volume",
        label: "slider_volume",
        feature: 4,
        min: 0,
        max: 100,
        unit: "%",
        value: (a) => (a.volume_level != null ? Math.round(a.volume_level * 100) : null),
        service: "volume_set",
        data: (value) => ({ volume_level: value / 100 }),
      },
    ],
    chips: [
      { attribute: "source", list: "source_list", service: "select_source", feature: 2048 },
      { attribute: "sound_mode", list: "sound_mode_list", service: "select_sound_mode", feature: 65536 },
    ],
  },

  water_heater: {
    kind: "smart",
    domain: "water_heater",
    name: "Water heater",
    icon: "mdi:water-boiler",
    color: "#EF8A80",
    off_states: ["off", "unavailable", "unknown"],
    quick_chips: true,
    tap: (s) => (has(s, 8) ? "toggle" : null),
    badge: (s) => (s.attributes.temperature != null ? `${s.attributes.temperature} °C` : ""),
    badge_state: true,
    actions: (s, on) => [has(s, 8) && { id: "power", icon: "mdi:power", service: "toggle", active: on }],
    sliders: [
      {
        key: "temperature",
        label: "slider_temperature",
        feature: 1,
        min: (a) => a.min_temp ?? 30,
        max: (a) => a.max_temp ?? 75,
        step: (a) => a.target_temp_step || 1,
        unit: " °C",
        value: (a) => a.temperature,
        service: "set_temperature",
        data: (value) => ({ temperature: value }),
      },
    ],
    chips: [{ attribute: "operation_mode", list: "operation_list", service: "set_operation_mode", feature: 2 }],
  },

  humidifier: {
    kind: "smart",
    domain: "humidifier",
    name: "Humidifier",
    icon: "mdi:air-humidifier",
    color: "#64B5F6",
    quick_chips: true,
    default_quick: ["humidity"],
    tap: () => "toggle",
    badge: (s) => (s.state === "on" && s.attributes.humidity != null ? `${s.attributes.humidity}%` : ""),
    actions: (s, on) => [{ id: "power", icon: "mdi:power", service: "toggle", active: on }],
    sliders: [
      {
        key: "humidity",
        label: "slider_humidity",
        min: (a) => a.min_humidity ?? 0,
        max: (a) => a.max_humidity ?? 100,
        unit: "%",
        value: (a) => a.humidity,
        service: "set_humidity",
        data: (value) => ({ humidity: value }),
      },
    ],
    chips: [{ attribute: "mode", list: "available_modes", service: "set_mode", feature: 1 }],
  },

  alarm: {
    kind: "smart",
    domain: "alarm_control_panel",
    name: "Alarm",
    icon: "mdi:shield-home",
    color: "#EF8A80",
    on_states: ["armed_home", "armed_away", "armed_night", "armed_vacation", "armed_custom_bypass", "arming", "pending", "triggered"],
    badge_state: true,
    default_quick: ["arm_home", "arm_away", "disarm"],
    actions: (s) => {
      const arm = (id, icon, feature) =>
        has(s, feature) && {
          id: `arm_${id}`,
          icon,
          service: `alarm_arm_${id}`,
          active: s.state === `armed_${id}`,
          code: s.attributes.code_arm_required !== false,
        };
      return [
        arm("home", "mdi:shield-home", 1),
        arm("away", "mdi:shield-lock", 2),
        arm("night", "mdi:shield-moon", 4),
        arm("vacation", "mdi:shield-airplane", 32),
        { id: "disarm", icon: "mdi:shield-off", service: "alarm_disarm", active: s.state === "disarmed", code: true, row: 1 },
      ];
    },
  },

  valve: {
    kind: "smart",
    domain: "valve",
    name: "Water valve",
    icon: "mdi:pipe-valve",
    color: "#64B5F6",
    on_states: ["open", "opening", "closing"],
    badge: (s) => (s.attributes.current_position != null ? `${s.attributes.current_position}%` : ""),
    badge_state: true,
    toggle: ["open_valve", "close_valve"],
    default_quick: ["position"],
    tap: () => "toggle",
    actions: (s) => [
      has(s, 1) && { id: "open", icon: "mdi:valve-open", service: "open_valve", active: s.state === "opening" },
      has(s, 8) && { id: "stop", icon: "mdi:stop", service: "stop_valve" },
      has(s, 2) && { id: "close", icon: "mdi:valve-closed", service: "close_valve", active: s.state === "closing" },
    ],
    sliders: [
      {
        key: "position",
        label: "slider_position",
        feature: 4,
        min: 0,
        max: 100,
        unit: "%",
        value: (a) => a.current_position,
        service: "set_valve_position",
        data: (value) => ({ position: value }),
      },
    ],
  },

  lawn_mower: {
    kind: "smart",
    domain: "lawn_mower",
    name: "Lawn mower",
    icon: "mdi:robot-mower",
    color: "#81C995",
    on_states: ["mowing", "returning", "paused"],
    badge_state: true,
    actions: (s) => [
      has(s, 1) && { id: "start", icon: "mdi:play", service: "start_mowing", active: s.state === "mowing" },
      has(s, 2) && { id: "pause", icon: "mdi:pause", service: "pause", active: s.state === "paused" },
      has(s, 4) && { id: "dock", icon: "mdi:home-import-outline", service: "dock", active: s.state === "returning" },
    ],
  },

  // O cam / cong tac: bam icon la bat tat; cong suat hien bang "badge_entity", nut them bang "quick" / "controls"
  switch: {
    kind: "entity",
    toggle: true,
    domain: "switch",
    domains: ["switch", "input_boolean"],
    name: "Socket",
    icon: "mdi:power-socket",
    color: "#81C995",
    button_height: 54,
    on_states: ["on"],
  },

  // Robot hut bui: card theo entity vacuum, nut nhanh va nut pop-up khai bao bang "quick" / "controls"
  vacuum: {
    kind: "entity",
    domain: "vacuum",
    name: "Robot vacuum",
    icon: "mdi:robot-vacuum",
    color: "#B394E8",
    button_height: 54,
    on_states: ["cleaning", "returning", "paused"],
    // Nut nhanh mac dinh: dung don va quay ve dock
    default_quick: [{ icon: "mdi:home-import-outline", service: "vacuum.return_to_base" }],
  },

  // Camera: pop-up co hinh truc tiep, phia duoi la luoi nut khai bao bang "controls"
  camera: {
    kind: "entity",
    domain: "camera",
    name: "Camera",
    icon: "mdi:cctv",
    color: "#6AA9F0",
    button_height: 54,
    on_states: [],
    live: true,
  },
};

// Loai thiet bi -> mau co san. Form chon theo 2 buoc: loai thiet bi, roi mau remote hong ngoai.
// "models" tro toi cac bo ma trong REMOTES; "remote" la loai chi co mot kieu, dieu khien theo entity.
// "brands": ten hang cua tung mau co san, trung voi ten hang trong kho ma de hai nguon nam chung mot muc.
// Loai khong co "models" chi lay ma tu kho.
const IR_DEVICES = {
  fan: { name: "Fan", icon: "mdi:fan", color: "#5CC8BE",
    models: { hsv: "hsv_fan", toshiba: "toshiba_fan", senko: "senko_fan", mitsubishi: "mitsubishi_fan", kdk: "kdk_fan" },
    brands: { hsv: "HSV", toshiba: "Toshiba", senko: "Senko", mitsubishi: "Mitsubishi", kdk: "KDK" } },
  speaker: { name: "Speaker", icon: "mdi:soundbar", color: "#B394E8", models: { lg: "lg_soundbar" }, brands: { lg: "LG" } },
  tv: { name: "TV", icon: "mdi:television", color: "#6AA9F0",
    brands: { samsung: "Samsung", lg: "LG", sony: "Sony", tcl: "TCL", panasonic: "Panasonic", toshiba: "Toshiba", hisense: "Hisense", sharp: "Sharp" },
    models: {
      samsung: "samsung_tv",
      lg: "lg_tv",
      sony: "sony_tv",
      tcl: "tcl_tv",
      panasonic: "panasonic_tv",
      toshiba: "toshiba_tv",
      hisense: "hisense_tv",
      sharp: "sharp_tv",
    }, },
  projector: { name: "Projector", icon: "mdi:projector", color: "#6AA9F0",
    brands: { epson: "Epson", benq: "BenQ", viewsonic: "ViewSonic", optoma: "Optoma" },
    models: {
      epson: "epson_projector",
      benq: "benq_projector",
      viewsonic: "viewsonic_projector",
      optoma: "optoma_projector",
    }, },
  receiver: { name: "AV receiver / amplifier", icon: "mdi:audio-video", color: "#B394E8", models: {} },
  stb: { name: "Set-top box / tuner", icon: "mdi:set-top-box", color: "#6AA9F0", models: {} },
  streamer: { name: "Streaming box", icon: "mdi:cast", color: "#F08AA8", models: {} },
  player: { name: "Disc player", icon: "mdi:disc-player", color: "#6AA9F0", models: {} },
  led: { name: "LED light / LED strip", icon: "mdi:led-strip-variant", color: "#F5C451", models: {} },
  purifier: { name: "Air purifier", icon: "mdi:air-purifier", color: "#5CC8BE", models: {} },
  heater: { name: "Heater", icon: "mdi:radiator", color: "#EF8A80", models: {} },
  humidifier_ir: { name: "Humidifier", icon: "mdi:air-humidifier", color: "#64B5F6", models: {}, db: "humidifier" },
  vacuum_ir: { name: "Robot vacuum", icon: "mdi:robot-vacuum", color: "#B394E8", models: {}, db: "vacuum" },
  monitor: { name: "Monitor", icon: "mdi:monitor", color: "#6AA9F0", models: {} },
};

// Hang va bo ma cua mot loai thiet bi: mau co san dung truoc, roi toi cac bo ma trong kho
const dbType = (device) => (IR_DEVICES[device] || {}).db || device;
function irBrands(device) {
  const meta = IR_DEVICES[device] || {};
  const names = new Set(Object.values(meta.brands || {}));
  for (const brand of Object.keys((CODES && CODES.types[dbType(device)]) || {})) names.add(brand);
  return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}
function irCodesets(device, brand) {
  const meta = IR_DEVICES[device] || {};
  const builtin = Object.entries(meta.brands || {})
    .filter(([, name]) => name === brand)
    .map(([model]) => ({ value: `builtin:${model}`, label: `${REMOTES[meta.models[model]].name} (${tr("codeset_builtin")})` }));
  const sets = ((CODES && CODES.types[dbType(device)]) || {})[brand] || [];
  return [...builtin, ...sets.map((set) => ({ value: set.i, label: `${set.n} (${Object.keys(set.k).length + (set.x || []).length})` }))];
}

// Thiet bi thong minh: dieu khien theo entity, card biet trang thai that
const SMART_DEVICES = {
  climate: { name: "Air conditioner", remote: "climate" },
  light: { name: "Light", remote: "light" },
  cover: { name: "Roller door / curtain", remote: "cover" },
  lock: { name: "Door lock", remote: "lock" },
  fan: { name: "Fan", remote: "smart_fan" },
  switch: { name: "Socket / switch", remote: "switch" },
  media_player: { name: "Speaker / smart TV", remote: "media_player" },
  appletv: { name: "Apple TV", remote: "appletv" },
  water_heater: { name: "Water heater", remote: "water_heater" },
  humidifier: { name: "Humidifier / dehumidifier", remote: "humidifier" },
  vacuum: { name: "Robot vacuum", remote: "vacuum" },
  camera: { name: "Camera", remote: "camera" },
  alarm: { name: "Alarm", remote: "alarm" },
  valve: { name: "Water valve", remote: "valve" },
  lawn_mower: { name: "Lawn mower", remote: "lawn_mower" },
};

// Card cu nhan ca hai nhom; ten trung nhau ("fan") thi la thiet bi hong ngoai nhu truoc nay
const ALL_DEVICES = { ...SMART_DEVICES, ...IR_DEVICES };
const devicesFor = (flavour) => (flavour === "ir" ? IR_DEVICES : flavour === "smart" ? SMART_DEVICES : ALL_DEVICES);

// Khoa trong REMOTES ung voi cau hinh: kieu moi (device + model) hoac kieu cu (remote)
function remoteKey(config, flavour) {
  if (!config.device) return config.remote;
  const device = devicesFor(flavour)[config.device];
  if (!device) return undefined;
  return device.remote || device.models[config.model] || Object.values(device.models)[0];
}

// Suy ra { device, model } tu cau hinh, ke ca cau hinh cu chi co "remote"
function deviceOf(config, flavour) {
  if (config.device) return { device: config.device, model: config.model };
  for (const [device, item] of Object.entries(devicesFor(flavour))) {
    if (item.remote === config.remote) return { device };
    for (const [model, key] of Object.entries(item.models || {})) {
      if (key === config.remote) return { device, model };
    }
  }
  return {};
}

// Nut gan voi mot entity (dung trong "quick" va "controls"). Viet tat: chi ghi entity id.
//   { entity, name, icon, color, action, path, service, data, confirm, wide }
//   action mac dinh theo domain: button -> press; switch/light/siren... -> toggle; con lai -> more-info
//   service: goi mot action cua HA (vd. vacuum.return_to_base) len entity cua nut, hoac entity cua card
const TOGGLE_DOMAINS = ["switch", "light", "siren", "fan", "input_boolean", "cover", "humidifier"];
const normalizeControl = (spec) => (typeof spec === "string" ? { entity: spec } : spec);

// Ten mau cua Home Assistant (o chon mau trong form tra ve ten, vd. "teal") -> gia tri CSS.
// Gia tri khac (#hex, rgb(), var()) duoc dung nguyen.
function cssColor(value) {
  if (!value) return undefined;
  if (value === "primary" || value === "accent") return `var(--${value}-color)`;
  return /^[a-z]+(-[a-z]+)*$/.test(value) ? `var(--${value}-color)` : value;
}

// Icon cho cac ung dung pho bien (so khop theo ten viet thuong). Ung dung khac dung icon chung;
// dat icon rieng bang cach khai bao apps: [{ name: "Infuse", icon: "mdi:play-box" }].
const APP_ICONS = {
  youtube: "mdi:youtube",
  netflix: "mdi:netflix",
  spotify: "mdi:spotify",
  plex: "mdi:plex",
  twitch: "mdi:twitch",
  tv: "mdi:television-classic",
  music: "mdi:music",
  podcasts: "mdi:podcast",
  photos: "mdi:image-multiple",
  settings: "mdi:cog",
  search: "mdi:magnify",
  "app store": "mdi:store",
  arcade: "mdi:gamepad-variant",
  facetime: "mdi:video",
  fitness: "mdi:run",
  computers: "mdi:monitor",
  speedtest: "mdi:speedometer",
  infuse: "mdi:play-box",
  "disney+": "mdi:castle",
  "prime video": "mdi:amazon",
  kodi: "mdi:kodi",
  vlc: "mdi:vlc",
  steam: "mdi:steam",
};
const DEFAULT_APP_ICON = "mdi:application";

const OFFLINE_STATES = ["unavailable", "unknown"];
const OFF_STATES = ["off", "standby", "idle", "unavailable", "unknown"];
// Thu tu cung la thu tu uu tien khi chon 3 nut nhanh cua dieu hoa
const HVAC_ICONS = {
  cool: "mdi:snowflake",
  dry: "mdi:water-percent",
  fan_only: "mdi:fan",
  heat: "mdi:fire",
  heat_cool: "mdi:sun-snowflake-variant",
  auto: "mdi:thermostat-auto",
};

const CARD_CSS = `
  :host { display: block; }
  ha-card {
    height: var(--ir-remote-card-height, 102px);
    box-sizing: border-box;
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    transition: opacity 0.2s, background-color 0.2s;
  }
  ha-card.offline { opacity: 0.45; }
  /* hide_quick: an hang nut nhanh, card thap bang mot tile cua Home Assistant */
  ha-card.compact {
    height: var(--ir-remote-card-compact-height, 56px);
    justify-content: center;
    padding: 0 10px;
  }
  ha-card.compact .quick { display: none; }
  ha-card.compact .icon { width: 36px; height: 36px; --mdc-icon-size: 20px; }
  /* Camera mat ket noi: vien do thay vi lam mo */
  ha-card.alert {
    outline: 1.5px solid rgba(239, 138, 128, 0.6);
    outline-offset: -1.5px;
  }
  ha-card.alert .icon { color: #ef8a80; }
  ha-card.on {
    background: var(--card-on-background-color, color-mix(in srgb, var(--ir-accent) 22%, transparent));
    box-shadow: inset 0 0 0 1px var(--card-on-border-color, color-mix(in srgb, var(--ir-accent) 65%, transparent));
  }
  .top {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 42px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .icon {
    flex: none;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--card-off-icon-background-color, color-mix(in srgb, var(--ir-accent) 18%, transparent));
    color: var(--ir-accent);
    cursor: pointer;
    --mdc-icon-size: 24px;
  }
  ha-card.on .icon {
    /* Theme nen sang co the dat nen icon rieng (vd. xam nhat) thay vi pha mau thiet bi */
    background: var(--card-on-icon-background-color, color-mix(in srgb, var(--ir-accent) var(--card-on-icon-background-mix, 25%), transparent));
    color: var(--card-on-icon-color, var(--ir-accent));
  }
  .name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    /* Theme co the cho ten card dang TAT nhat hon (card BAT dung --card-on-text-color) */
    color: var(--card-off-text-color, var(--primary-text-color));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .badge {
    flex: none;
    display: none;
    align-items: center;
    height: 36px;
    padding: 0 9px;
    color: #ef9a9a;
    --mdc-icon-size: 18px;
  }
  .badge.show-icon { display: flex; }
  .badge.show-text {
    display: flex;
    height: 28px;
    padding: 0 10px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--primary-text-color);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
  .badge .text { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
  .badge.show-text ha-icon.remote, .badge.show-icon .text { display: none; }
  /* Icon tuy chon dung truoc chu trang thai (badge_icon) */
  .badge ha-icon.extra { display: none; margin-right: 4px; --mdc-icon-size: 14px; }
  .badge.show-text.has-icon ha-icon.extra { display: inline-flex; }
  .badge.icon-only { padding: 0 8px; }
  .badge.icon-only ha-icon.extra { margin-right: 0; }
  /* Trang thai dang chu mau, khong co nen (camera: Online / Offline) */
  ha-card .badge.plain {
    padding: 0 6px;
    background: none;
    font-size: 12px;
    font-weight: 600;
  }
  .quick {
    display: flex;
    gap: 8px;
    height: 36px;
  }
  .quick button {
    flex: 1 1 0;
    border: none;
    padding: 0;
    border-radius: 18px;
    background: var(--ir-remote-quick-background, rgba(255, 255, 255, 0.1));
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    --mdc-icon-size: 20px;
    transition: transform 0.1s, filter 0.1s;
    -webkit-tap-highlight-color: transparent;
    min-width: 0;
    gap: 5px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
  }
  /* Thanh truot nam trong hang nut nhanh */
  .quick .slider {
    -webkit-appearance: none;
    appearance: none;
    flex: 4 1 0;
    min-width: 0;
    height: 36px;
    margin: 0;
    border: none;
    border-radius: 18px;
    background: linear-gradient(
      to right,
      color-mix(in srgb, var(--ir-accent) 60%, transparent) var(--fill, 0%),
      var(--ir-remote-quick-background, rgba(255, 255, 255, 0.1)) var(--fill, 0%)
    );
    outline: none;
    cursor: pointer;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }
  .quick .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 6px;
    height: 22px;
    border-radius: 3px;
    background: #fff;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.45);
  }
  .quick .slider::-moz-range-thumb {
    width: 6px;
    height: 22px;
    border: none;
    border-radius: 3px;
    background: #fff;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.45);
  }
  .quick .slider::-moz-range-track { background: none; }
  /* Cham mau cua nut chon mau den */
  .quick button .swatch {
    flex: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--control-color);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  }
  .quick button span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ha-card.on .name { color: var(--card-on-text-color, var(--primary-text-color)); }
  /* Card dang BAT: nut va o trang thai pha mau cua thiet bi thay vi xam.
     Mau chu = mau thiet bi tron voi mau chu cua card, nen du tuong phan tren ca nen sang lan nen toi. */
  ha-card.on .quick button, ha-card.on .badge.show-text {
    background: var(--card-on-quick-background-color, color-mix(in srgb, var(--ir-accent) 16%, transparent));
    color: color-mix(in srgb, var(--ir-accent) 62%, var(--card-on-text-color, var(--primary-text-color)));
  }
  /* Nut chi co icon dung chung hang voi nut co chu: thu gon lai, nhuong cho cho chu */
  .quick button.compact { flex: 0 0 48px; }
  ha-card .quick button.active { background: var(--ir-accent); color: #fff; }
  /* Cong tac dang bat: nen pha mau nhe, vien va icon mang mau cua nut (hoac mau cua card).
     Khong dung nen trang de khoi nham voi card dang o trang thai BAT. */
  ha-card .quick button.active.control {
    background: color-mix(in srgb, var(--control-color, var(--ir-accent)) 24%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--control-color, var(--ir-accent)) 70%, transparent);
  }
  ha-card .quick button.active.control ha-icon,
  ha-card .quick button.active.control ha-state-icon {
    color: var(--control-color, var(--ir-accent));
  }
  button:active { transform: scale(0.95); filter: brightness(1.35); }
`;

const POPUP_CSS = `
  :host {
    position: fixed;
    inset: 0;
    /* Tren thanh tieu de cua HA, duoi cac hop thoai (more-info) */
    z-index: 6;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, system-ui, sans-serif));
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--bubble-backdrop-background-color, rgba(0, 0, 0, 0.3));
    opacity: 0;
    transition: opacity 0.25s;
    touch-action: none;
  }
  .sheet {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-width: 540px;
    /* Chua thanh trang thai / tai tho cua dien thoai o phia tren */
    height: calc(100% - max(env(safe-area-inset-top, 0px), var(--safe-area-inset-top, 0px)) - 12px);
    padding: 6px 14px calc(14px + env(safe-area-inset-bottom));
    overscroll-behavior: contain;
    border-radius: 28px 28px 0 0;
    background: var(--ir-remote-popup-background, var(--bubble-pop-up-main-background-color, var(--ha-card-background, var(--card-background-color, #222))));
    -webkit-backdrop-filter: blur(30px);
    backdrop-filter: blur(30px);
    color: var(--primary-text-color);
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (min-width: 768px) {
    .sheet { height: auto; min-height: 240px; max-height: 94%; }
  }
  :host(.open) .backdrop { opacity: 1; }
  :host(.open) .sheet { transform: translateY(0); }
  .sheet.dragging { transition: none; }
  /* Thanh nam: goi y vuot xuong de dong */
  .handle {
    width: 40px;
    height: 4px;
    margin: 0 auto 10px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.3);
  }
  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 50px;
    margin-bottom: 14px;
    padding: 4px;
    border-radius: 25px;
    background: rgba(127, 127, 127, 0.16);
    box-sizing: border-box;
  }
  .header .icon {
    flex: none;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ir-accent, #90a4ae) 18%, transparent);
    color: var(--ir-accent, #90a4ae);
    --mdc-icon-size: 24px;
  }
  .header .name {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .header .close {
    flex: none;
    width: 42px;
    height: 42px;
    border: none;
    padding: 0;
    border-radius: 50%;
    background: rgba(127, 127, 127, 0.2);
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    --mdc-icon-size: 22px;
  }
  .embedded { margin-bottom: 8px; }
  .embedded.stream ha-camera-stream {
    display: block;
    width: 100%;
    border-radius: 14px;
    overflow: hidden;
  }
  /* O go chu gui len thiet bi (Apple TV) */
  .keyboard {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 46px;
    margin-bottom: 8px;
    padding: 0 6px 0 14px;
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 14px;
    background: rgba(127, 127, 127, 0.16);
    --mdc-icon-size: 20px;
  }
  [hidden] { display: none !important; }
  /* Noi dung dang phat */
  .now-playing {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    padding: 8px;
    border-radius: 16px;
    background: rgba(127, 127, 127, 0.12);
  }
  .now-playing .art {
    flex: none;
    width: 56px;
    height: 56px;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ir-accent, #90a4ae) 18%, transparent);
    color: var(--ir-accent, #90a4ae);
    --mdc-icon-size: 28px;
  }
  .now-playing .art img { width: 100%; height: 100%; object-fit: cover; }
  .now-playing .info { flex: 1; min-width: 0; }
  .now-playing .title, .now-playing .sub {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .now-playing .title { font-size: 14px; font-weight: 600; }
  .now-playing .sub { margin-top: 3px; font-size: 12px; color: var(--secondary-text-color); }
  /* Vong tron dieu huong: bon huong tren vanh, OK o tam. Vi tri dat bang top/left (khong dung
     transform) de hieu ung bam button:active khong lam lech nut. */
  /* Vung nhan cu chi keo: rong het pop-up va tran ra tren duoi vong tron, de khong phai keo that trung */
  .pad-zone {
    margin: 0 -14px;
    padding: 26px 0 30px;
    touch-action: none;
  }
  .pad {
    position: relative;
    width: min(240px, 66vw);
    aspect-ratio: 1;
    margin: 0 auto;
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 50%;
    background: rgba(127, 127, 127, 0.16);
    touch-action: none;
  }
  .pad button {
    position: absolute;
    border: none;
    padding: 0;
    background: none;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    --mdc-icon-size: 34px;
    -webkit-tap-highlight-color: transparent;
  }
  .pad .up { top: 0; left: 30%; width: 40%; height: 32%; }
  .pad .down { bottom: 0; left: 30%; width: 40%; height: 32%; }
  .pad .left { left: 0; top: 30%; width: 32%; height: 40%; }
  .pad .right { right: 0; top: 30%; width: 32%; height: 40%; }
  .pad .ok {
    left: 31%;
    top: 31%;
    width: 38%;
    height: 38%;
    border: 1px solid color-mix(in srgb, var(--ir-accent, #90a4ae) 70%, transparent);
    border-radius: 50%;
    background: color-mix(in srgb, var(--ir-accent, #90a4ae) 24%, transparent);
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  /* Vong dieu huong khong co cu chi keo (camera xoay): chi can khoang cach tren duoi */
  .pad-static { padding: 16px 0 20px; }
  .pad-static .pad { width: min(210px, 58vw); touch-action: auto; }
  .pad .center {
    position: absolute;
    left: 31%;
    top: 31%;
    width: 38%;
    height: 38%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ir-accent, #90a4ae) 16%, transparent);
    color: var(--ir-accent, #90a4ae);
    --mdc-icon-size: 30px;
  }
  /* Cac nut duoi vong dieu huong: can deu hai mep pop-up, cung be rong voi cac phan khac */
  .btn-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .btn-row button {
    border: none;
    padding: 0;
    background: none;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.1s, filter 0.1s;
    -webkit-tap-highlight-color: transparent;
  }
  /* Nut lon chia deu chieu ngang */
  .btn-row > button {
    flex: 1;
    height: 56px;
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 18px;
    background: rgba(127, 127, 127, 0.16);
    --mdc-icon-size: 26px;
  }
  /* Cap nut ghep: hai nut lien quan nam chung mot vien thuoc (tua lui / toi, giam / tang am) */
  .btn-row .pair {
    flex: 1;
    display: flex;
    height: 48px;
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 24px;
    background: rgba(127, 127, 127, 0.16);
    overflow: hidden;
  }
  .btn-row .pair button { flex: 1; --mdc-icon-size: 22px; }
  .btn-row .pair button + button { border-left: 1px solid rgba(127, 127, 127, 0.22); }
  .btn-row > button.round {
    flex: none;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    --mdc-icon-size: 22px;
  }
  .btn-row.last { margin-bottom: 16px; }
  .btn-row.tall > button { height: 72px; --mdc-icon-size: 32px; }
  /* Nut dang co tac dung: den dang bat, cua dang mo / dang dong */
  .btn-row > button.on {
    border-color: color-mix(in srgb, var(--ir-accent) 70%, transparent);
    background: color-mix(in srgb, var(--ir-accent) 24%, transparent);
    color: var(--ir-accent);
  }
  /* Thanh truot (do sang, nhiet do mau, mau, vi tri cua) */
  .slider-row { margin-bottom: 12px; }
  .slider-head {
    display: flex;
    justify-content: space-between;
    margin: 0 6px 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--secondary-text-color);
  }
  .slider-head .value { color: var(--primary-text-color); }
  .slider {
    -webkit-appearance: none;
    appearance: none;
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 48px;
    margin: 0;
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 16px;
    background: linear-gradient(to right, var(--ir-accent) var(--fill, 0%), rgba(127, 127, 127, 0.16) var(--fill, 0%));
    outline: none;
    cursor: pointer;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }
  .slider.temp { background: linear-gradient(to right, #ffb35c, #fff4e0, #cfe2ff); }
  .slider.hue { background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 8px;
    height: 34px;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.45);
  }
  .slider::-moz-range-thumb {
    width: 8px;
    height: 34px;
    border: none;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.45);
  }
  .slider::-moz-range-track { background: none; }
  .swatches {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }
  .swatches button {
    aspect-ratio: 1;
    min-width: 0;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s, filter 0.1s;
    -webkit-tap-highlight-color: transparent;
  }
  /* Nut mo rong va phan phim phu */
  .more {
    width: 100%;
    height: 44px;
    margin-bottom: 10px;
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 22px;
    background: rgba(127, 127, 127, 0.16);
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    --mdc-icon-size: 20px;
    -webkit-tap-highlight-color: transparent;
  }
  .apps {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  .apps::-webkit-scrollbar { display: none; }
  .apps button {
    flex: none;
    display: flex;
    align-items: center;
    gap: 6px;
    --mdc-icon-size: 18px;
    height: 34px;
    padding: 0 14px 0 10px;
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 17px;
    background: rgba(127, 127, 127, 0.16);
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .apps button.active {
    background: color-mix(in srgb, var(--ir-accent) 24%, transparent);
    border-color: color-mix(in srgb, var(--ir-accent) 70%, transparent);
  }
  .offline-box {
    height: 180px;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1.5px dashed rgba(239, 138, 128, 0.55);
    border-radius: 14px;
    background: rgba(239, 138, 128, 0.1);
    color: #ef8a80;
    font-size: 13px;
    font-weight: 600;
    --mdc-icon-size: 44px;
  }
  .grid {
    display: grid;
    gap: 8px;
    margin-bottom: 8px;
  }
  .grid button {
    box-sizing: border-box;
    padding: 2px;
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 14px;
    background: rgba(127, 127, 127, 0.16);
    color: var(--primary-text-color);
    display: grid;
    grid-template-rows: 1fr min-content;
    row-gap: 1px;
    align-items: center;
    justify-items: center;
    cursor: pointer;
    font-family: inherit;
    transition: transform 0.1s, filter 0.1s;
    -webkit-tap-highlight-color: transparent;
  }
  /* Hanh dong dang co tac dung (dang khoa, dang phat, dang bat bao dong...) */
  .grid button.on {
    border-color: color-mix(in srgb, var(--ir-accent) 70%, transparent);
    background: color-mix(in srgb, var(--ir-accent) 24%, transparent);
  }
  .grid button.on ha-icon { color: var(--ir-accent); opacity: 1; }
  .grid button.highlight {
    background: rgba(170, 170, 185, 0.36);
    border-color: rgba(255, 255, 255, 0.4);
  }
  .grid button ha-icon { opacity: 0.9; }
  .grid button.highlight ha-icon { opacity: 1; }
  .grid button .label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2px;
    line-height: 1.15;
    padding-bottom: 5px;
  }
  button:active { transform: scale(0.95); filter: brightness(1.35); }
`;

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.appendChild(child);
  return node;
}

function icon(name) {
  return el("ha-icon", { icon: name });
}

// Ten cac node ESPHome co action esphome.<ten>_send_<giao thuc>
function findBlasters(hass) {
  const services = (hass && hass.services && hass.services.esphome) || {};
  const names = new Set();
  for (const service of Object.keys(services)) {
    const match = service.match(/^(.+)_send_[a-z0-9]+$/);
    if (match) names.add(match[1]);
  }
  return [...names].sort();
}

function resolveRemote(config, flavour) {
  if (config.custom) return config.custom;
  // Co "brand", hoac loai chi co trong kho ma: lay tu kho
  const ir = flavour !== "smart" && IR_DEVICES[config.device];
  if (ir && !config.remote && (config.brand || !Object.keys(ir.models).length)) return dbRemote(config);
  return REMOTES[remoteKey(config, flavour)];
}

// Moi nut co ma IR cua mot remote, theo thu tu trong pop-up
function remoteButtons(def) {
  const groups = def.groups || (def.buttons ? [{ buttons: def.buttons }] : []);
  return groups.flatMap((group) => group.buttons).filter((btn) => btn.id);
}

// Ten hien thi cua mot nut trong form: nhan cua nut, hoac id viet lai cho de doc ("vol_up" -> "Vol up")
function buttonTitle(btn) {
  if (btn.label) return btn.label;
  const text = btn.id.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Cac che do dieu hoa co the dat lam nut nhanh, theo thu tu uu tien
function climateModes(stateObj) {
  const supported = (stateObj && stateObj.attributes.hvac_modes) || ["cool", "dry", "fan_only"];
  return Object.keys(HVAC_ICONS).filter((mode) => supported.includes(mode));
}

// ----- Thiet bi thong minh khai bao bang bang -----
const has = (stateObj, bit) => ((stateObj.attributes.supported_features || 0) & bit) !== 0;
const isOnState = (def, stateObj) =>
  def.on_states ? def.on_states.includes(stateObj.state) : !(def.off_states || OFF_STATES).includes(stateObj.state);

// Ten hien thi cua mot gia tri thuoc tinh (che do, nguon phat...) theo ngon ngu cua Home Assistant
function fmtAttr(hass, stateObj, attribute, value) {
  if (hass && hass.formatEntityAttributeValue) {
    try {
      return hass.formatEntityAttributeValue(stateObj, attribute, value) || String(value);
    } catch (err) {
      // ban HA cu khong nhan tham so thu ba
    }
  }
  return String(value);
}

// Cac nhom lua chon (che do, nguon phat) ma entity dang co
function smartChips(def, stateObj) {
  return (def.chips || [])
    .filter((group) => !group.feature || has(stateObj, group.feature))
    .map((group) => ({
      ...group,
      options: stateObj.attributes[group.list] || [],
      current: stateObj.attributes[group.attribute],
    }))
    .filter((group) => group.options.length);
}

function smartSliders(def, stateObj) {
  const attrs = stateObj.attributes;
  const resolve = (value) => (typeof value === "function" ? value(attrs, stateObj) : value);
  return (def.sliders || [])
    .filter((slider) => !slider.feature || has(stateObj, slider.feature))
    .map((slider) => ({
      ...slider,
      min: resolve(slider.min),
      max: resolve(slider.max),
      step: resolve(slider.step) || 1,
      value: slider.value(attrs, stateObj),
    }))
    .filter((slider) => slider.max > slider.min);
}

// Moi hanh dong entity dang ho tro, kem chu hien thi
function smartActions(def, stateObj, hass) {
  if (!stateObj) return [];
  const on = isOnState(def, stateObj);
  const actions = (def.actions ? def.actions(stateObj, on) : [])
    .filter(Boolean)
    .map((action) => ({ label: tr(`act_${action.id}`), ...action }));
  const group = def.quick_chips && smartChips(def, stateObj)[0];
  if (group) {
    for (const value of group.options) {
      actions.push({
        id: `mode:${value}`,
        label: fmtAttr(hass, stateObj, group.attribute, value),
        quick_only: true,
        service: group.service,
        data: { [group.attribute]: value },
        active: on && group.current === value,
      });
    }
  }
  return actions;
}

// ----- Den va cua cuon -----
// Nut nhanh cua den: muc sang ("b25"...), mau trang theo do K, va mau
const LIGHT_LEVELS = [25, 50, 75, 100];
const LIGHT_WHITES = { warm: 2700, neutral: 4000, cool: 6500 };
const LIGHT_WHITE_CSS = { warm: "#ffc47a", neutral: "#fff1dc", cool: "#dbe9ff" };
const LIGHT_COLORS = {
  red: [255, 59, 48],
  orange: [255, 149, 0],
  yellow: [255, 214, 10],
  green: [52, 199, 89],
  cyan: [50, 212, 222],
  blue: [10, 132, 255],
  purple: [175, 82, 222],
  pink: [255, 45, 146],
};
// "feature" la bit trong supported_features cua cover; "state" la trang thai lam nut sang len
const COVER_ACTIONS = {
  open: { icon: "mdi:arrow-up", service: "open_cover", feature: 1, state: "opening" },
  stop: { icon: "mdi:stop", service: "stop_cover", feature: 8 },
  close: { icon: "mdi:arrow-down", service: "close_cover", feature: 2, state: "closing" },
};
const COVER_SET_POSITION = 4;
const COVER_SET_TILT = 128;

// Den lam duoc gi, theo supported_color_modes
function lightSupport(stateObj) {
  const modes = (stateObj && stateObj.attributes.supported_color_modes) || [];
  return {
    brightness: modes.some((mode) => mode !== "onoff"),
    temp: modes.includes("color_temp") || modes.includes("rgbww"),
    color: modes.some((mode) => ["hs", "xy", "rgb", "rgbw", "rgbww"].includes(mode)),
  };
}

// Cac nut nhanh co the chon cho den / cua cuon, theo kha nang cua entity
function quickChoices(def, stateObj) {
  if (def.kind === "light") {
    const support = lightSupport(stateObj);
    return [
      ...(support.brightness ? ["brightness"] : []),
      ...(support.brightness ? LIGHT_LEVELS.map((level) => `b${level}`) : []),
      ...(support.temp ? Object.keys(LIGHT_WHITES) : []),
      ...(support.color ? Object.keys(LIGHT_COLORS) : []),
    ];
  }
  // Chua co entity thi coi nhu co du mo / dung / dong
  const features = stateObj ? stateObj.attributes.supported_features || 0 : 11;
  return [
    ...(features & COVER_SET_POSITION ? ["position"] : []),
    ...(features & COVER_SET_TILT ? ["tilt"] : []),
    ...Object.keys(COVER_ACTIONS).filter((id) => features & COVER_ACTIONS[id].feature),
  ];
}

// Nut nhanh la thanh truot keo ngay tren card (do sang, vi tri, goc lat)
const QUICK_SLIDERS = { brightness: "light_brightness", position: "cover_position", tilt: "cover_tilt" };

function quickLabel(id) {
  if (QUICK_SLIDERS[id]) return `${tr(QUICK_SLIDERS[id])} (${tr("quick_slider")})`;
  if (LIGHT_COLORS[id]) return tr(`color_${id}`);
  if (LIGHT_WHITES[id]) return tr(`white_${id}`);
  if (COVER_ACTIONS[id]) return tr(`cover_${id}`);
  return `${id.slice(1)}%`;
}

const brightnessPct = (attrs) => (attrs.brightness != null ? Math.max(1, Math.round(attrs.brightness / 2.55)) : null);
const sameColor = (a, b) => Array.isArray(a) && a.every((value, i) => Math.abs(value - b[i]) <= 12);

// Nut nhanh mac dinh khi nguoi dung chua chon "quick"
function defaultQuick(def, stateObj) {
  if (def.kind === "climate") return climateModes(stateObj).slice(0, 3);
  if (def.kind === "light") return quickChoices(def, stateObj).filter((id) => ["b25", "b50", "b100"].includes(id));
  if (def.kind === "cover") {
    // Co vi tri thi mac dinh la thanh truot, khong thi la cac nut mo / dung / dong
    const choices = quickChoices(def, stateObj);
    return choices.includes("position") ? ["position"] : choices;
  }
  if (def.kind === "smart") {
    const ids = smartActions(def, stateObj).map((action) => action.id);
    if (stateObj) ids.push(...smartSliders(def, stateObj).map((slider) => slider.key));
    const chosen = (def.default_quick || []).filter((id) => ids.includes(id));
    return chosen.length ? chosen : ids.slice(0, 3);
  }
  if (def.kind) return def.default_quick || [];
  return def.quick || [];
}

class IrRemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._embedded = [];
    this._onPopState = () => {
      // Lan lui lich su nay la do hop thoai more-info dong lai, khong phai nguoi dung bam Back
      if (this._childDialog) {
        this._childDialog = false;
        return;
      }
      this._closePopup(false);
    };
    this._onKeyDown = (ev) => {
      if (ev.key === "Escape") this._closePopup(true);
    };
  }

  // "ir", "smart", hoac khong co (card cu, nhan ca hai nhom); lop con dat trong define()
  static get flavour() {
    return undefined;
  }

  static getStubConfig(hass) {
    if (this.flavour === "smart") {
      const entity = Object.keys((hass && hass.states) || {}).find((id) => id.startsWith("light."));
      return entity ? { device: "light", entity } : { device: "light" };
    }
    return { device: "fan", model: "hsv", blaster: findBlasters(hass)[0] || "ten_node_esphome" };
  }

  static getConfigElement() {
    return document.createElement(EDITOR_TAGS[this.flavour] || "aurora-device-control-card-editor");
  }

  setConfig(config) {
    const def = resolveRemote(config, this.constructor.flavour);
    if (!def) {
      throw new Error(
        `aurora-device-control-card: khong co thiet bi '${config.device || config.remote}'` +
          (config.model ? ` mau '${config.model}'` : "") +
          `. Loai co san: ${Object.keys(devicesFor(this.constructor.flavour)).join(", ")}`
      );
    }
    // Thieu entity / bo phat thi khong nem loi: nguoi dung dang chon do trong form,
    // nem loi se lam form bi thay bang o YAML. Card hien "Chua cau hinh" va khong gui lenh.
    this._missing = def.kind ? !config.entity : !config.blaster || !!def.pending;
    // Kho ma chua nap: nap xong thi dung lai card voi bo ma that
    if (def.pending === "loading_codes") {
      loadCodes()
        .then(() => {
          if (this._config === config) this.setConfig(config);
        })
        .catch(() => {
          if (this._config !== config) return;
          this._def = { ...def, pending: "codes_failed" };
          this._update();
        });
    }
    this._config = config;
    this._def = def;
    this._groups = def.groups || (def.buttons ? [{ columns: 3, buttons: def.buttons }] : []);
    this._byId = {};
    for (const group of this._groups) {
      for (const btn of group.buttons) if (btn.id) this._byId[btn.id] = btn;
    }
    this._controls = (config.controls || []).map(normalizeControl);
    this._controlNodes = [];
    this._blasterIds = null;
    this._quickKey = null;
    this._render();
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    setLang(hass);
    this._update();
    this._updateControls();
    this._updateKeyboard();
    this._updateNowPlaying();
    this._updateSliders();
    for (const card of this._embedded) {
      card.hass = hass;
      if (card.localName === "ha-camera-stream") card.stateObj = this._stateObj;
    }
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 6 };
  }

  disconnectedCallback() {
    this._closePopup(true);
  }

  get _isClimate() {
    return this._def.kind === "climate";
  }

  // Loai bam icon la bat / tat (hoac mo / dong) chinh entity cua card
  get _isToggleKind() {
    return ["climate", "light", "cover"].includes(this._def.kind) || (this._def.kind === "entity" && this._def.toggle === true);
  }

  get _isSmart() {
    return this._def.kind === "smart";
  }

  // Loai theo entity voi nut tu khai bao (vacuum, camera)
  get _isEntityKind() {
    return this._def.kind === "entity";
  }

  // Co pop-up rieng hay khong; khong co thi bam card mo hop thoai more-info cua HA
  get _hasPopup() {
    return !this._isEntityKind || !!this._def.live || this._controls.length > 0 || !!this._config.pad;
  }

  get _stateObj() {
    const id = this._config.entity;
    return id && this._hass ? this._hass.states[id] : undefined;
  }

  get _name() {
    if (this._config.name) return this._config.name;
    const stateObj = this._stateObj;
    if (this._def.kind && stateObj && stateObj.attributes.friendly_name) return stateObj.attributes.friendly_name;
    return tr(`name_${this._def.domain}`, this._def.name);
  }

  get _icon() {
    return this._config.icon || this._def.icon;
  }

  get _color() {
    return cssColor(this._config.color) || this._def.color || "#90a4ae";
  }

  _render() {
    const iconButton = el("button", { class: "icon" }, [icon(this._icon)]);
    iconButton.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (this._isToggleKind) this._callEntity("toggle");
      else if (this._isSmart) {
        const stateObj = this._stateObj;
        const tap = stateObj && this._def.tap ? this._def.tap(stateObj) : null;
        if (tap) this._pressSmart(tap);
        else this._openMain();
      } else if (this._def.transport === "remote") this._togglePower();
      else if (this._isEntityKind) this._openMain();
      else if (this._byId[this._def.power]) this._send(this._byId[this._def.power]);
      else this._openMain(); // bo ma khong co phim nguon
    });

    this._nameEl = el("div", { class: "name", text: this._name });
    this._badge = el("div", { class: "badge" }, [
      el("ha-icon", { icon: "mdi:remote", class: "remote" }),
      el("ha-icon", { class: "extra" }),
      el("span", { class: "text" }),
    ]);
    const top = el("div", { class: "top" }, [iconButton, this._nameEl, this._badge]);
    top.addEventListener("click", () => this._openMain());

    this._quick = el("div", { class: "quick" });
    this._card = el("ha-card", {}, [top, this._quick]);
    this._card.style.setProperty("--ir-accent", this._color);
    this._card.classList.toggle("stateless", !this._config.entity);
    this._card.classList.toggle("compact", !!this._config.hide_quick);
    this.shadowRoot.replaceChildren(el("style", { text: CARD_CSS }), this._card);
  }

  // Ten ngan cua entity (khong kem ten thiet bi neu HA ho tro), dung khi nut khong dat "name"
  _entityName(entityId) {
    const stateObj = entityId && this._hass ? this._hass.states[entityId] : undefined;
    if (!stateObj) return "";
    if (this._hass.formatEntityName) {
      try {
        const name = this._hass.formatEntityName(stateObj, { type: "entity" });
        if (name) return name;
      } catch (err) {
        // ban HA cu khong nhan tham so nay
      }
    }
    return stateObj.attributes.friendly_name || "";
  }

  // Cac nut nhanh o hang duoi, lay tu tuy chon "quick" hoac mac dinh cua loai thiet bi.
  _quickButtons() {
    const stateObj = this._stateObj;
    const chosen = Array.isArray(this._config.quick) ? this._config.quick : defaultQuick(this._def, stateObj);
    if (this._isEntityKind) {
      return chosen.map(normalizeControl).map((spec) => ({
        id: spec.entity || spec.path || spec.service,
        label: spec.name || this._entityName(spec.entity),
        show_label: true,
        active: this._controlIsOn(spec),
        control: spec,
      }));
    }
    if (this._def.kind === "light") return this._lightQuick(chosen, stateObj);
    if (this._isSmart) {
      const actions = smartActions(this._def, stateObj, this._hass);
      const sliders = stateObj ? smartSliders(this._def, stateObj) : [];
      return chosen
        .map((id) => sliders.find((slider) => slider.key === id) || actions.find((action) => action.id === id))
        .filter(Boolean)
        .map((action) =>
          action.key
            ? {
                id: action.key,
                label: tr(action.label),
                slider: {
                  min: action.min,
                  max: action.max,
                  step: action.step,
                  unit: action.unit || "",
                  value: action.value,
                  send: (value) => this._callEntity(action.service, action.data(value)),
                },
              }
            : {
                id: action.id,
                icon: action.icon,
                label: action.label,
                show_label: !!action.quick_only,
                text_only: !!action.quick_only,
                active: !!action.active,
                smart: action.id,
              }
        );
    }
    if (this._def.kind === "cover") {
      const allowed = quickChoices(this._def, stateObj);
      const attrs = (stateObj && stateObj.attributes) || {};
      return chosen
        .filter((id) => allowed.includes(id))
        .map((id) => {
          if (QUICK_SLIDERS[id]) {
            const tilt = id === "tilt";
            return {
              id,
              label: tr(QUICK_SLIDERS[id]),
              slider: {
                min: 0,
                max: 100,
                step: 1,
                unit: "%",
                value: tilt ? attrs.current_tilt_position : attrs.current_position,
                send: (value) =>
                  tilt
                    ? this._callEntity("set_cover_tilt_position", { tilt_position: value })
                    : this._callEntity("set_cover_position", { position: value }),
              },
            };
          }
          return {
            id,
            icon: COVER_ACTIONS[id].icon,
            label: quickLabel(id),
            active: !!stateObj && stateObj.state === COVER_ACTIONS[id].state,
            service: [COVER_ACTIONS[id].service, {}],
          };
        });
    }
    if (!this._isClimate) {
      return chosen.map((id) => this._byId[id]).filter(Boolean);
    }
    return chosen.filter((mode) => HVAC_ICONS[mode]).map((mode) => ({
      id: mode,
      icon: HVAC_ICONS[mode],
      active: !!stateObj && stateObj.state === mode,
      service: ["set_hvac_mode", { hvac_mode: mode }],
    }));
  }

  // Nut nhanh cua den: muc sang hien bang chu, mau va mau trang hien bang cham mau
  _lightQuick(chosen, stateObj) {
    const attrs = (stateObj && stateObj.attributes) || {};
    const on = !!stateObj && stateObj.state === "on";
    const allowed = quickChoices(this._def, stateObj);
    return chosen
      .filter((id) => allowed.includes(id))
      .map((id) => {
        if (id === "brightness") {
          return {
            id,
            label: tr("light_brightness"),
            slider: {
              min: 1,
              max: 100,
              step: 1,
              unit: "%",
              value: on ? brightnessPct(attrs) : 1,
              send: (value) => this._callEntity("turn_on", { brightness_pct: value }),
            },
          };
        }
        if (LIGHT_COLORS[id]) {
          const rgb = LIGHT_COLORS[id];
          return {
            id,
            label: quickLabel(id),
            swatch: `rgb(${rgb.join(",")})`,
            active: on && attrs.color_mode !== "color_temp" && sameColor(attrs.rgb_color, rgb),
            service: ["turn_on", { rgb_color: rgb }],
          };
        }
        if (LIGHT_WHITES[id]) {
          const kelvin = this._clampKelvin(LIGHT_WHITES[id], attrs);
          return {
            id,
            label: quickLabel(id),
            swatch: LIGHT_WHITE_CSS[id],
            active: on && attrs.color_mode === "color_temp" && Math.abs((attrs.color_temp_kelvin || 0) - kelvin) < 150,
            service: ["turn_on", { color_temp_kelvin: kelvin }],
          };
        }
        const level = Number(id.slice(1));
        const pct = brightnessPct(attrs);
        return {
          id,
          label: quickLabel(id),
          show_label: true,
          text_only: true,
          short_label: true,
          active: on && pct != null && Math.abs(pct - level) <= 2,
          service: ["turn_on", { brightness_pct: level }],
        };
      });
  }

  // Do K nam trong khoang den ho tro
  _clampKelvin(kelvin, attrs) {
    return Math.min(attrs.max_color_temp_kelvin || 6500, Math.max(attrs.min_color_temp_kelvin || 2000, kelvin));
  }

  _renderQuick() {
    const buttons = this._quickButtons();
    const key = buttons
      .map((b) => `${b.id}:${b.active ? 1 : 0}:${b.label || ""}:${b.smart ? b.icon : ""}:${b.slider ? `${b.slider.min}-${b.slider.max}` : ""}`)
      .join(",");
    if (key !== this._quickKey) {
      this._quickKey = key;
      this._buildQuick(buttons);
    }
    // Thanh truot khong dung lai moi lan cap nhat (dang keo se bi giat): chi dat lai gia tri
    for (const btn of buttons) {
      const input = btn.slider && this._quickSliders[btn.id];
      if (!input) continue;
      input.send = btn.slider.send;
      if (btn.slider.value == null || Date.now() < (input.holdUntil || 0)) continue;
      input.value = btn.slider.value;
      input.paint();
    }
  }

  // Thanh truot trong hang nut nhanh: keo de dat gia tri, tha tay moi gui lenh
  _quickSlider(btn) {
    const { min, max, step, unit } = btn.slider;
    const input = el("input", { type: "range", class: "slider", min, max, step, title: btn.label });
    input.paint = () => input.style.setProperty("--fill", `${((Number(input.value) - min) / (max - min)) * 100}%`);
    input.addEventListener("input", () => {
      input.holdUntil = Date.now() + 5000;
      input.paint();
      // O trang thai goc phai hien gia tri dang keo
      if (this._badge.classList.contains("show-text")) this._badge.querySelector(".text").textContent = `${input.value}${unit}`;
    });
    input.addEventListener("change", () => {
      input.holdUntil = Date.now() + 1500;
      input.send(Number(input.value));
    });
    // Keo thanh truot khong duoc tinh la vuot doi trang cua dashboard
    for (const type of ["touchstart", "touchmove", "pointerdown", "mousedown"]) {
      input.addEventListener(type, (ev) => ev.stopPropagation());
    }
    input.value = min;
    input.paint();
    this._quickSliders[btn.id] = input;
    return input;
  }

  _buildQuick(buttons) {
    // Nhan ngan ("50%") khong can nhuong cho: cac nut chia deu chieu ngang
    const anyLabel = buttons.some((b) => b.show_label && b.label && !b.short_label);
    const anySlider = buttons.some((b) => b.slider);
    this._quickSliders = {};
    this._quick.replaceChildren(
      ...buttons.map((btn) => {
        if (btn.slider) return this._quickSlider(btn);
        const children = [];
        if (btn.control) children.push(this._controlIcon(btn.control));
        else if (btn.swatch) children.push(el("span", { class: "swatch" }));
        else if (!btn.text_only) children.push(icon(btn.icon));
        const labelled = btn.show_label && btn.label;
        if (labelled) children.push(el("span", { text: btn.label }));
        const classes = [];
        if (btn.active) classes.push("active");
        if (btn.control || btn.swatch) classes.push("control");
        if ((!labelled && anyLabel) || anySlider) classes.push("compact");
        const node = el("button", { title: btn.label || btn.id, class: classes.join(" ") }, children);
        if (btn.control && btn.control.color) node.style.setProperty("--control-color", cssColor(btn.control.color));
        if (btn.swatch) node.style.setProperty("--control-color", btn.swatch);
        node.addEventListener("click", () => this._press(btn));
        return node;
      })
    );
  }

  // Blaster mat ket noi khi moi entity cua no deu unavailable.
  _isOffline() {
    const states = this._hass && this._hass.states;
    if (!states) return false;
    const explicit = this._config.availability_entity;
    if (explicit) {
      return !!states[explicit] && OFFLINE_STATES.includes(states[explicit].state);
    }
    if (this._def.kind) {
      const stateObj = this._stateObj;
      return !!stateObj && OFFLINE_STATES.includes(stateObj.state);
    }
    // Quet danh sach entity cua blaster, toi da 30 giay mot lan neu chua tim thay
    const now = Date.now();
    if (!this._blasterIds || (!this._blasterIds.length && now - this._scannedAt > 30000)) {
      const marker = `.${this._config.blaster}_`;
      this._blasterIds = Object.keys(states).filter((id) => id.includes(marker));
      this._scannedAt = now;
    }
    const known = this._blasterIds.filter((id) => states[id]);
    return known.length > 0 && known.every((id) => OFFLINE_STATES.includes(states[id].state));
  }

  _update() {
    if (!this._card) return;
    if (this._missing) {
      this._card.classList.add("offline");
      this._card.classList.remove("on", "alert");
      this._nameEl.textContent = this._name;
      this._badge.querySelector(".text").textContent = this._isIrMissingText();
      this._badge.style.color = "";
      this._badge.classList.remove("plain", "has-icon", "show-icon");
      this._badge.classList.add("show-text");
      this._renderQuick();
      return;
    }
    const offline = this._isOffline();
    const stateObj = this._stateObj;
    const onStates = this._def.on_states;
    const on =
      !offline &&
      !!stateObj &&
      (onStates ? onStates.includes(stateObj.state) : !(this._def.off_states || OFF_STATES).includes(stateObj.state));
    this._isOn = on;
    // Den mau: icon va vien card mang mau den dang phat, tru khi nguoi dung tu dat mau
    if (this._def.kind === "light" && !this._config.color) {
      const rgb = on && stateObj.attributes.rgb_color;
      const accent = rgb ? `rgb(${rgb.join(",")})` : this._color;
      this._card.style.setProperty("--ir-accent", accent);
      if (this._popup) this._popup.style.setProperty("--ir-accent", accent);
    }
    const live = !!this._def.live;
    this._card.classList.toggle("offline", offline && !live);
    this._card.classList.toggle("alert", offline && live);
    this._card.classList.toggle("on", on);
    this._nameEl.textContent = this._name;

    // Goc phai: "Unavailable" khi mat ket noi, trang thai camera, gia tri cua badge_entity,
    // nhiet do dat cua dieu hoa, hoac icon remote. badge_icon them mot icon truoc chu.
    const states = (this._hass && this._hass.states) || {};
    let text = "";
    let color = "";
    if (live) {
      const privacy = states[this._config.privacy_entity];
      if (offline) [text, color] = ["● Offline", "#ef8a80"];
      else if (privacy && privacy.state === "on") [text, color] = [`● ${tr("privacy")}`, "#f2c879"];
      else [text, color] = ["● Online", "#81c995"];
    } else if (offline) {
      text = (this._hass && this._hass.localize("state.default.unavailable")) || "Unavailable";
    } else if (states[this._config.badge_entity]) {
      const badge = states[this._config.badge_entity];
      text = this._hass.formatEntityState
        ? this._hass.formatEntityState(badge)
        : `${badge.state} ${badge.attributes.unit_of_measurement || ""}`.trim();
    } else if (this._isClimate && stateObj && stateObj.attributes.temperature != null) {
      text = `${stateObj.attributes.temperature} °C`;
    } else if (this._def.kind === "light" && on && stateObj.attributes.brightness != null) {
      text = `${brightnessPct(stateObj.attributes)}%`;
    } else if (this._def.kind === "cover" && stateObj) {
      // Co vi tri thi hien phan tram mo, khong thi hien trang thai (Dang mo, Da dong...)
      const position = stateObj.attributes.current_position;
      if (position != null) text = `${position}%`;
      else text = this._hass.formatEntityState ? this._hass.formatEntityState(stateObj) : stateObj.state;
    } else if (this._isSmart && stateObj) {
      text = (this._def.badge && this._def.badge(stateObj)) || "";
      if (!text && this._def.badge_state) {
        text = this._hass.formatEntityState ? this._hass.formatEntityState(stateObj) : stateObj.state;
      }
    }
    // Thiet bi phat nhac / phim: chi hien mot icon cho biet dang phat hay tam dung (ten noi dung qua dai)
    let stateIcon = "";
    if (!text && (this._def.kind === "media" || this._def.media) && on && stateObj) {
      stateIcon = { playing: "mdi:play", buffering: "mdi:play", paused: "mdi:pause" }[stateObj.state] || "";
    }
    const badgeIcon =
      stateIcon || (!offline && !live && text ? this._config.badge_icon || this._def.badge_icon : "");
    this._badge.querySelector(".extra").setAttribute("icon", badgeIcon || "");
    this._badge.classList.toggle("has-icon", !!badgeIcon);
    this._badge.querySelector(".text").textContent = text;
    this._badge.style.color = color;
    this._badge.classList.toggle("plain", live);
    this._badge.classList.toggle("icon-only", !!stateIcon);
    this._badge.classList.toggle("show-text", !!text || !!stateIcon);
    this._badge.classList.toggle("show-icon", !text && !this._config.entity);

    this._renderQuick();
  }

  _isIrMissingText() {
    if (this._def.pending) return tr(this._def.pending);
    return tr(this._def.kind ? "missing_entity" : "missing_blaster");
  }

  _notifyError(err) {
    this.dispatchEvent(
      new CustomEvent("hass-notification", {
        bubbles: true,
        composed: true,
        detail: { message: `${this._name}: ${err && err.message ? err.message : err}` },
      })
    );
  }

  _callEntity(service, data = {}) {
    if (!this._hass || this._missing) return;
    const domain = this._config.entity.split(".")[0];
    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
    this._hass
      .callService(domain, service, { entity_id: this._config.entity, ...data })
      .catch((err) => this._notifyError(err));
  }

  // ----- Thiet bi dieu khien qua entity remote (Apple TV) -----
  // Entity remote / cam bien ban phim: lay tu cau hinh, hoac suy ra tu ten cua media_player
  _siblingEntity(option, domain, suffix = "") {
    if (this._config[option]) return this._config[option];
    const objectId = (this._config.entity || "").split(".")[1];
    return objectId ? `${domain}.${objectId}${suffix}` : undefined;
  }

  // Bat / cho ngu qua media_player. Khong dung remote.turn_on/turn_off: voi Apple TV hai lenh do
  // chi ket noi / ngat ket noi Home Assistant voi thiet bi, khong danh thuc hay cho ngu.
  _togglePower() {
    this._callEntity(this._isOn ? "turn_off" : "turn_on");
  }

  // Config entry cua thiet bi, can cho cac action ban phim cua Apple TV
  _configEntryId() {
    if (this._config.config_entry_id) return this._config.config_entry_id;
    const entry = this._hass.entities && this._hass.entities[this._config.entity];
    const device = entry && this._hass.devices && this._hass.devices[entry.device_id];
    return device ? device.primary_config_entry || (device.config_entries || [])[0] : undefined;
  }

  _keyboardFocused() {
    const sensor = this._hass.states[this._siblingEntity("keyboard_entity", "binary_sensor", "_keyboard_focus")];
    return sensor ? sensor.state === "on" : true;
  }

  _sendText(text) {
    const entryId = this._configEntryId();
    if (!entryId) return this._notifyError(tr("no_config_entry"));
    const call = text
      ? this._hass.callService("apple_tv", "set_keyboard_text", { config_entry_id: entryId, text })
      : this._hass.callService("apple_tv", "clear_keyboard_text", { config_entry_id: entryId });
    call.catch((err) => this._notifyError(err));
  }

  // O go chu: go toi dau gui len thiet bi toi do. Enter = bam nut chon.
  _buildKeyboard() {
    const input = el("input", {
      type: "text",
      autocomplete: "off",
      autocapitalize: "off",
      autocorrect: "off",
      spellcheck: "false",
      enterkeyhint: "search",
    });
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => this._sendText(input.value), 200);
    });
    input.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter") return;
      ev.preventDefault();
      clearTimeout(timer);
      this._sendText(input.value);
      this._send(this._byId.select);
    });
    const clear = el("button", { title: "Clear" }, [icon("mdi:close")]);
    clear.addEventListener("click", () => {
      input.value = "";
      this._sendText("");
      input.focus();
    });
    const box = el("div", { class: "keyboard" }, [icon("mdi:keyboard-outline"), input, clear]);
    this._keyboard = { box, input };
    this._updateKeyboard();
    return box;
  }

  // O go chu chi hien khi thiet bi dang mo cho nhap (tim kiem, mat khau)
  _updateKeyboard() {
    if (!this._keyboard || !this._hass) return;
    const { box, input } = this._keyboard;
    const focused = this._keyboardFocused();
    const wasHidden = box.hidden;
    box.hidden = !focused;
    input.placeholder = tr("keyboard_placeholder");
    if (focused && wasHidden) {
      input.value = "";
      input.focus();
    }
  }

  // Dai "dang phat": anh bia, ten noi dung, ung dung. An khi khong phat gi.
  _buildNowPlaying() {
    const art = el("div", { class: "art" }, [icon(this._icon)]);
    const title = el("div", { class: "title" });
    const sub = el("div", { class: "sub" });
    const box = el("div", { class: "now-playing" }, [art, el("div", { class: "info" }, [title, sub])]);
    this._nowPlaying = { box, art, title, sub, picture: null };
    this._updateNowPlaying();
    return box;
  }

  _updateNowPlaying() {
    if (!this._nowPlaying || !this._hass) return;
    const view = this._nowPlaying;
    const stateObj = this._stateObj;
    const state = stateObj ? stateObj.state : "";
    const active = ["playing", "paused", "buffering"].includes(state);
    view.box.hidden = !active;
    if (!active) return;
    const attrs = stateObj.attributes;
    view.title.textContent = attrs.media_title || attrs.app_name || this._name;
    const status = tr(state === "paused" ? "paused" : "playing");
    view.sub.textContent = [attrs.media_artist, attrs.media_title ? attrs.app_name : "", status]
      .filter(Boolean)
      .join(" · ");
    // Chi doi anh khi duong dan thay doi, de anh khong nhap nhay moi lan HA cap nhat
    const picture = attrs.entity_picture || "";
    if (picture !== view.picture) {
      view.picture = picture;
      if (picture) {
        const img = el("img", { alt: "" });
        img.src = this._hass.hassUrl ? this._hass.hassUrl(picture) : picture;
        img.addEventListener("error", () => view.art.replaceChildren(icon(this._icon)));
        view.art.replaceChildren(img);
      } else {
        view.art.replaceChildren(icon(this._icon));
      }
    }
  }

  // Vong tron dieu huong: bam bon huong / OK, hoac vuot tren vong tron de di chuyen
  _buildPad() {
    const pad = el("div", { class: "pad" });
    let swipedAt = 0;
    for (const id of ["up", "down", "left", "right"]) {
      const btn = this._byId[id];
      const node = el("button", { class: id, title: id }, [icon(`mdi:chevron-${id}`)]);
      node.addEventListener("click", () => {
        if (Date.now() - swipedAt > 400) this._press(btn);
      });
      pad.appendChild(node);
    }
    const ok = el("button", { class: "ok", title: "select", text: "OK" });
    ok.addEventListener("click", () => {
      if (Date.now() - swipedAt > 400) this._press(this._byId[this._def.pad.ok]);
    });
    pad.appendChild(ok);

    // Vung cu chi rong hon vong tron: keo o canh hoac sat ngoai vong tron van duoc tinh
    const zone = el("div", { class: "pad-zone" }, [pad]);

    // Chan su kien cham lan len sheet, de vuot xuong trong vung nay khong dong pop-up
    zone.addEventListener("touchstart", (ev) => ev.stopPropagation(), { passive: true });
    zone.addEventListener(
      "touchmove",
      (ev) => {
        ev.stopPropagation();
        if (ev.cancelable) ev.preventDefault();
      },
      { passive: false }
    );
    zone.addEventListener("touchend", (ev) => ev.stopPropagation());

    // Keo nhu ban cham: cu keo them STEP px thi gui them mot lenh huong, keo nguoc lai thi di nguoc lai.
    // Diem neo doi dung mot buoc moi lan (khong nhay ve vi tri ngon tay) de quang du duoc cong don.
    // Khong dung setPointerCapture: bat con tro ve pad se lam su kien click khong toi duoc nut con.
    const STEP = 36;
    let anchor = null;
    let moved = false;
    zone.addEventListener("pointerdown", (ev) => {
      anchor = { x: ev.clientX, y: ev.clientY };
      moved = false;
    });
    zone.addEventListener("pointermove", (ev) => {
      if (!anchor) return;
      for (let i = 0; i < 4; i++) {
        const dx = ev.clientX - anchor.x;
        const dy = ev.clientY - anchor.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < STEP) break;
        let id;
        if (Math.abs(dx) > Math.abs(dy)) {
          id = dx > 0 ? "right" : "left";
          anchor.x += Math.sign(dx) * STEP;
        } else {
          id = dy > 0 ? "down" : "up";
          anchor.y += Math.sign(dy) * STEP;
        }
        moved = true;
        this._press(this._byId[id]);
      }
    });
    const release = () => {
      if (moved) swipedAt = Date.now();
      anchor = null;
    };
    zone.addEventListener("pointerup", release);
    zone.addEventListener("pointercancel", release);
    zone.addEventListener("pointerleave", release);
    return zone;
  }

  // Mot nut lay tu bo nut cua remote, dung cho cac hang duoi vong dieu huong
  _padButton(id, className = "") {
    const btn = this._byId[id];
    const btnIcon = icon(btn.icon);
    if (btn.color) btnIcon.style.color = btn.color;
    const node = el("button", { title: btn.label || id, class: className }, [btnIcon]);
    node.addEventListener("click", () => this._press(btn));
    return node;
  }

  // Hai hang nut duoi vong dieu huong, lay tu def.pad:
  //   main  : cac nut lon chia deu chieu ngang
  //   pairs : cac cap nut ghep (lui / toi, giam / tang am, kenh xuong / len); round: nut tron cuoi hang
  _buildPadButtons() {
    const spec = this._def.pad;
    const have = (id) => !!this._byId[id];
    const pair = (ids) => el("div", { class: "pair" }, ids.filter(have).map((id) => this._padButton(id)));
    const second = spec.pairs.map(pair);
    if (have(spec.round)) second.push(this._padButton(spec.round, "round"));
    return [
      el("div", { class: "btn-row" }, spec.main.filter(have).map((id) => this._padButton(id))),
      el("div", { class: "btn-row last" }, second),
    ];
  }

  // Phan mo rong: phim so va phim phu, an cho toi khi bam nut mo rong
  _buildPadExtra(groups) {
    const panel = el("div", { class: "extra" }, groups.map((group) => this._buildGrid(group)));
    panel.hidden = true;
    const chevron = icon("mdi:chevron-down");
    const toggle = el("button", { class: "more" }, [
      icon("mdi:dialpad"),
      el("span", { text: tr("more_keys") }),
      chevron,
    ]);
    toggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      chevron.setAttribute("icon", panel.hidden ? "mdi:chevron-down" : "mdi:chevron-up");
      if (!panel.hidden && panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return [toggle, panel];
  }

  _buildPadBody() {
    const body = [];
    if (this._def.kind === "media") body.push(this._buildNowPlaying());
    if (this._def.keyboard) body.push(this._buildKeyboard());
    body.push(this._buildPad(), ...this._buildPadButtons());
    if (this._def.pad.extra) body.push(...this._buildPadExtra(this._def.pad.extra));
    return body;
  }


  // Cac ung dung chon trong "apps": bam de mo (media_player.select_source)
  _buildApps() {
    const stateObj = this._stateObj;
    const current = stateObj && (stateObj.attributes.source || stateObj.attributes.app_name);
    const row = el("div", { class: "apps" });
    // Keo ngang de cuon hang ung dung, khong de sheet hieu la vuot dong
    row.addEventListener("touchstart", (ev) => ev.stopPropagation(), { passive: true });
    for (const item of this._config.apps || []) {
      const app = typeof item === "string" ? { name: item } : item;
      const appIcon = app.icon || APP_ICONS[String(app.name).toLowerCase()] || DEFAULT_APP_ICON;
      const node = el("button", { class: app.name === current ? "active" : "" }, [
        icon(appIcon),
        el("span", { text: app.name }),
      ]);
      node.addEventListener("click", () => this._callEntity("select_source", { source: app.name }));
      row.appendChild(node);
    }
    return row;
  }

  _press(btn) {
    if (!btn) return;
    if (btn.power) this._togglePower();
    else if (btn.smart) this._pressSmart(btn.smart);
    else if (btn.control) this._pressControl(btn.control);
    else if (btn.service) this._callEntity(btn.service[0], btn.service[1]);
    else this._send(btn);
  }

  // Lam mot hanh dong cua thiet bi thong minh: hoi lai va hoi ma neu hanh dong do can
  _pressSmart(id) {
    const stateObj = this._stateObj;
    if (!stateObj || this._missing) return;
    const def = this._def;
    const action = id === "toggle" ? { service: "toggle" } : smartActions(def, stateObj, this._hass).find((a) => a.id === id);
    if (!action) return;
    if (action.service === "toggle") {
      const [turnOn, turnOff] = def.toggle || ["turn_on", "turn_off"];
      this._callEntity(isOnState(def, stateObj) ? turnOff : turnOn);
      return;
    }
    if (action.confirm && this._config.confirm !== false && !window.confirm(`${action.label}: ${this._name}?`)) return;
    const data = { ...(action.data || {}) };
    if (action.code && stateObj.attributes.code_format) {
      const code = window.prompt(tr("enter_code"));
      if (code == null) return;
      data.code = code;
    }
    this._callEntity(action.service, data);
  }

  // ----- Nut gan voi entity -----
  _controlAction(spec) {
    if (spec.action) return spec.action;
    if (spec.service) return "service";
    if (spec.path) return "navigate";
    const domain = (spec.entity || "").split(".")[0];
    if (domain === "button" || domain === "input_button") return "press";
    return TOGGLE_DOMAINS.includes(domain) ? "toggle" : "more-info";
  }

  _controlIsOn(spec) {
    const stateObj = spec.entity && this._hass ? this._hass.states[spec.entity] : undefined;
    return !!stateObj && this._controlAction(spec) === "toggle" && stateObj.state === "on";
  }

  // Icon khai bao trong nut, hoac icon mac dinh cua entity
  _controlIcon(spec) {
    if (spec.icon || !spec.entity || spec.service) return icon(spec.icon || "mdi:gesture-tap");
    const node = document.createElement("ha-state-icon");
    node.hass = this._hass;
    node.stateObj = this._hass ? this._hass.states[spec.entity] : undefined;
    return node;
  }

  _pressControl(spec) {
    if (!this._hass || this._missing) return;
    if (spec.confirm && !window.confirm(spec.confirm)) return;
    const action = this._controlAction(spec);
    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
    if (action === "navigate") return this._navigate(spec.path);
    if (action === "more-info") return this._moreInfo(spec.entity);
    if (action === "service") {
      const [serviceDomain, serviceName] = spec.service.split(".");
      this._hass
        .callService(serviceDomain, serviceName, { entity_id: spec.entity || this._config.entity, ...(spec.data || {}) })
        .catch((err) => this._notifyError(err));
      return;
    }
    const [domain, service] = action === "press" ? [spec.entity.split(".")[0], "press"] : ["homeassistant", "toggle"];
    this._hass.callService(domain, service, { entity_id: spec.entity }).catch((err) => this._notifyError(err));
  }

  _moreInfo(entityId) {
    // Hop thoai more-info tu them/lui mot muc lich su; khong de lan lui do dong pop-up cua card
    if (this._popup) this._childDialog = true;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } })
    );
  }

  _navigate(path) {
    if (this._popup) {
      // Thay muc lich su cua pop-up bang trang moi, de nut Back quay ve dashboard
      this._closePopup(false);
      history.replaceState(null, "", path);
    } else {
      history.pushState(null, "", path);
    }
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  }

  // Bam vao card: mo pop-up, hoac more-info neu loai nay khong co pop-up
  _openMain() {
    if (this._missing) return;
    if (this._hasPopup) this._openPopup();
    else this._moreInfo(this._config.entity);
  }

  // To mau cac nut trong pop-up theo trang thai bat/tat cua entity
  _updateControls() {
    for (const { node, iconNode, spec } of this._controlNodes) {
      const on = this._controlIsOn(spec);
      const color = cssColor(spec.color) || "var(--ir-accent)";
      node.style.background = on ? `color-mix(in srgb, ${color} 20%, transparent)` : "";
      node.style.borderColor = on ? `color-mix(in srgb, ${color} 65%, transparent)` : "";
      iconNode.style.color = on ? color : "";
      iconNode.style.opacity = on ? "1" : "";
      if (iconNode.localName === "ha-state-icon") {
        iconNode.hass = this._hass;
        iconNode.stateObj = this._hass.states[spec.entity];
      }
    }
  }

  _send(btn) {
    if (!btn || !this._hass || this._missing) return;
    const def = this._def;
    if (def.transport === "remote") {
      this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
      this._hass
        .callService("remote", "send_command", {
          entity_id: this._siblingEntity("remote_entity", "remote"),
          command: btn.command,
        })
        .catch((err) => this._notifyError(err));
      return;
    }
    // Ma lay tu kho: doi thanh Pronto luc bam; bit lat cua RC5 / RC6 doi sau moi lan bam
    let prontoCode = btn.pronto;
    if (btn.ir) {
      this._irToggle = !this._irToggle;
      prontoCode = irPronto(btn.ir, this._irToggle);
      if (!prontoCode) return this._notifyError(tr("ir_unsupported"));
    }
    const protocol = prontoCode ? "pronto" : btn.protocol || def.protocol;
    // Chuoi Pronto dung san, giao thuc kieu data/nbits (sony, lg...) hoac address/command (nec, samsung)
    const data = prontoCode
      ? { data: prontoCode }
      : btn.data !== undefined
        ? { data: btn.data, nbits: btn.nbits ?? def.nbits }
        : { address: btn.address ?? def.address, command: btn.command };
    const repeats = btn.repeats ?? def.repeats;
    if (repeats !== undefined && !prontoCode) data.repeats = repeats;

    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
    // Cac lenh IR phai cach nhau mot khoang lang. Gui lien nhau thi thiet bi coi nhu dang giu mot phim
    // va chi nhan lan dau (vd. keo tren vong dieu huong gui 6 lenh ma TV chi di 1-2 o).
    // Lenh dau gui ngay; cac lenh sau xep hang, moi lenh cach lenh truoc "ir_gap" mili giay.
    const gap = Number(this._config.ir_gap ?? 220);
    const now = Date.now();
    const at = Math.max(now, this._irNextAt || 0);
    if (at - now > gap * 8) return; // hang cho qua dai (keo qua nhanh): bo bot de khong chay mai sau khi dung tay
    this._irNextAt = at + gap;
    const service = `${this._config.blaster}_send_${protocol}`;
    const call = () => this._hass.callService("esphome", service, data).catch((err) => this._notifyError(err));
    if (at === now) call();
    else setTimeout(call, at - now);
  }

  _buildGrid(group) {
    const grid = el("div", { class: "grid" });
    grid.style.gridTemplateColumns = `repeat(${group.columns || 3}, 1fr)`;
    for (const btn of group.buttons) {
      if (btn.spacer) {
        grid.appendChild(el("div"));
        continue;
      }
      const btnIcon = btn.control ? this._controlIcon(btn.control) : icon(btn.icon);
      const size = btn.icon_size || (btn.label ? 24 : 28);
      btnIcon.style.setProperty("--mdc-icon-size", `${size}px`);
      if (btn.color) {
        btnIcon.style.color = btn.color;
        btnIcon.style.opacity = "1";
      }
      const children = [btnIcon];
      if (btn.label) children.push(el("span", { class: "label", text: btn.label }));
      const node = el("button", { title: btn.label || btn.id, class: btn.highlight ? "highlight" : "" }, children);
      node.style.height = `${this._def.button_height || 54}px`;
      if (!btn.label) node.style.gridTemplateRows = "1fr";
      if (btn.wide) node.style.gridColumn = "1 / -1";
      if (btn.control) this._controlNodes.push({ node, iconNode: btnIcon, spec: btn.control });
      node.addEventListener("click", () => this._press(btn));
      grid.appendChild(node);
    }
    return grid;
  }

  // Nhung mot card goc cua HA vao pop-up
  _embedCard(config) {
    const holder = el("div", { class: "embedded" });
    if (window.loadCardHelpers) {
      window
        .loadCardHelpers()
        .then((helpers) => {
          if (!this._popup) return;
          const card = helpers.createCardElement(config);
          card.hass = this._hass;
          this._embedded.push(card);
          holder.appendChild(card);
        })
        .catch((err) => this._notifyError(err));
    }
    return holder;
  }

  // Hinh truc tiep cua camera, co tieng. Card picture-entity cua HA luon tat tieng,
  // nen dung thang bo phat ha-camera-stream; "audio: false" thi quay ve card picture-entity.
  _embedCamera() {
    const pictureConfig = {
      type: "picture-entity",
      entity: this._config.entity,
      camera_view: "live",
      show_name: false,
      show_state: false,
      tap_action: { action: "none" },
      hold_action: { action: "none" },
    };
    if (this._config.audio === false || !window.loadCardHelpers) return this._embedCard(pictureConfig);

    const holder = el("div", { class: "embedded stream" });
    window
      .loadCardHelpers()
      .then(async (helpers) => {
        // Tao card picture-entity de HA nap module chua ha-camera-stream; cung la phuong an du phong
        const fallback = helpers.createCardElement(pictureConfig);
        await Promise.race([
          customElements.whenDefined("ha-camera-stream"),
          new Promise((resolve) => setTimeout(resolve, 4000)),
        ]);
        if (!this._popup) return;
        let node = fallback;
        if (customElements.get("ha-camera-stream")) {
          node = document.createElement("ha-camera-stream");
          node.controls = true;
          node.muted = false;
          node.stateObj = this._stateObj;
        }
        node.hass = this._hass;
        this._embedded.push(node);
        holder.appendChild(node);
      })
      .catch((err) => this._notifyError(err));
    return holder;
  }

  // Noi dung pop-up cua dieu hoa: card thermostat goc cua HA
  _buildClimateBody() {
    const stateObj = this._stateObj;
    const attrs = (stateObj && stateObj.attributes) || {};
    const features = [{ type: "climate-hvac-modes" }];
    if (attrs.fan_modes) features.push({ type: "climate-fan-modes" });
    if (attrs.swing_modes) features.push({ type: "climate-swing-modes" });
    return [this._embedCard({ type: "thermostat", entity: this._config.entity, features })];
  }

  // Thanh truot trong pop-up: dang keo thi chi doi so hien thi, tha tay moi gui lenh.
  // Sau khi tha, bo qua trang thai cu trong mot luc de thanh khong giat nguoc ve gia tri truoc do.
  _buildSlider({ key, label, min, max, step = 1, unit = "", variant = "", send }) {
    const value = el("span", { class: "value" });
    const input = el("input", { type: "range", class: `slider ${variant}`.trim(), min, max, step });
    const paint = () => {
      input.style.setProperty("--fill", `${((Number(input.value) - min) / (max - min)) * 100}%`);
      value.textContent = `${input.value}${unit}`;
    };
    input.addEventListener("input", () => {
      input.holdUntil = Date.now() + 5000;
      paint();
    });
    input.addEventListener("change", () => {
      input.holdUntil = Date.now() + 1500;
      send(Number(input.value));
    });
    input.value = min;
    paint();
    this._sliders[key] = { input, paint };
    return el("div", { class: "slider-row" }, [
      el("div", { class: "slider-head" }, [el("span", { text: label }), value]),
      input,
    ]);
  }

  _setSlider(key, value) {
    const slider = this._sliders[key];
    if (!slider || value == null || Date.now() < (slider.input.holdUntil || 0)) return;
    slider.input.value = value;
    slider.paint();
  }

  // Dong bo thanh truot va nut trong pop-up cua den / cua cuon voi trang thai moi
  _updateSliders() {
    const stateObj = this._stateObj;
    if (!this._popup || !this._sliders || !stateObj) return;
    const attrs = stateObj.attributes;
    if (this._def.kind === "light") {
      const on = stateObj.state === "on";
      this._stateNodes.forEach(([effect, node]) => {
        node.classList.toggle(effect === null ? "on" : "active", on && (effect === null || effect === attrs.effect));
      });
      this._setSlider("brightness", on ? brightnessPct(attrs) : 1);
      this._setSlider("temp", attrs.color_temp_kelvin);
      this._setSlider("hue", attrs.hs_color ? Math.round(attrs.hs_color[0]) : null);
    } else if (this._def.kind === "cover") {
      this._stateNodes.forEach(([id, node]) => node.classList.toggle("on", stateObj.state === COVER_ACTIONS[id].state));
      this._setSlider("position", attrs.current_position);
      this._setSlider("tilt", attrs.current_tilt_position);
    } else if (this._isSmart) {
      const actions = smartActions(this._def, stateObj, this._hass);
      this._stateNodes.forEach(([id, node, iconNode]) => {
        const action = actions.find((a) => a.id === id);
        node.classList.toggle("on", !!(action && action.active));
        if (action) iconNode.setAttribute("icon", action.icon);
      });
      for (const slider of smartSliders(this._def, stateObj)) this._setSlider(slider.key, slider.value);
      this._chipNodes.forEach(([attribute, value, node]) => node.classList.toggle("active", attrs[attribute] === value));
    }
  }

  // Noi dung pop-up cua thiet bi thong minh: cac nut hanh dong theo hang, thanh truot, roi cac nhom lua chon
  _buildSmartBody() {
    const stateObj = this._stateObj;
    const def = this._def;
    this._sliders = {};
    this._stateNodes = [];
    this._chipNodes = [];
    const body = [];
    if (def.now_playing) body.push(this._buildNowPlaying());
    if (!stateObj) return body;

    const rows = [];
    for (const action of smartActions(def, stateObj, this._hass)) {
      if (action.quick_only) continue;
      const row = action.row || 0;
      (rows[row] = rows[row] || []).push(action);
    }
    for (const actions of rows.filter(Boolean)) {
      const grid = el("div", { class: "grid" });
      grid.style.gridTemplateColumns = `repeat(${actions.length}, 1fr)`;
      for (const action of actions) {
        const iconNode = icon(action.icon);
        iconNode.style.setProperty("--mdc-icon-size", "26px");
        const node = el("button", { title: action.label }, [iconNode, el("span", { class: "label", text: action.label })]);
        node.style.height = "64px";
        node.addEventListener("click", () => this._pressSmart(action.id));
        this._stateNodes.push([action.id, node, iconNode]);
        grid.appendChild(node);
      }
      body.push(grid);
    }
    for (const slider of smartSliders(def, stateObj)) {
      body.push(
        this._buildSlider({
          key: slider.key,
          label: tr(slider.label),
          min: slider.min,
          max: slider.max,
          step: slider.step,
          unit: slider.unit,
          send: (value) => this._callEntity(slider.service, slider.data(value)),
        })
      );
    }
    for (const group of smartChips(def, stateObj)) {
      const chips = el("div", { class: "apps" });
      for (const value of group.options) {
        const node = el("button", { text: fmtAttr(this._hass, stateObj, group.attribute, value) });
        node.addEventListener("click", () => this._callEntity(group.service, { [group.attribute]: value }));
        this._chipNodes.push([group.attribute, value, node]);
        chips.appendChild(node);
      }
      body.push(el("div", { class: "slider-head" }, [el("span", { text: tr(`chip_${group.attribute}`) })]), chips);
    }
    if (this._controls.length) body.push(this._buildControlsGrid());
    return body;
  }

  // Luoi nut tu khai bao bang "controls"
  _buildControlsGrid() {
    return this._buildGrid({
      columns: this._config.columns || 3,
      buttons: this._controls.map((spec) => ({
        id: spec.entity || spec.path || spec.service,
        label: spec.name,
        wide: spec.wide,
        control: spec,
      })),
    });
  }

  // Noi dung pop-up cua den: nut nguon, roi do sang / nhiet do mau / mau / hieu ung neu den ho tro
  _buildLightBody() {
    const stateObj = this._stateObj;
    const attrs = (stateObj && stateObj.attributes) || {};
    const support = lightSupport(stateObj);
    this._sliders = {};
    this._stateNodes = [];
    const turnOn = (data) => this._callEntity("turn_on", data);

    const power = el("button", { title: "Power" }, [icon("mdi:power")]);
    power.addEventListener("click", () => this._callEntity("toggle"));
    this._stateNodes.push([null, power]);
    const body = [el("div", { class: "btn-row" }, [power])];

    if (support.brightness) {
      body.push(
        this._buildSlider({
          key: "brightness",
          label: tr("light_brightness"),
          min: 1,
          max: 100,
          unit: "%",
          send: (value) => turnOn({ brightness_pct: value }),
        })
      );
    }
    const minKelvin = attrs.min_color_temp_kelvin || 2000;
    const maxKelvin = attrs.max_color_temp_kelvin || 6500;
    if (support.temp && maxKelvin > minKelvin) {
      body.push(
        this._buildSlider({
          key: "temp",
          label: tr("light_temperature"),
          min: minKelvin,
          max: maxKelvin,
          step: 50,
          unit: " K",
          variant: "temp",
          send: (value) => turnOn({ color_temp_kelvin: value }),
        })
      );
    }
    if (support.color) {
      body.push(
        this._buildSlider({
          key: "hue",
          label: tr("light_color"),
          min: 0,
          max: 360,
          unit: "°",
          variant: "hue",
          send: (value) => turnOn({ hs_color: [value, 100] }),
        })
      );
      const swatches = el("div", { class: "swatches" });
      for (const [id, rgb] of Object.entries(LIGHT_COLORS)) {
        const node = el("button", { title: quickLabel(id) });
        node.style.background = `rgb(${rgb.join(",")})`;
        node.addEventListener("click", () => turnOn({ rgb_color: rgb }));
        swatches.appendChild(node);
      }
      body.push(swatches);
    }
    if ((attrs.effect_list || []).length) {
      const effects = el("div", { class: "apps" });
      for (const effect of attrs.effect_list) {
        const node = el("button", { text: effect });
        node.addEventListener("click", () => turnOn({ effect }));
        this._stateNodes.push([effect, node]);
        effects.appendChild(node);
      }
      body.push(effects);
    }
    if (this._controls.length) body.push(this._buildControlsGrid());
    return body;
  }

  // Noi dung pop-up cua cua cuon / rem: mo, dung, dong, roi vi tri va goc lat neu ho tro
  _buildCoverBody() {
    const stateObj = this._stateObj;
    const features = stateObj ? stateObj.attributes.supported_features || 0 : 0;
    this._sliders = {};
    this._stateNodes = [];
    const body = [];
    const row = el("div", { class: "btn-row tall" });
    for (const id of quickChoices(this._def, stateObj).filter((choice) => COVER_ACTIONS[choice])) {
      const node = el("button", { title: quickLabel(id) }, [icon(COVER_ACTIONS[id].icon)]);
      node.addEventListener("click", () => this._callEntity(COVER_ACTIONS[id].service));
      this._stateNodes.push([id, node]);
      row.appendChild(node);
    }
    if (this._stateNodes.length) body.push(row);
    if (features & COVER_SET_POSITION) {
      body.push(
        this._buildSlider({
          key: "position",
          label: tr("cover_position"),
          min: 0,
          max: 100,
          unit: "%",
          send: (value) => this._callEntity("set_cover_position", { position: value }),
        })
      );
    }
    if (features & COVER_SET_TILT) {
      body.push(
        this._buildSlider({
          key: "tilt",
          label: tr("cover_tilt"),
          min: 0,
          max: 100,
          unit: "%",
          send: (value) => this._callEntity("set_cover_tilt_position", { tilt_position: value }),
        })
      );
    }
    if (this._controls.length) body.push(this._buildControlsGrid());
    return body;
  }

  // Vong dieu huong cho loai theo entity (camera xoay): bon huong la bon nut khai bao trong "pad",
  // tam la nut "center" neu co, khong thi chi la icon trang tri. Chi bam, khong co cu chi keo.
  _buildControlPad(spec) {
    const pad = el("div", { class: "pad" });
    for (const id of ["up", "down", "left", "right"]) {
      if (!spec[id]) continue;
      const control = normalizeControl(spec[id]);
      const node = el("button", { class: id, title: control.name || id }, [
        icon(control.icon || `mdi:chevron-${id}`),
      ]);
      node.addEventListener("click", () => this._pressControl(control));
      pad.appendChild(node);
    }
    if (spec.center) {
      const control = normalizeControl(spec.center);
      const node = el("button", { class: "ok", title: control.name || "center" }, [this._controlIcon(control)]);
      node.addEventListener("click", () => this._pressControl(control));
      pad.appendChild(node);
    } else {
      pad.appendChild(el("div", { class: "center" }, [icon(this._icon)]));
    }
    return el("div", { class: "pad-static" }, [pad]);
  }

  // Noi dung pop-up cua vacuum / camera: hinh truc tiep (neu la camera) + luoi nut "controls"
  _buildEntityBody() {
    const body = [];
    if (this._def.live) {
      if (this._isOffline()) {
        body.push(
          el("div", { class: "offline-box" }, [
            icon("mdi:cctv-off"),
            el("span", { text: this._config.offline_text || "Camera offline" }),
          ])
        );
      } else {
        body.push(this._embedCamera());
      }
    }
    const pad = this._config.pad;
    if (pad && (pad.up || pad.down || pad.left || pad.right)) body.push(this._buildControlPad(pad));
    if (this._controls.length) body.push(this._buildControlsGrid());
    return body;
  }

  _openPopup() {
    if (this._popup) return;
    const host = document.createElement("div");
    host.style.setProperty("--ir-accent", this._color);
    const root = host.attachShadow({ mode: "open" });
    this._popup = host;

    const close = el("button", { class: "close", title: "Close" }, [icon("mdi:close")]);
    close.addEventListener("click", () => this._closePopup(true));

    const backdrop = el("div", { class: "backdrop" });
    backdrop.addEventListener("click", () => this._closePopup(true));

    this._controlNodes = [];
    const body = this._isClimate
      ? this._buildClimateBody()
      : this._def.kind === "light"
        ? this._buildLightBody()
        : this._def.kind === "cover"
          ? this._buildCoverBody()
          : this._isSmart
            ? this._buildSmartBody()
            : this._isEntityKind
        ? this._buildEntityBody()
        : this._def.layout === "pad"
          ? this._buildPadBody()
          : this._groups.map((group) => this._buildGrid(group));
    if ((this._config.apps || []).length) body.push(this._buildApps());
    this._updateControls();
    this._updateSliders();
    const sheet = el("div", { class: "sheet" }, [
      el("div", { class: "handle" }),
      el("div", { class: "header" }, [
        el("div", { class: "icon" }, [icon(this._icon)]),
        el("div", { class: "name", text: this._name }),
        close,
      ]),
      ...body,
    ]);

    root.append(el("style", { text: POPUP_CSS }), backdrop, sheet);
    this._bindSheetGestures(host, sheet);
    // Gan vao trong <home-assistant> chu khong phai document.body: cac card goc cua HA
    // (vd. thermostat) lay hass qua context cua phan tu nay, o ngoai thi chung hien trong.
    const app = document.querySelector("home-assistant");
    ((app && app.shadowRoot) || document.body).appendChild(host);

    this._prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    // Them mot muc lich su de nut Back cua dien thoai dong pop-up thay vi roi dashboard
    history.pushState({ irRemoteCard: true }, "");
    window.addEventListener("popstate", this._onPopState);
    window.addEventListener("keydown", this._onKeyDown);

    requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add("open")));
  }

  // Vuot xuong de dong, va chan cu chi cuon lot ra dashboard phia sau
  _bindSheetGestures(host, sheet) {
    let startY = null;
    let delta = 0;
    let dragged = false;

    sheet.addEventListener(
      "touchstart",
      (ev) => {
        // Chi bat dau keo khi noi dung dang o dau trang, de khong tranh voi viec cuon
        // Keo thanh truot khong phai la vuot de dong pop-up
        const onSlider = !!(ev.target.closest && ev.target.closest(".slider"));
        startY = sheet.scrollTop <= 0 && !onSlider ? ev.touches[0].clientY : null;
        delta = 0;
        dragged = false;
      },
      { passive: true }
    );
    sheet.addEventListener(
      "touchmove",
      (ev) => {
        if (startY === null) return;
        delta = ev.touches[0].clientY - startY;
        if (delta <= 0) {
          // Vuot len: de sheet tu cuon neu noi dung dai, con khong thi chan lai
          if (sheet.scrollHeight <= sheet.clientHeight && ev.cancelable) ev.preventDefault();
          return;
        }
        if (ev.cancelable) ev.preventDefault();
        if (delta > 8) dragged = true;
        sheet.classList.add("dragging");
        sheet.style.transform = `translateY(${delta}px)`;
      },
      { passive: false }
    );
    const end = () => {
      if (startY === null) return;
      startY = null;
      sheet.classList.remove("dragging");
      sheet.style.transform = "";
      if (delta > 110) this._closePopup(true);
    };
    sheet.addEventListener("touchend", end);
    sheet.addEventListener("touchcancel", end);
    // Vua keo xong thi khong tinh la bam nut
    sheet.addEventListener(
      "click",
      (ev) => {
        if (!dragged) return;
        dragged = false;
        ev.stopPropagation();
        ev.preventDefault();
      },
      true
    );

    // Lan chuot / cham tren nen mo khong duoc cuon trang phia sau
    host.addEventListener(
      "wheel",
      (ev) => {
        if (!ev.composedPath().includes(sheet) || sheet.scrollHeight <= sheet.clientHeight) ev.preventDefault();
      },
      { passive: false }
    );
    host.addEventListener(
      "touchmove",
      (ev) => {
        if (!ev.composedPath().includes(sheet) && ev.cancelable) ev.preventDefault();
      },
      { passive: false }
    );
  }

  // popHistory = true khi nguoi dung tu dong (bam X, nen, Esc): can lui lai muc lich su da them
  _closePopup(popHistory) {
    const host = this._popup;
    if (!host) return;
    this._popup = null;
    this._embedded = [];
    this._controlNodes = [];
    this._sliders = null;
    this._stateNodes = [];
    this._chipNodes = [];
    this._keyboard = null;
    this._nowPlaying = null;
    this._childDialog = false;
    document.documentElement.style.overflow = this._prevOverflow || "";
    window.removeEventListener("popstate", this._onPopState);
    window.removeEventListener("keydown", this._onKeyDown);
    if (popHistory) history.back();
    host.classList.remove("open");
    setTimeout(() => host.remove(), 300);
  }
}

const EDITOR_TAGS = { ir: "aurora-ir-remote-card-editor", smart: "aurora-smart-device-card-editor" };

// Form cau hinh trong trinh sua card cua dashboard. Bo ma "custom" van sua bang YAML.
// Cac truong cua mot nut gan voi entity, dung cho form cua vacuum / camera.
// La ham de nhan chu theo ngon ngu dang dung luc mo form.
const controlFields = () => ({
  entity: { label: tr("field_entity"), selector: { entity: {} } },
  name: { label: tr("field_name"), selector: { text: {} } },
  icon: { label: tr("field_icon"), selector: { icon: {} } },
  service: { label: tr("field_service"), selector: { text: {} } },
});
const popupControlFields = () => ({
  ...controlFields(),
  name: { label: tr("field_name_popup"), selector: { text: {} } },
  color: { label: tr("field_color"), selector: { text: {} } },
  path: { label: tr("field_path"), selector: { text: {} } },
  confirm: { label: tr("field_confirm"), selector: { text: {} } },
  wide: { label: tr("field_wide"), selector: { boolean: {} } },
});

class IrRemoteCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    setLang(hass);
    this._update();
  }

  static get flavour() {
    return undefined;
  }

  get _devices() {
    return devicesFor(this.constructor.flavour);
  }

  _resolve(config) {
    return resolveRemote(config, this.constructor.flavour) || {};
  }

  _deviceOf(config) {
    return deviceOf(config, this.constructor.flavour);
  }

  // Hang va bo ma dang chon, ke ca khi cau hinh dung mau co san (model)
  _irChoice(config) {
    const { device, model } = this._deviceOf(config);
    const meta = this._devices[device] || {};
    if (!meta.models) return {};
    if (config.brand) {
      const sets = irCodesets(device, config.brand).filter((set) => !set.value.startsWith("builtin:"));
      return { brand: config.brand, codeset: config.codeset || (sets[0] || {}).value };
    }
    const key = model && meta.models[model] ? model : Object.keys(meta.models)[0];
    return key ? { brand: (meta.brands || {})[key], codeset: `builtin:${key}` } : {};
  }

  _schema() {
    const def = this._resolve(this._config);
    const schema = [];
    if (!this._config.custom) {
      // Buoc 1: loai thiet bi. Buoc 2 (chi voi thiet bi hong ngoai): mau remote.
      const { device } = this._deviceOf(this._config);
      schema.push({
        name: "device",
        required: true,
        selector: {
          select: {
            mode: "dropdown",
            options: Object.entries(this._devices).map(([value, item]) => ({ value, label: tr(`device_${value}`, item.name) })),
          },
        },
      });
      // Thiet bi hong ngoai: chon hang, roi chon bo ma neu hang do co nhieu bo
      if ((this._devices[device] || {}).models) {
        const { brand } = this._irChoice(this._config);
        schema.push({
          name: "brand",
          required: true,
          selector: { select: { mode: "dropdown", options: irBrands(device) } },
        });
        const sets = brand ? irCodesets(device, brand) : [];
        if (sets.length > 1) {
          schema.push({ name: "codeset", required: true, selector: { select: { mode: "dropdown", options: sets } } });
        }
      }
    }
    if (def.kind) {
      schema.push({ name: "entity", label: "device_entity", required: true, selector: { entity: { domain: def.domains || def.domain } } });
    } else {
      const blasters = findBlasters(this._hass);
      const current = this._config.blaster;
      if (current && !blasters.includes(current)) blasters.unshift(current);
      schema.push(
        {
          name: "blaster",
          required: true,
          selector: { select: { mode: "dropdown", custom_value: true, options: blasters } },
        },
        { name: "entity", selector: { entity: {} } }
      );
    }
    schema.push(
      { name: "name", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
      { name: "color", selector: { ui_color: {} } }
    );
    if (!def.kind) schema.push({ name: "availability_entity", selector: { entity: {} } });
    if (def.transport === "remote") {
      const sources = (this._stateObj() && this._stateObj().attributes.source_list) || [];
      for (const item of this._config.apps || []) {
        const app = typeof item === "string" ? item : item.name;
        if (!sources.includes(app)) sources.push(app);
      }
      schema.push(
        { name: "remote_entity", selector: { entity: { domain: "remote" } } },
        { name: "apps", selector: { select: { multiple: true, reorder: true, custom_value: true, mode: "dropdown", options: sources } } }
      );
    }
    // Camera dung o goc phai cho Online / Offline nen khong co tuy chon nay
    if (!def.live) {
      schema.push({ name: "badge_entity", selector: { entity: {} } }, { name: "badge_icon", selector: { icon: {} } });
    }

    if (def.kind === "entity") {
      // Bon nut huong cua vong dieu huong trong pop-up (vd. cac nut xoay cua camera)
      schema.push(
        {
          name: "pad",
          type: "expandable",
          title: tr("pad_title"),
          schema: ["up", "down", "left", "right"].map((name) => ({ name, selector: { entity: {} } })),
        },
        { name: "columns", selector: { number: { min: 2, max: 6, mode: "box" } } }
      );
    }
    // Khoa cua: mac dinh hoi lai truoc khi mo
    if (def.kind === "smart" && def.domain === "lock") schema.push({ name: "confirm", selector: { boolean: {} } });
    schema.push({ name: "hide_quick", selector: { boolean: {} } });
    // Nut nhanh: chon tu cac chuc nang cua loai thiet bi (khong can khi da an hang nut)
    if (this._config.hide_quick) {
      if (def.kind === "entity") {
        schema.push({
          name: "controls",
          selector: {
            object: { multiple: true, label_field: "name", description_field: "entity", fields: popupControlFields() },
          },
        });
      }
    } else if (def.kind === "entity") {
      schema.push(
        {
          name: "quick",
          label: "quick_entities",
          selector: { object: { multiple: true, label_field: "name", description_field: "entity", fields: controlFields() } },
        },
        {
          name: "controls",
          selector: {
            object: { multiple: true, label_field: "name", description_field: "entity", fields: popupControlFields() },
          },
        }
      );
    } else {
      const options =
        def.kind === "climate"
          ? climateModes(this._stateObj()).map((mode) => ({ value: mode, label: tr(`hvac_${mode}`, mode) }))
          : def.kind === "smart"
            ? [
                ...(this._stateObj() ? smartSliders(def, this._stateObj()) : []).map((slider) => ({
                  value: slider.key,
                  label: `${tr(slider.label)} (${tr("quick_slider")})`,
                })),
                ...smartActions(def, this._stateObj(), this._hass).map((action) => ({ value: action.id, label: action.label })),
              ]
          : def.kind
            ? quickChoices(def, this._stateObj()).map((id) => ({ value: id, label: quickLabel(id) }))
            : remoteButtons(def).map((btn) => ({ value: btn.id, label: buttonTitle(btn) }));
      schema.push({
        name: "quick",
        selector: { select: { multiple: true, reorder: true, mode: "dropdown", options } },
      });
    }
    return schema;
  }

  _stateObj() {
    return this._config.entity ? this._hass.states[this._config.entity] : undefined;
  }

  // Du lieu dua vao form: dien san nut nhanh mac dinh de nguoi dung thay va sua duoc
  _formData() {
    const def = this._resolve(this._config);
    const data = { ...this._config };
    if (def.kind === "smart" && def.domain === "lock") data.confirm = this._config.confirm !== false;
    if (!this._config.custom) {
      // Hien cau hinh cu (remote: ...) duoi dang loai thiet bi + mau
      const { device } = this._deviceOf(this._config);
      data.device = device;
      Object.assign(data, this._irChoice(this._config));
      delete data.model;
      delete data.remote;
    }
    if (def.kind === "entity") {
      data.quick = (this._config.quick || defaultQuick(def)).map(normalizeControl);
      data.controls = (this._config.controls || []).map(normalizeControl);
    } else if (!Array.isArray(data.quick)) {
      data.quick = defaultQuick(def, this._stateObj());
    }
    // O chon chi lam viec voi ten ung dung; icon rieng (neu co) duoc ghep lai khi luu
    if (Array.isArray(data.apps)) {
      data.apps = data.apps.map((item) => (typeof item === "string" ? item : item.name));
      if (!data.apps.length) delete data.apps;
    }
    return data;
  }

  _update() {
    if (!this._config || !this._hass) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (field) => tr(`label_${field.label || field.name}`, field.name);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        // Bo cac o de trong de YAML gon va card dung gia tri mac dinh
        for (const key of ["entity", "name", "icon", "color", "availability_entity", "blaster", "badge_entity", "badge_icon", "remote_entity"]) {
          if (config[key] === "" || config[key] == null) delete config[key];
        }
        if (Array.isArray(config.apps)) {
          // Giu lai icon rieng da khai bao bang YAML cho nhung ung dung van con duoc chon
          const custom = Object.fromEntries(
            (this._config.apps || []).filter((item) => typeof item !== "string").map((item) => [item.name, item])
          );
          config.apps = config.apps.map((name) => custom[name] || name);
          if (!config.apps.length) delete config.apps;
        }
        if (!config.hide_quick) delete config.hide_quick;
        if (config.pad) {
          // Bo huong de trong; khong con huong nao thi bo ca "pad"
          const pad = Object.fromEntries(Object.entries(config.pad).filter(([, v]) => v !== "" && v != null));
          if (Object.keys(pad).length) config.pad = pad;
          else delete config.pad;
        }
        if (config.columns == null || config.columns === "") delete config.columns;
        const before = this._deviceOf(this._config);
        const deviceChanged = config.device !== before.device;
        const meta = this._devices[config.device] || {};
        const old = this._irChoice(this._config);
        let irChanged = false;
        delete config.model;
        if (!meta.models) {
          delete config.brand;
          delete config.codeset;
        } else {
          // Doi loai thiet bi: ve hang dau tien co mau san. Doi hang: ve bo ma dau tien cua hang do.
          if (deviceChanged) config.brand = Object.values(meta.brands || {})[0];
          const sets = config.brand ? irCodesets(config.device, config.brand) : [];
          if (deviceChanged || config.brand !== old.brand || !sets.some((set) => set.value === config.codeset)) {
            config.codeset = (sets[0] || {}).value;
          }
          irChanged = deviceChanged || config.brand !== old.brand || config.codeset !== old.codeset;
          if (config.codeset && config.codeset.startsWith("builtin:")) {
            // Mau co san luu theo kieu cu (model) de cau hinh gon va card khong can nap kho ma
            config.model = config.codeset.slice(8);
            delete config.brand;
            delete config.codeset;
          } else if (!config.brand) {
            delete config.brand;
            delete config.codeset;
          }
        }
        const def = this._resolve(config);
        // "confirm" chi luu khi nguoi dung tat no; chi co o khoa cua
        if (config.confirm !== false || def.domain !== "lock") delete config.confirm;
        // Nut nhanh cua den, cua cuon, thiet bi thong minh phu thuoc entity: doi entity, hoac danh sach
        // rong (form dien san khi chua chon entity), thi quay ve mac dinh
        if (["light", "cover", "smart"].includes(def.kind)) {
          const empty = Array.isArray(config.quick) && !config.quick.length;
          if (empty || config.entity !== this._config.entity) delete config.quick;
        }
        // Loai theo entity khong dung bo phat IR
        if (def.kind) {
          delete config.blaster;
          delete config.availability_entity;
        }
        if (!config.custom && (deviceChanged || irChanged)) {
          // Doi loai thiet bi hoac mau remote: nut nhanh cu khong con dung, quay ve mac dinh moi
          delete config.quick;
          if (def.kind !== "entity") delete config.controls;
          if (def.transport !== "remote") {
            delete config.apps;
            delete config.remote_entity;
          }
        } else if (def.kind === "entity") {
          // Bo truong rong trong tung nut; khong con nut nao thi bo ca danh sach
          for (const key of ["quick", "controls"]) {
            const list = (config[key] || [])
              .map((item) => Object.fromEntries(Object.entries(item || {}).filter(([, v]) => v !== "" && v != null && v !== false)))
              .filter((item) => item.entity || item.path || item.service);
            if (list.length) config[key] = list;
            else delete config[key];
          }
        }
        this._config = config;
        this.dispatchEvent(
          new CustomEvent("config-changed", { bubbles: true, composed: true, detail: { config } })
        );
      });
      this.appendChild(this._form);
    }
    // Danh sach hang va bo ma nam trong kho: nap xong thi ve lai form
    if (!CODES && !this._codesAsked && (this._devices[this._deviceOf(this._config).device] || {}).models) {
      this._codesAsked = true;
      loadCodes().then(() => this._update()).catch(() => {});
    }
    this._form.hass = this._hass;
    this._form.data = this._formData();
    this._form.schema = this._schema();
  }
}

// Ten cu "ir-remote-card" duoc giu lai de dashboard da cau hinh tu truoc khong bi hong
// "flavour" chon nhom thiet bi cua card: "ir", "smart", hoac bo trong cho card cu (ca hai nhom)
const define = (tag, base, flavour) => {
  if (customElements.get(tag)) return;
  customElements.define(
    tag,
    class extends base {
      static get flavour() {
        return flavour;
      }
    }
  );
};
define("aurora-device-control-card-editor", IrRemoteCardEditor);
define("ir-remote-card-editor", IrRemoteCardEditor);
define(EDITOR_TAGS.ir, IrRemoteCardEditor, "ir");
define(EDITOR_TAGS.smart, IrRemoteCardEditor, "smart");
if (!customElements.get("aurora-device-control-card")) {
  define("aurora-device-control-card", IrRemoteCard);
  define("ir-remote-card", IrRemoteCard);
  define("aurora-ir-remote-card", IrRemoteCard, "ir");
  define("aurora-smart-device-card", IrRemoteCard, "smart");
  window.customCards = window.customCards || [];
  window.customCards.push(
    {
      type: "aurora-ir-remote-card",
      name: "Aurora IR Remote Card",
      description: "One-way infrared devices sent through an ESPHome IR blaster, with a built-in code database: TVs, fans, speakers, projectors, set-top boxes, LED lights and more",
    },
    {
      type: "aurora-smart-device-card",
      name: "Aurora Smart Device Card",
      description: "Two-way devices controlled through their entity: air conditioners, lights, roller doors, locks, fans, sockets, media players, water heaters, vacuums, cameras and more",
    }
  );
  console.info(
    `%c AURORA-DEVICE-CONTROL-CARD %c v${VERSION} `,
    "background:#6AA9F0;color:#fff",
    "background:#333;color:#fff"
  );
}
