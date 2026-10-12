# IR Remote Card

Card Lovelace cho Home Assistant, dùng để điều khiển các thiết bị hồng ngoại "không trạng thái" (quạt, loa, đèn dùng remote) qua bộ phát IR chạy ESPHome.

Mỗi thiết bị chỉ cần ba dòng cấu hình. Card tự vẽ nút ngoài dashboard, pop-up remote đầy đủ, và tự báo khi bộ phát IR mất kết nối.

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
2. Dán `https://github.com/philipnguyen8588/ha-ir-remote-card`, chọn loại **Dashboard**, bấm **Add**.
3. Tìm **IR Remote Card** trong HACS, bấm **Download**.
4. Tải lại trang dashboard (trên app điện thoại: Settings → Companion app → Debugging → Reset frontend cache).

### Chép tay

1. Chép `dist/ir-remote-card.js` vào `/config/www/ir-remote-card.js`.
2. Vào **Settings → Dashboards → Resources**, thêm `/local/ir-remote-card.js`, loại **JavaScript module**.

## Cấu hình

| Tùy chọn | Bắt buộc | Mô tả |
|---|---|---|
| `remote` | Có | Tên bộ mã: `hsv_fan`, `toshiba_fan`, `lg_soundbar` |
| `blaster` | Có | Tên node ESPHome phát IR, là phần giữa của `esphome.<blaster>_send_nec` |
| `name` | Không | Tên hiển thị, mặc định lấy theo bộ mã |
| `icon` | Không | Icon hiển thị, mặc định lấy theo bộ mã |
| `availability_entity` | Không | Entity dùng để biết bộ phát còn kết nối. Mặc định card tự theo dõi mọi entity có tên chứa `<blaster>_` |
| `custom` | Không | Bộ mã tự khai báo, thay cho `remote` (xem bên dưới) |

## Cách dùng

- Bấm **icon** của card: gửi lệnh nguồn.
- Bấm **ba nút hàng dưới**: các lệnh hay dùng.
- Bấm **phần còn lại** của card: mở pop-up remote đầy đủ.
- Khi bộ phát IR mất kết nối, card mờ đi và hiện "Unavailable".

Vì remote hồng ngoại chỉ gửi lệnh một chiều, card không biết thiết bị đang bật hay tắt.

## Bộ mã có sẵn

| `remote` | Thiết bị | Giao thức |
|---|---|---|
| `hsv_fan` | Quạt trần đèn HSV | NEC |
| `toshiba_fan` | Quạt Toshiba LSD10 | NEC |
| `lg_soundbar` | Loa thanh LG | Samsung (32 bit) |

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

## Giấy phép

MIT.
