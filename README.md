# IR Remote Card

Card Lovelace cho Home Assistant, dùng để điều khiển các thiết bị hồng ngoại (quạt, loa, TV, điều hòa) qua bộ phát IR chạy ESPHome.

Mỗi thiết bị chỉ cần vài dòng cấu hình. Card tự vẽ nút ngoài dashboard, pop-up remote đầy đủ, và tự báo khi bộ phát IR mất kết nối.

```yaml
type: custom:ir-remote-card
remote: hsv_fan
blaster: sr06_t1_3s_01
```

## Yêu cầu

- Home Assistant bản gần đây (đã thử trên 2026.10).
- Bộ phát IR chạy ESPHome, có khai báo action gửi mã, ví dụ `esphome.<tên_node>_send_nec` và `esphome.<tên_node>_send_samsung`.

Card không phụ thuộc Bubble Card, button-card hay card-mod.

## Cài đặt

### Qua HACS

1. Mở HACS, bấm menu ba chấm ở góc phải trên, chọn **Custom repositories**.
2. Dán `https://github.com/lipnguyen-ha/ha-ir-remote-card`, chọn loại **Dashboard**, bấm **Add**.
3. Tìm **IR Remote Card** trong HACS, bấm **Download**.
4. Tải lại trang dashboard (trên app điện thoại: Settings → Companion app → Debugging → Reset frontend cache).

### Chép tay

1. Chép `dist/ir-remote-card.js` vào `/config/www/ir-remote-card.js`.
2. Vào **Settings → Dashboards → Resources**, thêm `/local/ir-remote-card.js`, loại **JavaScript module**.

## Cấu hình

Thêm card từ giao diện: sửa dashboard, bấm **Add card**, tìm **IR Remote Card**. Form cấu hình cho chọn loại remote và bộ phát IR (card tự liệt kê các node ESPHome có action `send_...`). Cũng có thể viết YAML với các tùy chọn sau:

| Tùy chọn | Bắt buộc | Mô tả |
|---|---|---|
| `remote` | Có | Tên bộ mã, xem bảng "Bộ mã có sẵn" |
| `blaster` | Có, trừ `climate` | Tên node ESPHome phát IR, là phần giữa của `esphome.<blaster>_send_nec` |
| `entity` | Chỉ với `climate` | Entity cho biết thiết bị đang bật hay tắt, ví dụ `media_player` của TV. Với `remote: climate` đây là entity điều hòa |
| `name` | Không | Tên hiển thị, mặc định lấy theo bộ mã |
| `icon` | Không | Icon hiển thị, mặc định lấy theo bộ mã |
| `color` | Không | Màu icon. Nhận tên màu của Home Assistant (`teal`, `purple`, `amber`...) hoặc mã CSS (`"#5CC8BE"`). Mặc định mỗi loại thiết bị một màu: quạt xanh ngọc, loa tím nhạt, TV xanh dương, điều hòa xanh da trời |
| `availability_entity` | Không | Entity dùng để biết bộ phát còn kết nối. Mặc định card tự theo dõi mọi entity có tên chứa `<blaster>_` |
| `custom` | Không | Bộ mã tự khai báo, thay cho `remote` (xem bên dưới) |

## Cách dùng

- Bấm **icon** của card: gửi lệnh nguồn.
- Bấm **ba nút hàng dưới**: các lệnh hay dùng.
- Bấm **phần còn lại** của card: mở pop-up remote đầy đủ.
- Khi bộ phát IR mất kết nối, card mờ đi và hiện "Unavailable".

Remote hồng ngoại chỉ gửi lệnh một chiều, nên mặc định card không biết thiết bị đang bật hay tắt và hiện viền nét đứt. Nếu thiết bị có một entity khác báo được trạng thái (TV có kết nối mạng, ổ cắm đo điện), khai báo nó ở `entity`: card sẽ bỏ viền nét đứt và đổi màu khi thiết bị bật.

```yaml
type: custom:ir-remote-card
remote: samsung_tv
blaster: s06_ir
entity: media_player.samsung_tv
```

## Điều hòa

Điều hòa hồng ngoại trong ESPHome đã là một entity `climate` đầy đủ, nên card điều khiển thẳng entity đó, không cần `blaster`:

```yaml
type: custom:ir-remote-card
remote: climate
entity: climate.s06_ir_toshiba_ac
```

- Bấm icon: bật hoặc tắt.
- Ba nút hàng dưới: các chế độ đầu tiên mà điều hòa hỗ trợ (làm lạnh, hút ẩm, quạt...), chế độ đang chạy được tô màu.
- Góc phải: nhiệt độ đang đặt.
- Pop-up: card thermostat gốc của Home Assistant, có vòng chỉnh nhiệt độ, chọn chế độ, tốc độ quạt và đảo gió nếu điều hòa hỗ trợ.

## Bộ mã có sẵn

| `remote` | Thiết bị | Giao thức | Tình trạng |
|---|---|---|---|
| `hsv_fan` | Quạt trần đèn HSV | NEC | Đã dùng thật |
| `toshiba_fan` | Quạt Toshiba LSD10 | NEC | Đã dùng thật |
| `lg_soundbar` | Loa thanh LG | Samsung (32 bit) | Đã dùng thật |
| `samsung_tv` | TV Samsung | Samsung (32 bit) | Đã dùng thật (Q70) |
| `lg_tv` | TV LG | NEC | **Chưa thử trên TV thật** |
| `sony_tv` | TV Sony | Sony SIRC | **Chưa thử trên TV thật** |
| `climate` | Điều hòa (entity climate) | Không dùng mã IR | Đã dùng thật |

Mã của `lg_tv` và `sony_tv` lấy từ các bảng mã phổ biến của hai hãng, tác giả không có TV để kiểm tra. Nếu nút nào không chạy trên TV của bạn, hãy mở issue kèm tên model.

## Action cần có trên bộ phát ESPHome

Card gọi `esphome.<blaster>_send_<giao thức>`. Khai báo các action tương ứng trong YAML của bộ phát:

```yaml
api:
  actions:
    # Dung cho: hsv_fan, toshiba_fan, lg_tv
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

    # Dung cho: samsung_tv, lg_soundbar
    - action: send_samsung
      variables:
        address: int
        command: int
      then:
        - remote_transmitter.transmit_samsung:
            data: !lambda 'return ((uint32_t) address << 16) | ((uint32_t) command & 0xFFFF);'
            nbits: 32

    # Dung cho: sony_tv (Sony yeu cau gui lap lai 3 lan)
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

## Thêm thiết bị của riêng bạn

Khai báo bộ mã ngay trong card bằng `custom`:

```yaml
type: custom:ir-remote-card
blaster: ten_node_esphome
custom:
  name: Quạt của tôi
  icon: mdi:fan
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
