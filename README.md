# Aurora Device Control Card

Card Lovelace cho Home Assistant, điều khiển nhiều loại thiết bị theo cùng một kiểu giao diện: quạt, loa, TV dùng remote hồng ngoại (phát qua bộ phát IR chạy ESPHome), điều hòa, robot hút bụi và camera.

Mỗi thiết bị chỉ cần vài dòng cấu hình. Card tự vẽ nút ngoài dashboard, pop-up điều khiển đầy đủ, và tự báo khi thiết bị hoặc bộ phát IR mất kết nối.

```yaml
type: custom:aurora-device-control-card
device: fan
model: hsv
blaster: sr06_t1_3s_01
```

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

1. Chép `dist/aurora-device-control-card.js` vào `/config/www/aurora-device-control-card.js`.
2. Vào **Settings → Dashboards → Resources**, thêm `/local/aurora-device-control-card.js`, loại **JavaScript module**.

## Thiết bị hỗ trợ

Chọn theo hai bước: **loại thiết bị** (`device`), rồi **mẫu remote hồng ngoại** (`model`) nếu loại đó dùng hồng ngoại.

| `device` | `model` | Thiết bị | Giao thức | Tình trạng |
|---|---|---|---|---|
| `fan` | `hsv` | Quạt trần đèn HSV | NEC | Đã dùng thật |
| `fan` | `toshiba` | Quạt Toshiba LSD10 | NEC | Đã dùng thật |
| `speaker` | `lg` | Loa thanh LG | Samsung (32 bit) | Đã dùng thật |
| `tv` | `samsung` | TV Samsung | Samsung (32 bit) | Đã dùng thật (Q70) |
| `tv` | `lg` | TV LG | NEC | **Chưa thử trên TV thật** |
| `tv` | `sony` | TV Sony | Sony SIRC | **Chưa thử trên TV thật** |
| `climate` | Không có | Điều hòa (entity climate) | Không dùng mã IR | Đã dùng thật |
| `vacuum` | Không có | Robot hút bụi (entity vacuum) | Không dùng mã IR | Đã dùng thật (Roborock) |
| `camera` | Không có | Camera (entity camera) | Không dùng mã IR | Đã dùng thật (Tapo C260) |

Mã của TV LG và TV Sony lấy từ các bảng mã phổ biến của hai hãng, tác giả không có TV để kiểm tra. Nếu nút nào không chạy trên TV của bạn, hãy mở issue kèm tên model.

## Cấu hình

Thêm card từ giao diện: sửa dashboard, bấm **Add card**, tìm **Aurora Device Control Card**. Form cấu hình cho chọn loại thiết bị, mẫu remote, bộ phát IR (card tự liệt kê các node ESPHome có action `send_...`), màu icon, ô trạng thái góc phải và các **nút nhanh** trên card. Danh sách chức năng của nút nhanh đổi theo loại thiết bị đang chọn, thêm bớt và kéo đổi thứ tự được.

Cũng có thể viết YAML với các tùy chọn sau:

| Tùy chọn | Bắt buộc | Mô tả |
|---|---|---|
| `device` | Có | Loại thiết bị: `fan`, `speaker`, `tv`, `climate`, `vacuum`, `camera` |
| `model` | Với `fan`, `speaker`, `tv` | Mẫu remote hồng ngoại, xem bảng trên. Bỏ trống thì lấy mẫu đầu tiên của loại đó |
| `blaster` | Với thiết bị hồng ngoại | Tên node ESPHome phát IR, là phần giữa của `esphome.<blaster>_send_nec` |
| `entity` | Với `climate`, `vacuum`, `camera` | Entity của thiết bị. Với thiết bị hồng ngoại thì tùy chọn: entity cho biết thiết bị đang bật hay tắt, ví dụ `media_player` của TV |
| `name` | Không | Tên hiển thị, mặc định lấy theo thiết bị |
| `icon` | Không | Icon hiển thị, mặc định lấy theo thiết bị |
| `color` | Không | Màu icon. Nhận tên màu của Home Assistant (`teal`, `purple`, `amber`...) hoặc mã CSS (`"#5CC8BE"`). Mặc định mỗi loại một màu: quạt xanh ngọc, loa và robot tím nhạt, TV và camera xanh dương, điều hòa xanh da trời |
| `quick` | Không | Các nút nhanh ở hàng dưới của card, một hoặc nhiều nút. Thiết bị hồng ngoại: danh sách id nút, ví dụ `[power, swing, timer]`. Điều hòa: danh sách chế độ, ví dụ `[cool, dry]`. Robot hút bụi và camera: danh sách nút theo entity (xem bên dưới). Bỏ trống thì dùng mặc định của loại thiết bị |
| `badge_entity` | Không | Entity hiện ở ô trạng thái góc phải, ví dụ cảm biến nhiệt độ phòng hoặc tiến độ dọn của robot. Mặc định: điều hòa hiện nhiệt độ đang đặt, thiết bị hồng ngoại hiện icon remote |
| `badge_icon` | Không | Icon đứng trước chữ trong ô trạng thái, ví dụ `mdi:thermometer` |
| `availability_entity` | Không | Entity dùng để biết bộ phát IR còn kết nối. Mặc định card tự theo dõi mọi entity có tên chứa `<blaster>_` |
| `custom` | Không | Bộ mã hồng ngoại tự khai báo, thay cho `device` và `model` (xem bên dưới) |

## Cách dùng

- Bấm **icon** của card: gửi lệnh nguồn (thiết bị hồng ngoại) hoặc bật tắt (điều hòa).
- Bấm **các nút hàng dưới**: các lệnh hay dùng.
- Bấm **phần còn lại** của card: mở pop-up điều khiển đầy đủ. Vuốt xuống để đóng.
- Khi bộ phát IR hoặc thiết bị mất kết nối, card mờ đi và hiện "Unavailable".

### Thiết bị hồng ngoại

Remote hồng ngoại chỉ gửi lệnh một chiều, nên mặc định card không biết thiết bị đang bật hay tắt và hiện viền nét đứt. Nếu thiết bị có một entity khác báo được trạng thái (TV có kết nối mạng, ổ cắm đo điện), khai báo nó ở `entity`: card sẽ bỏ viền nét đứt và đổi màu khi thiết bị bật.

```yaml
type: custom:aurora-device-control-card
device: tv
model: samsung
blaster: s06_ir
entity: media_player.samsung_tv
quick: [power, mute, vol_down, vol_up]
```

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
controls:                              # lưới nút trong pop-up, dưới hình trực tiếp
  - { entity: switch.tapo_privacy, name: RIÊNG TƯ, icon: mdi:eye-off, color: "#F2C879" }
  - { entity: button.tapo_move_up, icon: mdi:chevron-up }
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
- **Camera:** pop-up hiện hình trực tiếp. Khi camera mất kết nối, card có viền đỏ và pop-up hiện ô báo offline (đổi chữ bằng `offline_text`). `columns` đổi số cột của lưới nút, mặc định 3.

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

Với giao thức gửi dạng `data` + `nbits` (ví dụ Sony), mỗi nút khai báo `data` thay cho `command`, và đặt `nbits` ở mức chung hoặc từng nút. Thay `buttons` bằng `groups` nếu cần nhiều lưới có số cột khác nhau: `groups: [{ columns: 4, buttons: [...] }]`.

## Dự án liên quan

- [Aurora Home Theme](https://github.com/lipnguyen-ha/ha-aurora-home-theme): theme nền gradient, thẻ kính mờ cho Home Assistant. Card này lấy màu nền và bo góc theo theme đang dùng.
- [WOL + Presence](https://github.com/lipnguyen-ha/ha-wol-presence): integration bật máy tính bằng Wake-on-LAN và báo máy đang thức hay ngủ, dùng được cho cả Mac.

## Giấy phép

MIT.
