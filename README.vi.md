[English](README.md) | **Tiếng Việt**

# Aurora Device Control Card

Card Lovelace cho Home Assistant, điều khiển nhiều loại thiết bị theo cùng một kiểu giao diện: quạt, loa, TV dùng remote hồng ngoại (phát qua bộ phát IR chạy ESPHome), điều hòa, đèn (kể cả đèn RGB), cửa cuốn và rèm, robot hút bụi và camera.

Mỗi thiết bị chỉ cần vài dòng cấu hình. Card tự vẽ nút ngoài dashboard, pop-up điều khiển đầy đủ, và tự báo khi thiết bị hoặc bộ phát IR mất kết nối.

## Ảnh chụp

<img src="https://raw.githubusercontent.com/lipnguyen-ha/ha-aurora-device-control-card/main/screenshots/01-ir-devices.png" width="400" alt="Card TV, điều hoà, quạt và loa hồng ngoại cùng hàng nút nhanh"> <img src="https://raw.githubusercontent.com/lipnguyen-ha/ha-aurora-device-control-card/main/screenshots/02-smart-devices.png" width="400" alt="Card robot hút bụi, quạt hồng ngoại và camera">

Thiết bị hồng ngoại (TV, quạt, loa), điều hoà, robot hút bụi và camera, trên theme Aurora Home Things Dark. Khi thiết bị đang bật, card theo màu "bật" của theme:

<img src="https://raw.githubusercontent.com/lipnguyen-ha/ha-aurora-device-control-card/main/screenshots/03-on-light-theme.png" width="600" alt="Card TV và điều hoà đang bật, nền trắng">

File này đăng ký **hai card**, bạn chọn đúng card trong danh sách thêm card:

| Card | Dùng cho | Ví dụ |
|---|---|---|
| **Aurora IR Remote Card** (`custom:aurora-ir-remote-card`) | Thiết bị hồng ngoại một chiều, phát qua bộ phát IR chạy ESPHome. Card không biết được trạng thái thật của thiết bị | Quạt, TV, loa, máy chiếu |
| **Aurora Smart Device Card** (`custom:aurora-smart-device-card`) | Thiết bị hai chiều, điều khiển qua entity của Home Assistant. Card hiện trạng thái thật | Điều hòa, đèn, cửa cuốn, khóa cửa, quạt thông minh, ổ cắm, loa và TV thông minh, bình nóng lạnh, robot hút bụi, camera |

```yaml
type: custom:aurora-ir-remote-card
device: fan
model: hsv
blaster: sr06_t1_3s_01
```

```yaml
type: custom:aurora-smart-device-card
device: light
entity: light.den_led_phong_khach
```

Card gốc `custom:aurora-device-control-card` nhận cả hai nhóm và vẫn chạy, nên dashboard đang có không cần sửa. Trong card gốc, `device: fan` là quạt hồng ngoại; quạt thông minh thì dùng Smart Device Card.

Card, pop-up và form cấu hình hiện tiếng Việt khi Home Assistant đặt tiếng Việt, và hiện tiếng Anh với mọi ngôn ngữ khác.

Card này trước đây tên là IR Remote Card. Cấu hình cũ (`type: custom:ir-remote-card`, `remote: hsv_fan`) vẫn chạy.

## Yêu cầu

- Home Assistant bản gần đây (đã thử trên 2026.10).
- Với thiết bị hồng ngoại: bộ phát IR chạy ESPHome, có khai báo action gửi mã (xem mục "Action cần có trên bộ phát ESPHome").

Card không phụ thuộc Bubble Card, button-card hay card-mod.

## Cài đặt

### Qua HACS

1. Mở HACS, bấm menu ba chấm ở góc phải trên, chọn **Custom repositories**.
2. Dán `https://github.com/lipnguyen-ha/ha-aurora-device-control-card`, chọn loại **Dashboard**, bấm **Add**.
3. Tìm **Aurora Device Control Card** trong HACS, bấm **Download**.
4. Tải lại trang dashboard (trên app điện thoại: Settings → Companion app → Debugging → Reset frontend cache).

### Chép tay

1. Chép `dist/aurora-device-control-card.js` và `dist/aurora-ir-codes.js` vào `/config/www/`. File thứ hai là kho mã hồng ngoại và phải nằm cạnh file thứ nhất.
2. Vào **Settings → Dashboards → Resources**, thêm `/local/aurora-device-control-card.js`, loại **JavaScript module**.

## Thiết bị hỗ trợ

### Aurora IR Remote Card

Chọn theo hai bước: **loại thiết bị** (`device`), rồi **mẫu remote hồng ngoại** (`model`).

| `device` | `model` | Thiết bị | Giao thức | Tình trạng |
|---|---|---|---|---|
| `fan` | `hsv` | Quạt trần đèn HSV | NEC | Đã dùng thật |
| `fan` | `toshiba` | Quạt Toshiba LSD10 | NEC | Đã dùng thật |
| `fan` | `senko` | Quạt Senko (remote 12 bit) | Pronto | **Chưa thử trên quạt thật** |
| `fan` | `mitsubishi` | Quạt Mitsubishi (R30J) | Pronto | **Chưa thử trên quạt thật** |
| `fan` | `kdk` | Quạt KDK (K14X5, K14Y5) | Pronto | **Chưa thử trên quạt thật** |
| `speaker` | `lg` | Loa thanh LG | Samsung (32 bit) | Đã dùng thật |
| `tv` | `samsung` | TV Samsung | Samsung (32 bit) | Đã dùng thật (Q70) |
| `tv` | `lg` | TV LG | NEC | **Chưa thử trên TV thật** |
| `tv` | `sony` | TV Sony | Sony SIRC | **Chưa thử trên TV thật** |
| `tv` | `tcl` | TV TCL | Pronto (RCA) | **Chưa thử trên TV thật** |
| `tv` | `panasonic` | TV Panasonic | Pronto (Kaseikyo) | **Chưa thử trên TV thật** |
| `tv` | `toshiba` | TV Toshiba | NEC | **Chưa thử trên TV thật** |
| `tv` | `hisense` | TV Hisense | NEC | **Chưa thử trên TV thật** |
| `tv` | `sharp` | TV Sharp Aquos | Pronto (Sharp) | **Chưa thử trên TV thật** |
| `projector` | `epson` | Máy chiếu Epson | NEC | **Chưa thử trên máy thật** |
| `projector` | `benq` | Máy chiếu BenQ (remote W1070) | NEC | **Chưa thử trên máy thật** |
| `projector` | `viewsonic` | Máy chiếu ViewSonic (remote PA503W) | NEC | **Chưa thử trên máy thật** |
| `projector` | `optoma` | Máy chiếu Optoma (remote đời cũ) | NEC | **Chưa thử trên máy thật** |

### Kho mã hồng ngoại có sẵn

Ngoài các mẫu trong bảng trên, IR Remote Card kèm một kho mã dựng từ [Flipper-IRDB](https://github.com/Lucaslhm/Flipper-IRDB) (CC0): khoảng 650 mục hãng và 19.000 mã cho 14 loại thiết bị: TV, quạt, loa và soundbar, máy chiếu, amply, đầu thu, hộp phát trực tuyến, đầu đĩa, đèn LED và dây LED, máy lọc không khí, máy sưởi, máy tạo ẩm, robot hút bụi và màn hình.

Trong form cấu hình, chọn **loại thiết bị**, rồi **hãng**. Hãng nào có nhiều hơn một bộ mã thì hiện thêm danh sách **Bộ mã**: nhà sản xuất đổi mã qua các đời sản phẩm, nên nếu bấm không ăn, hãy thử bộ kế tiếp. Các bộ tác giả đã thử được ghi "có sẵn" và đứng đầu.

```yaml
type: custom:aurora-ir-remote-card
device: tv
brand: Philips
codeset: r6-0        # tùy chọn; bỏ trống thì lấy bộ đầu tiên của hãng
blaster: sr06_t1_3s_01
```

- Mọi mã trong kho đều gửi qua action `send_pronto` của bộ phát, nên với các mã này bộ phát chỉ cần action đó.
- Kho mã là một file riêng (`aurora-ir-codes.js`, khoảng 1 MB) nằm cạnh file card. Nó chỉ được tải khi có card hoặc form thật sự dùng đến, nên dashboard chỉ dùng mẫu có sẵn sẽ không tải nó.
- Phím nào card nhận ra (nguồn, âm lượng, mũi tên, số...) được xếp vào bố cục quen thuộc; các phím khác của remote giữ tên gốc và nằm ở phần phím phụ.
- Đây là mã do cộng đồng thu lại, tác giả **chưa thử**. Một bộ mã có thể thiếu phím hoặc không đúng với máy của bạn.
- Dựng lại kho từ bản Flipper-IRDB mới hơn: `python3 -I tools/build_ir_codes.py <thư mục Flipper-IRDB> dist/aurora-ir-codes.js`.

### Aurora Smart Device Card

| `device` | `model` | Thiết bị | Giao thức | Trạng thái |
|---|---|---|---|---|
| `appletv` | Không có | Apple TV (entity media_player và remote) | Qua mạng, không dùng IR | Mới thêm |
| `climate` | Không có | Điều hòa (entity climate) | Không dùng mã IR | Đã dùng thật |
| `light` | Không có | Đèn: bật tắt, chỉnh sáng, trắng hoặc RGB (entity light) | Không dùng mã IR | **Chưa thử trên đèn màu thật** |
| `cover` | Không có | Cửa cuốn, rèm, mành, cửa gara (entity cover) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `vacuum` | Không có | Robot hút bụi (entity vacuum) | Không dùng mã IR | Đã dùng thật (Roborock) |
| `camera` | Không có | Camera (entity camera) | Không dùng mã IR | Đã dùng thật (Tapo C260) |
| `lock` | Không có | Khóa cửa (entity lock) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `fan` | Không có | Quạt thông minh, máy lọc không khí (entity fan) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `switch` | Không có | Ổ cắm, công tắc (entity switch hoặc input_boolean) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `media_player` | Không có | Loa thông minh, TV thông minh (entity media_player) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `water_heater` | Không có | Bình nóng lạnh (entity water_heater) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `humidifier` | Không có | Máy tạo ẩm, máy hút ẩm (entity humidifier) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `alarm` | Không có | Báo động (entity alarm_control_panel) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `valve` | Không có | Van nước (entity valve) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |
| `lawn_mower` | Không có | Robot cắt cỏ (entity lawn_mower) | Không dùng mã IR | **Chưa thử trên thiết bị thật** |

Các mẫu ghi "chưa thử" lấy mã từ kho mã công khai ([Flipper-IRDB](https://github.com/Lucaslhm/Flipper-IRDB), [irdb](https://github.com/probonopd/irdb)) hoặc bảng mã phổ biến của hãng, tác giả không có thiết bị để kiểm tra. Một hãng có thể dùng nhiều bộ mã qua các đời máy, nên nếu nút nào không chạy trên thiết bị của bạn, hãy mở issue kèm tên model.

- Các mẫu ghi giao thức **Pronto** gửi qua action `send_pronto` của bộ phát, không cần thêm action riêng cho từng hãng.
- TV Toshiba đời mới chạy VIDAA do Hisense sản xuất: nếu mẫu `toshiba` không ăn, hãy thử `hisense`.
- Máy chiếu BenQ và ViewSonic có mã bật và mã tắt riêng: icon của card bật máy, nút `OFF` tắt máy. Epson dùng một phím nguồn và yêu cầu bấm thêm lần nữa để tắt.
- Không tìm được mã công khai cho quạt Asia, TV Casper và đầu thu của các nhà mạng Việt Nam (VNPT, FPT, Viettel, K+). Hãy thêm bằng `custom` sau khi học mã từ remote thật.
- Mẫu `senko` dùng cho loại remote 12 bit mà nhiều quạt bán ở Việt Nam dùng chung. Quạt hãng khác cùng loại chip có thể nhận được, nhưng mỗi hãng thường đặt mã riêng.

## Cấu hình

Thêm card từ giao diện: sửa dashboard, bấm **Add card**, tìm **Aurora IR Remote Card** hoặc **Aurora Smart Device Card**. Form cấu hình cho chọn loại thiết bị, mẫu remote, bộ phát IR (card tự liệt kê các node ESPHome có action `send_...`), màu icon, ô trạng thái góc phải và các **nút nhanh** trên card. Danh sách chức năng của nút nhanh đổi theo loại thiết bị đang chọn, thêm bớt và kéo đổi thứ tự được.

Cũng có thể viết YAML với các tùy chọn sau:

| Tùy chọn | Bắt buộc | Mô tả |
|---|---|---|
| `device` | Có | Loại thiết bị, xem hai bảng ở trên |
| `brand`, `codeset` | Không | Thiết bị hồng ngoại: lấy mã từ kho có sẵn thay cho `model` (xem ở trên) |
| `model` | Với thiết bị hồng ngoại | Mẫu remote hồng ngoại, xem bảng trên. Bỏ trống thì lấy mẫu đầu tiên của loại đó |
| `blaster` | Với thiết bị hồng ngoại | Tên node ESPHome phát IR, là phần giữa của `esphome.<blaster>_send_nec` |
| `entity` | Với thiết bị thông minh | Entity của thiết bị. Với thiết bị hồng ngoại thì tùy chọn: entity cho biết thiết bị đang bật hay tắt, ví dụ `media_player` của TV |
| `name` | Không | Tên hiển thị, mặc định lấy theo thiết bị |
| `icon` | Không | Icon hiển thị, mặc định lấy theo thiết bị |
| `color` | Không | Màu icon. Nhận tên màu của Home Assistant (`teal`, `purple`, `amber`...) hoặc mã CSS (`"#5CC8BE"`). Mặc định mỗi loại một màu: quạt xanh ngọc, loa và robot tím nhạt, TV và camera xanh dương, Apple TV hồng, điều hòa xanh da trời |
| `quick` | Không | Các nút nhanh ở hàng dưới của card, một hoặc nhiều nút. Thiết bị hồng ngoại: danh sách id nút, ví dụ `[power, swing, timer]`. Điều hòa: danh sách chế độ, ví dụ `[cool, dry]`. Đèn: mức sáng, màu trắng và màu, ví dụ `[b50, warm, red]`. Cửa cuốn: `[open, stop, close]`. Thiết bị thông minh khác: danh sách id hành động (xem bảng bên dưới). Robot hút bụi, camera và ổ cắm: danh sách nút theo entity (xem bên dưới). Bỏ trống thì dùng mặc định của loại thiết bị |
| `hide_quick` | Không | `true` để ẩn hàng nút nhanh. Card khi đó thấp bằng một tile của Home Assistant (56px), xếp cạnh tile đèn và công tắc cho đều. Bấm vào card vẫn mở pop-up đầy đủ |
| `badge_entity` | Không | Entity hiện ở ô trạng thái góc phải, ví dụ cảm biến nhiệt độ phòng hoặc tiến độ dọn của robot. Mặc định: điều hòa hiện nhiệt độ đang đặt, thiết bị hồng ngoại hiện icon remote |
| `badge_icon` | Không | Icon đứng trước chữ trong ô trạng thái, ví dụ `mdi:progress-check`. Điều hòa mặc định là `mdi:thermometer` |
| `ir_gap` | Không | Khoảng cách tối thiểu giữa hai lệnh hồng ngoại liên tiếp, tính bằng mili giây, mặc định 220. Tăng lên nếu kéo trên vòng điều hướng mà thiết bị bỏ sót bước, giảm xuống nếu thiết bị nhận tốt và bạn muốn nhanh hơn |
| `availability_entity` | Không | Entity dùng để biết bộ phát IR còn kết nối. Mặc định card tự theo dõi mọi entity có tên chứa `<blaster>_` |
| `custom` | Không | Bộ mã hồng ngoại tự khai báo, thay cho `device` và `model` (xem bên dưới) |
| `off_timer` | Không | `true` để thêm mục **Hẹn giờ tắt** vào pop-up (xem [Hẹn giờ tắt](#hẹn-giờ-tắt)) |
| `off_entity` | Không | Entity tắt khi hết giờ, thay cho entity của card hoặc phím tắt hồng ngoại |

## Cách dùng

- Bấm **icon** của card: gửi lệnh nguồn (thiết bị hồng ngoại) hoặc bật tắt (điều hòa).
- Bấm **các nút hàng dưới**: các lệnh hay dùng.
- Bấm **phần còn lại** của card: mở pop-up điều khiển đầy đủ. Vuốt xuống để đóng.
- Khi bộ phát IR hoặc thiết bị mất kết nối, card mờ đi và hiện "Unavailable".

### Hẹn giờ tắt

Đặt `off_timer: true`, cuối pop-up sẽ có mục **Hẹn giờ tắt**:

- Các nút **15p · 30p · 1h · 1h30 · 2h · 3h** bắt đầu ngay. Bấm nút khác thì hẹn lại.
- **− / +** chọn thời gian tuỳ ý, mỗi bước 15 phút, rồi bấm **Bắt đầu**. Khi đang hẹn giờ, mục này hiện giờ tắt và nút **Huỷ**; card hiện chip `⏱ 1:29`.

Thứ được tắt khi hết giờ:

- Card có entity (điều hoà, đèn, TV...): entity đó, bằng `homeassistant.turn_off`. Đã tắt sẵn thì bỏ qua.
- Card hồng ngoại: phím **tắt riêng** của bộ mã (ví dụ `ALL OFF` của quạt HSV). Remote chỉ có một phím nguồn bật/tắt luân phiên thì không có hẹn giờ, vì gửi phím đó có thể làm thiết bị bật lên. Muốn dùng thì trỏ `off_entity` tới một switch biết trạng thái thật.
- Có `off_entity` thì luôn dùng `off_entity`.

Việc đếm giờ chạy trên Home Assistant, không phải trong trình duyệt, nên đóng app vẫn tắt đúng giờ. Mọi card dùng chung một kho, nên card mới chỉ cần `off_timer: true`. Thêm ba phần sau vào Home Assistant một lần:

```yaml
# configuration.yaml: the store (keeps every pending timer, survives a restart)
template:
  - triggers:
      - trigger: event
        event_type: aurora_off_timer
    sensor:
      - name: "Aurora off timers"
        unique_id: aurora_off_timers
        device_class: timestamp
        state: >
          {% set old = this.attributes.timers if this.attributes.timers is defined and this.attributes.timers is mapping else {} %}
          {% set d = trigger.event.data %}
          {% set ns = namespace(ends=[]) %}
          {% for k, v in old.items() if k != d.key %}{% set ns.ends = ns.ends + [v.finishes_at] %}{% endfor %}
          {% if (d.minutes | int(0)) > 0 %}{% set ns.ends = ns.ends + [(now() + timedelta(minutes=d.minutes | int)).isoformat()] %}{% endif %}
          {{ (ns.ends | min) if ns.ends else none }}
        attributes:
          timers: >
            {% set old = this.attributes.timers if this.attributes.timers is defined and this.attributes.timers is mapping else {} %}
            {% set d = trigger.event.data %}
            {% set ns = namespace(items=[]) %}
            {% for k, v in old.items() if k != d.key %}{% set ns.items = ns.items + [(k, v)] %}{% endfor %}
            {% if (d.minutes | int(0)) > 0 %}
              {% set ns.items = ns.items + [(d.key, {'finishes_at': (now() + timedelta(minutes=d.minutes | int)).isoformat(), 'name': d.name | default(d.key), 'action': d.action})] %}
            {% endif %}
            {{ dict(ns.items) }}

# scripts.yaml: what the card calls
aurora_off_timer:
  alias: "Aurora: off timer"
  mode: queued
  fields:
    key: { required: true, selector: { text: {} } }
    minutes: { required: true, selector: { number: { min: 0, max: 720 } } }
    name: { selector: { text: {} } }
    action: { selector: { object: {} } }
  sequence:
    - event: aurora_off_timer
      event_data:
        key: "{{ key }}"
        minutes: "{{ minutes | int(0) }}"
        name: "{{ name | default(key) }}"
        action: "{{ action | default({}) }}"

# automations.yaml: runs a timer when it ends, and catches up after a restart
- alias: "Aurora: run off timers"
  mode: queued
  triggers:
    - trigger: time
      at: sensor.aurora_off_timers
      id: due
    - trigger: homeassistant
      event: start
      id: start
  actions:
    - if: [{ condition: trigger, id: start }]
      then: [{ delay: "00:01:00" }]
    - variables:
        due: >
          {% set t = state_attr('sensor.aurora_off_timers', 'timers') %}
          {% set ns = namespace(l=[]) %}
          {% if t is mapping %}{% for k, v in t.items() if as_datetime(v.finishes_at) <= now() + timedelta(seconds=5) %}{% set ns.l = ns.l + [{'key': k, 'action': v.action}] %}{% endfor %}{% endif %}
          {{ ns.l }}
    - repeat:
        for_each: "{{ due }}"
        sequence:
          - variables:
              cmd: "{{ repeat.item.action if repeat.item.action is mapping else {} }}"
              allowed: "{{ (cmd.action | default('')) | regex_match('^(homeassistant\\.turn_off|esphome\\.[a-z0-9_]+_send_[a-z0-9]+)$') }}"
              already_off: "{{ cmd.target is defined and cmd.target.entity_id is defined and is_state(cmd.target.entity_id, 'off') }}"
          - if: "{{ allowed and not already_off }}"
            then:
              - action: "{{ cmd.action }}"
                target: "{{ cmd.target | default({}) }}"
                data: "{{ cmd.data | default({}) }}"
                continue_on_error: true
          - event: aurora_off_timer
            event_data: { key: "{{ repeat.item.key }}", minutes: 0 }
```

Bấm phím tắt trên card thì hẹn giờ của card đó bị huỷ.

### Thiết bị hồng ngoại

Remote hồng ngoại chỉ gửi lệnh một chiều, nên mặc định card không biết thiết bị đang bật hay tắt, và hiện một icon remote ở góc phải để báo điều đó. Nếu thiết bị có một entity khác báo được trạng thái (TV có kết nối mạng, ổ cắm đo điện), khai báo nó ở `entity`: card sẽ đổi màu khi thiết bị bật.

```yaml
type: custom:aurora-device-control-card
device: tv
model: samsung
blaster: s06_ir
entity: media_player.samsung_tv
quick: [power, mute, vol_down, vol_up]
```

### Apple TV

Apple TV điều khiển qua mạng bằng tích hợp Apple TV của Home Assistant, không cần bộ phát IR:

```yaml
type: custom:aurora-device-control-card
device: appletv
entity: media_player.appletv
apps: [Netflix, YouTube, Spotify]
```

- Bấm icon: bật hoặc cho ngủ.
- Nút hàng dưới: mặc định là phát/dừng, quay lại, home. Chọn nút khác bằng `quick`.
- Góc phải: icon cho biết đang phát hay tạm dừng.
- Pop-up: một vòng tròn điều hướng ở giữa (bấm bốn hướng và OK, hoặc giữ tay kéo trên vòng tròn như bàn chạm: kéo tới đâu con trỏ đi từng ô tới đó, kéo ngược lại thì đi ngược lại), bên dưới là hai hàng nút: quay lại, phát/dừng, nút TV; rồi cặp tua 10 giây, cặp âm lượng và nút nguồn.
- Khi đang phát hoặc tạm dừng, đầu pop-up hiện ảnh bìa, tên nội dung và ứng dụng.
- **Ô gõ chữ:** tự hiện khi Apple TV mở chỗ nhập chữ (tìm kiếm, mật khẩu), bình thường ẩn đi. Gõ tới đâu chữ hiện trên Apple TV tới đó, nhấn Enter để chọn.
- `apps`: các ứng dụng hiện thành một hàng nút cuộn ngang trong pop-up, bấm để mở. Tên lấy theo danh sách nguồn của `media_player`. Các ứng dụng phổ biến (YouTube, Netflix, Spotify, Plex...) có sẵn icon; đặt icon riêng bằng `apps: [{ name: Infuse, icon: mdi:play-box }]`.

Card tự tìm entity remote và cảm biến bàn phím theo tên của `media_player` (`remote.<tên>`, `binary_sensor.<tên>_keyboard_focus`). Nếu tên khác, khai báo `remote_entity` và `keyboard_entity`.

### TV hồng ngoại

Pop-up của TV (Samsung, LG, Sony) dùng cùng bố cục với Apple TV: vòng tròn điều hướng ở giữa (bấm hoặc giữ tay kéo như bàn chạm), bên dưới là các phím cơ bản: quay lại, home, tắt tiếng, nguồn vào, âm lượng, chuyển kênh và nguồn. Phím số, MENU, GUIDE, EXIT, bốn phím màu và các phím phát nhạc nằm trong phần **"Phím số và phím khác"**, bấm để mở.

### Điều hòa

Điều hòa hồng ngoại trong ESPHome đã là một entity `climate` đầy đủ, nên card điều khiển thẳng entity đó, không cần `blaster`:

```yaml
type: custom:aurora-device-control-card
device: climate
entity: climate.s06_ir_toshiba_ac
```

- Bấm icon: bật hoặc tắt.
- Nút hàng dưới: các chế độ điều hòa hỗ trợ (làm lạnh, hút ẩm, quạt...), chế độ đang chạy được tô màu.
- Góc phải: nhiệt độ đang đặt.
- Pop-up: card thermostat gốc của Home Assistant, có vòng chỉnh nhiệt độ, chọn chế độ, tốc độ quạt và đảo gió nếu điều hòa hỗ trợ.

### Đèn

Card điều khiển một entity `light` và chỉ hiện những gì đèn đó làm được:

```yaml
type: custom:aurora-device-control-card
device: light
entity: light.den_led_phong_khach
quick: [b50, warm, red, blue]   # tùy chọn
```

- Bấm icon: bật hoặc tắt. Khi đèn màu đang bật, icon và viền card mang màu đèn đang phát (trừ khi bạn tự đặt `color`).
- Góc phải: độ sáng hiện tại.
- Nút hàng dưới, chọn bằng `quick`: mức sáng `b25`, `b50`, `b75`, `b100`; màu trắng `warm` (2700 K), `neutral` (4000 K), `cool` (6500 K); màu `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple`, `pink`. Nút nào đèn không hỗ trợ thì không hiện. Mặc định là `[b25, b50, b100]`; đèn chỉ bật tắt thì không có nút nhanh, nên bật `hide_quick` cho loại này.
- Pop-up: nút nguồn, rồi thanh độ sáng, thanh nhiệt độ màu, thanh màu kèm tám màu có sẵn, và các hiệu ứng của đèn; phần nào đèn không hỗ trợ thì không hiện. Thanh trượt gửi lệnh khi bạn thả tay.
- `controls` thêm các nút của riêng bạn ở phía dưới, giống robot hút bụi.

### Cửa cuốn, rèm và mành

Card điều khiển một entity `cover`, nên dùng được cho mọi thứ Home Assistant coi là cover: cửa cuốn, cửa gara, rèm, mành, mái che.

```yaml
type: custom:aurora-device-control-card
device: cover
entity: cover.cua_cuon
icon: mdi:garage               # tùy chọn; mặc định là hình cửa cuốn
```

- Bấm icon: đang đóng thì mở, đang mở thì đóng.
- Góc phải: phần trăm đang mở, hoặc trạng thái (đang mở, đã đóng...) nếu thiết bị không báo vị trí.
- Hàng dưới: khi thiết bị báo vị trí, đó là một **thanh trượt kéo ngay trên card** để đặt độ mở (`quick: [position]`; `tilt` thêm thanh cho góc lật). Nếu không thì là các nút mở, dừng, đóng (`quick: [open, stop, close]`), chỉ gồm những nút thiết bị hỗ trợ. Có thể trộn, ví dụ `[position, stop]`.
- Pop-up: ba nút lớn mở, dừng, đóng, thanh vị trí, và thanh góc lật cho mành có lá; phần nào thiết bị không hỗ trợ thì không hiện.
- `controls` thêm các nút của riêng bạn ở phía dưới, ví dụ đèn hoặc khóa của cửa.

Cửa cuốn là lối vào nhà, nên hãy cân nhắc ai mở được dashboard trước khi đặt card này lên đó.

### Khóa cửa, quạt thông minh, loa và các thiết bị thông minh khác

Các loại này chạy theo cùng một cách: card đọc những gì entity hỗ trợ và chỉ hiện những thứ đó. `quick` nhận các id hành động trong bảng.

```yaml
type: custom:aurora-smart-device-card
device: lock
entity: lock.cua_chinh
```

| `device` | Bấm icon | Góc phải | Hành động (`quick`) | Pop-up có thêm |
|---|---|---|---|---|
| `lock` | Đang khóa thì mở khóa, còn lại thì khóa | Trạng thái | `lock`, `unlock`, `open` | |
| `fan` | Bật / tắt | Tốc độ | `low`, `medium`, `high`, `power`, `oscillate`, `direction` | Thanh tốc độ, các chế độ |
| `media_player` | Bật / tắt, hoặc phát / dừng nếu thiết bị không có lệnh nguồn | Icon đang phát hay tạm dừng | `previous`, `play_pause`, `next`, `vol_down`, `mute`, `vol_up`, `power` | Nội dung đang phát, thanh âm lượng, nguồn phát và chế độ âm thanh |
| `water_heater` | Bật / tắt | Nhiệt độ đặt | `power`, `mode:<tên>` | Thanh nhiệt độ, các chế độ |
| `humidifier` | Bật / tắt | Độ ẩm đặt | `power`, `mode:<tên>` | Thanh độ ẩm, các chế độ |
| `alarm` | Mở pop-up | Trạng thái | `arm_home`, `arm_away`, `arm_night`, `arm_vacation`, `disarm` | |
| `valve` | Mở / đóng | Vị trí hoặc trạng thái | `open`, `stop`, `close` | Thanh vị trí |
| `lawn_mower` | Mở pop-up | Trạng thái | `start`, `pause`, `dock` | |

- **Khóa cửa:** mở khóa và mở cửa đều hỏi lại trước khi làm; đặt `confirm: false` để tắt câu hỏi. Card sáng lên khi cửa đang không khóa.
- **Mã:** nếu khóa hoặc báo động cần mã, card hỏi mã bằng hộp thoại của trình duyệt mỗi lần. Mã hiện rõ khi gõ và không được lưu lại.
- **Ổ cắm và công tắc** (`device: switch`): bấm icon để bật tắt. Hiện công suất bằng `badge_entity`, thêm nút bằng `quick` và `controls` giống robot hút bụi.
- **Thanh trượt trên card:** `quick` còn nhận id thanh trượt, kéo ngay trên card: `percentage` (tốc độ quạt), `humidity` (độ ẩm), `position` (van nước), `volume` (âm lượng), `temperature` (bình nóng lạnh), và `brightness` cho đèn. Quạt, máy tạo ẩm và van nước mặc định dùng thanh trượt.
- `controls` thêm các nút của riêng bạn ở cuối mọi pop-up.

### Robot hút bụi và camera

Hai loại này theo dõi một entity, còn các nút do bạn khai báo bằng danh sách entity hoặc action.

```yaml
type: custom:aurora-device-control-card
device: vacuum
entity: vacuum.roborock
name: Roborock
badge_entity: sensor.roborock_cleaning_progress
badge_icon: mdi:progress-check
quick:
  - { entity: button.roborock_clean_all, name: Dọn nhà }
  - { entity: button.roborock_clean_living_room, name: Dọn PK }
  - { icon: mdi:home-import-outline, service: vacuum.return_to_base }
```

```yaml
type: custom:aurora-device-control-card
device: camera
entity: camera.tapo_hd_stream
privacy_entity: switch.tapo_privacy    # góc phải hiện Online / Riêng tư / Offline
quick:
  - { entity: switch.tapo_privacy, name: Riêng tư, icon: mdi:eye-off }
pad:                                   # vòng điều hướng trong pop-up, cho camera xoay được
  up: button.tapo_move_up
  down: button.tapo_move_down
  left: button.tapo_move_left
  right: button.tapo_move_right
columns: 4                             # số cột của lưới nút bên dưới
controls:                              # lưới nút trong pop-up
  - { entity: switch.tapo_privacy, name: RIÊNG TƯ, icon: mdi:eye-off, color: "#F2C879" }
  - { entity: siren.tapo_siren, name: CÒI, icon: mdi:alarm-light, confirm: "Bật/tắt còi?" }
  - { entity: select.tapo_night_vision, name: ĐÊM, icon: mdi:weather-night }
  - { name: LỊCH SỬ, icon: mdi:history, path: /media-browser/browser, wide: true }
```

Mỗi nút trong `quick` và `controls` nhận:

| Trường | Mô tả |
|---|---|
| `entity` | Entity của nút. Viết tắt được: chỉ ghi entity id thay cho cả khối |
| `name` | Chữ hiển thị. Ở `quick`, bỏ trống thì lấy tên entity. Ở `controls`, bỏ trống thì nút chỉ có icon |
| `icon` | Bỏ trống thì lấy icon của entity |
| `color` | Màu khi entity đang bật |
| `action` | `toggle`, `press`, `more-info` hoặc `navigate`. Mặc định theo loại entity: `button` thì bấm, `switch`/`light`/`siren`... thì bật tắt, còn lại mở hộp thoại của entity |
| `service` | Gọi một action của Home Assistant thay cho bấm entity, ví dụ `vacuum.return_to_base`. Action chạy trên `entity` của nút, không có thì trên entity của card. Thêm tham số bằng `data` |
| `path` | Đường dẫn để chuyển trang (tự hiểu là `navigate`) |
| `confirm` | Câu hỏi xác nhận trước khi thực hiện |
| `wide` | `true` để nút chiếm cả hàng |

- **Robot hút bụi:** card đổi màu khi robot đang dọn, đang về đế hoặc tạm dừng. Khi chưa khai báo `quick`, card có sẵn một nút dừng dọn và quay về dock. Không khai báo `controls` thì bấm vào card sẽ mở hộp thoại gốc của Home Assistant.
- **Camera:** pop-up hiện hình trực tiếp có tiếng, kèm thanh điều khiển của trình phát. Đặt `audio: false` nếu muốn hình không tiếng. Khi camera mất kết nối, card có viền đỏ và pop-up hiện ô báo offline (đổi chữ bằng `offline_text`). `pad` khai báo bốn nút hướng (`up`, `down`, `left`, `right`, thêm `center` nếu muốn có nút ở tâm), hiện thành vòng tròn điều hướng giống remote TV. `columns` đổi số cột của lưới nút, mặc định 3.

## Action cần có trên bộ phát ESPHome

Với thiết bị hồng ngoại, card gọi `esphome.<blaster>_send_<giao thức>`. Khai báo các action tương ứng trong YAML của bộ phát:

```yaml
api:
  actions:
    # Dung cho: quat HSV, quat Toshiba, TV LG
    - action: send_nec
      variables:
        address: int
        command: int
        repeats: int
      then:
        - remote_transmitter.transmit_nec:
            address: !lambda 'return (uint16_t) address;'
            command: !lambda 'return (uint16_t) command;'
            command_repeats: !lambda 'return (uint8_t) repeats;'

    # Dung cho: TV Samsung, loa LG
    - action: send_samsung
      variables:
        address: int
        command: int
      then:
        - remote_transmitter.transmit_samsung:
            data: !lambda 'return ((uint32_t) address << 16) | ((uint32_t) command & 0xFFFF);'
            nbits: 32

    # Dung cho: TV Sony (Sony yeu cau gui lap lai 3 lan)
    - action: send_sony
      variables:
        data: int
        nbits: int
      then:
        - remote_transmitter.transmit_sony:
            data: !lambda 'return (uint32_t) data;'
            nbits: !lambda 'return (uint8_t) nbits;'
            repeat:
              times: 3
              wait_time: 45ms

    # Dung cho: TV TCL, TV Panasonic, quat Senko, quat Mitsubishi, va nut khai bao bang "pronto"
    - action: send_pronto
      variables:
        data: string
      then:
        - remote_transmitter.transmit_pronto:
            data: !lambda 'return data;'
```

## Thêm remote hồng ngoại của riêng bạn

Khai báo bộ mã ngay trong card bằng `custom`:

```yaml
type: custom:aurora-device-control-card
blaster: ten_node_esphome
custom:
  name: Quạt của tôi
  icon: mdi:fan
  color: "#5CC8BE"
  protocol: nec        # phần đuôi của action esphome.<blaster>_send_<protocol>
  address: 65025       # địa chỉ mặc định cho mọi nút
  repeats: 2           # bỏ dòng này nếu action không nhận repeats
  button_height: 54
  power: power         # id nút gửi khi bấm icon
  quick: [swing, down, up]
  buttons:
    - { id: down, icon: mdi:fan-minus, command: 46155 }
    - { id: power, icon: mdi:power, command: 64515, color: "#e53935" }
    - { id: up, icon: mdi:fan-plus, command: 63495 }
    - { id: swing, icon: mdi:arrow-oscillating, label: SWING, command: 60435 }
```

Nút có `label` hiện icon nhỏ kèm chữ, nút không có `label` chỉ hiện icon to. `{ spacer: true }` tạo một ô trống. Từng nút có thể ghi đè `address`, `protocol`, `repeats`.

Nút có mã dạng chuỗi Pronto thì khai báo `pronto: "0000 006D ..."` thay cho `command`; nút đó luôn gửi qua action `send_pronto`.

Với giao thức gửi dạng `data` + `nbits` (ví dụ Sony), mỗi nút khai báo `data` thay cho `command`, và đặt `nbits` ở mức chung hoặc từng nút. Thay `buttons` bằng `groups` nếu cần nhiều lưới có số cột khác nhau: `groups: [{ columns: 4, buttons: [...] }]`.

## Dự án liên quan

- [Aurora Home Theme](https://github.com/lipnguyen-ha/ha-aurora-home-theme): theme nền gradient, thẻ kính mờ cho Home Assistant. Card này lấy màu nền và bo góc theo theme đang dùng.
- [WOL + Presence](https://github.com/lipnguyen-ha/ha-wol-presence): integration bật máy tính bằng Wake-on-LAN và báo máy đang thức hay ngủ, dùng được cho cả Mac.

## Giấy phép

MIT.
