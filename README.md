**English** | [Tiếng Việt](README.vi.md)

# Aurora Device Control Card

A Lovelace card for Home Assistant that controls many kinds of devices with one consistent interface: fans, speakers and TVs that use an infrared remote (sent through an IR blaster running ESPHome), air conditioners, lights (including RGB), roller doors and curtains, robot vacuums and cameras.

Each device needs only a few lines of configuration. The card draws the buttons on the dashboard and the full control pop-up by itself, and tells you when the device or the IR blaster loses its connection.

This one file registers **two cards**, so you pick the right one in the card picker:

| Card | For | Example |
|---|---|---|
| **Aurora IR Remote Card** (`custom:aurora-ir-remote-card`) | One-way infrared devices, sent through an ESPHome IR blaster. The card cannot know the device's real state | Fans, TVs, speakers, projectors |
| **Aurora Smart Device Card** (`custom:aurora-smart-device-card`) | Two-way devices controlled through their Home Assistant entity. The card shows the real state | Air conditioners, lights, roller doors, locks, smart fans, sockets, media players, water heaters, vacuums, cameras |

```yaml
type: custom:aurora-ir-remote-card
device: fan
model: hsv
blaster: sr06_t1_3s_01
```

```yaml
type: custom:aurora-smart-device-card
device: light
entity: light.living_room_led
```

The original card `custom:aurora-device-control-card` accepts both groups and keeps working, so existing dashboards need no change. In it, `device: fan` means the infrared fan; use the Smart Device Card for a smart fan.

The card, its pop-up and its configuration form are shown in Vietnamese when Home Assistant is set to Vietnamese, and in English for every other language.

This card was previously named IR Remote Card. The old configuration (`type: custom:ir-remote-card`, `remote: hsv_fan`) still works.

## Requirements

- A recent Home Assistant release (tested on 2026.10).
- For infrared devices: an IR blaster running ESPHome, with the actions that send codes declared (see "Actions required on the ESPHome blaster").

The card does not depend on Bubble Card, button-card or card-mod.

## Installation

### Via HACS

1. Open HACS, click the three-dot menu in the top right corner, and choose **Custom repositories**.
2. Paste `https://github.com/lipnguyen-ha/ha-aurora-device-control-card`, choose the type **Dashboard**, and click **Add**.
3. Find **Aurora Device Control Card** in HACS and click **Download**.
4. Reload the dashboard page (in the phone app: Settings → Companion app → Debugging → Reset frontend cache).

### Manual copy

1. Copy `dist/aurora-device-control-card.js` and `dist/aurora-ir-codes.js` into `/config/www/`. The second file is the infrared code database and must sit next to the first.
2. Go to **Settings → Dashboards → Resources** and add `/local/aurora-device-control-card.js` with the type **JavaScript module**.

## Supported devices

### Aurora IR Remote Card

Choose in two steps: the **device type** (`device`), then the **infrared remote model** (`model`).

| `device` | `model` | Device | Protocol | Status |
|---|---|---|---|---|
| `fan` | `hsv` | HSV ceiling fan with light | NEC | Tested on real hardware |
| `fan` | `toshiba` | Toshiba LSD10 fan | NEC | Tested on real hardware |
| `fan` | `senko` | Senko fan (12-bit remote) | Pronto | **Not tested on a real fan** |
| `fan` | `mitsubishi` | Mitsubishi fan (R30J) | Pronto | **Not tested on a real fan** |
| `fan` | `kdk` | KDK fan (K14X5, K14Y5) | Pronto | **Not tested on a real fan** |
| `speaker` | `lg` | LG soundbar | Samsung (32-bit) | Tested on real hardware |
| `tv` | `samsung` | Samsung TV | Samsung (32-bit) | Tested on real hardware (Q70) |
| `tv` | `lg` | LG TV | NEC | **Not tested on a real TV** |
| `tv` | `sony` | Sony TV | Sony SIRC | **Not tested on a real TV** |
| `tv` | `tcl` | TCL TV | Pronto (RCA) | **Not tested on a real TV** |
| `tv` | `panasonic` | Panasonic TV | Pronto (Kaseikyo) | **Not tested on a real TV** |
| `tv` | `toshiba` | Toshiba TV | NEC | **Not tested on a real TV** |
| `tv` | `hisense` | Hisense TV | NEC | **Not tested on a real TV** |
| `tv` | `sharp` | Sharp Aquos TV | Pronto (Sharp) | **Not tested on a real TV** |
| `projector` | `epson` | Epson projector | NEC | **Not tested on real hardware** |
| `projector` | `benq` | BenQ projector (W1070 remote) | NEC | **Not tested on real hardware** |
| `projector` | `viewsonic` | ViewSonic projector (PA503W remote) | NEC | **Not tested on real hardware** |
| `projector` | `optoma` | Optoma projector (older remote) | NEC | **Not tested on real hardware** |

### The built-in infrared code database

Besides the models in the table above, the IR Remote Card ships with a code database built from [Flipper-IRDB](https://github.com/Lucaslhm/Flipper-IRDB) (CC0): about 650 brand entries and 19,000 codes across 14 device types: TVs, fans, speakers and soundbars, projectors, AV receivers, set-top boxes, streaming boxes, disc players, LED lights and strips, air purifiers, heaters, humidifiers, robot vacuums and monitors.

In the configuration form, choose the **device type**, then the **brand**. When a brand has more than one code set, a **Code set** list appears: manufacturers change codes between product generations, so if the buttons do nothing, try the next set. The sets tested by the author are marked "built in" and come first.

```yaml
type: custom:aurora-ir-remote-card
device: tv
brand: Philips
codeset: r6-0        # optional; the first set of the brand is used when omitted
blaster: sr06_t1_3s_01
```

- Every code from the database is sent through the blaster's `send_pronto` action, so that is the only action the blaster needs for these.
- The database is a separate file (`aurora-ir-codes.js`, about 1 MB) next to the card file. It is downloaded only when a card or the form actually uses it, so dashboards that use only built-in models do not load it.
- Keys the card recognises (power, volume, arrows, numbers...) are placed in the usual layout; the remote's other keys keep their original names and appear under the extra keys.
- These codes are community captures and have **not been tested** by the author. A set may be incomplete or wrong for your model.
- To rebuild the database from a newer copy of Flipper-IRDB: `python3 -I tools/build_ir_codes.py <Flipper-IRDB folder> dist/aurora-ir-codes.js`.

### Aurora Smart Device Card

| `device` | `model` | Device | Protocol | Status |
|---|---|---|---|---|
| `appletv` | None | Apple TV (media_player and remote entities) | Over the network, no IR | Newly added |
| `climate` | None | Air conditioner (climate entity) | No IR codes | Tested on real hardware |
| `light` | None | Light: on/off, dimmable, white or RGB (light entity) | No IR codes | **Not tested on a real colour light** |
| `cover` | None | Roller door, curtain, blind, garage door (cover entity) | No IR codes | **Not tested on real hardware** |
| `vacuum` | None | Robot vacuum (vacuum entity) | No IR codes | Tested on real hardware (Roborock) |
| `camera` | None | Camera (camera entity) | No IR codes | Tested on real hardware (Tapo C260) |
| `lock` | None | Door lock (lock entity) | No IR codes | **Not tested on real hardware** |
| `fan` | None | Smart fan, air purifier (fan entity) | No IR codes | **Not tested on real hardware** |
| `switch` | None | Socket, switch (switch or input_boolean entity) | No IR codes | **Not tested on real hardware** |
| `media_player` | None | Smart speaker, smart TV (media_player entity) | No IR codes | **Not tested on real hardware** |
| `water_heater` | None | Water heater (water_heater entity) | No IR codes | **Not tested on real hardware** |
| `humidifier` | None | Humidifier, dehumidifier (humidifier entity) | No IR codes | **Not tested on real hardware** |
| `alarm` | None | Alarm (alarm_control_panel entity) | No IR codes | **Not tested on real hardware** |
| `valve` | None | Water valve (valve entity) | No IR codes | **Not tested on real hardware** |
| `lawn_mower` | None | Robot lawn mower (lawn_mower entity) | No IR codes | **Not tested on real hardware** |

The models marked "not tested" take their codes from public code databases ([Flipper-IRDB](https://github.com/Lucaslhm/Flipper-IRDB), [irdb](https://github.com/probonopd/irdb)) or from the manufacturer's commonly used code tables; the author has no device to check them on. A manufacturer may use several code sets across product generations, so if a button does not work on your device, please open an issue and include the model name.

- The models whose protocol is **Pronto** are sent through the blaster's `send_pronto` action; no separate action per manufacturer is needed.
- Newer Toshiba TVs running VIDAA are made by Hisense: if the `toshiba` model does not work, try `hisense`.
- BenQ and ViewSonic projectors have separate on and off codes: the card icon turns the projector on, the `OFF` button turns it off. Epson uses one power key and asks you to press it again to turn off.
- No public codes were found for Asia fans, Casper TVs or the set-top boxes of Vietnamese providers (VNPT, FPT, Viettel, K+). Add them with `custom` after learning the codes from the real remote.
- The `senko` model is for the 12-bit remote type shared by many fans sold in Vietnam. Fans from other manufacturers with the same kind of chip may respond, but each manufacturer usually sets its own codes.

## Configuration

Add the card from the UI: edit the dashboard, click **Add card**, and search for **Aurora IR Remote Card** or **Aurora Smart Device Card**. The configuration form lets you choose the device type, the remote model, the IR blaster (the card lists the ESPHome nodes that have a `send_...` action by itself), the icon color, the status box in the right corner and the **quick buttons** on the card. The list of functions available for quick buttons changes with the selected device type, and you can add, remove and drag to reorder them.

You can also write YAML with the following options:

| Option | Required | Description |
|---|---|---|
| `device` | Yes | Device type, see the two tables above |
| `brand`, `codeset` | No | Infrared devices: take the codes from the built-in database instead of `model` (see above) |
| `model` | For infrared devices | Infrared remote model, see the table above. If left empty, the first model of that type is used |
| `blaster` | For infrared devices | Name of the ESPHome node that sends IR, which is the middle part of `esphome.<blaster>_send_nec` |
| `entity` | For smart devices | The device's entity. Optional for infrared devices: an entity that tells whether the device is on or off, for example the TV's `media_player` |
| `name` | No | Display name, taken from the device by default |
| `icon` | No | Display icon, taken from the device by default |
| `color` | No | Icon color. Accepts a Home Assistant color name (`teal`, `purple`, `amber`...) or a CSS value (`"#5CC8BE"`). By default each type has its own color: fans teal, speakers and robot vacuums light purple, TVs and cameras blue, Apple TV pink, air conditioners sky blue |
| `quick` | No | The quick buttons in the bottom row of the card, one or more. Infrared devices: a list of button ids, for example `[power, swing, timer]`. Air conditioners: a list of modes, for example `[cool, dry]`. Lights: brightness levels, whites and colours, for example `[b50, warm, red]`. Roller doors: `[open, stop, close]`. Other smart devices: a list of action ids (see the table below). Robot vacuums, cameras and sockets: a list of entity-based buttons (see below). If left empty, the device type's defaults are used |
| `hide_quick` | No | `true` to hide the quick button row. The card is then as short as a Home Assistant tile (56px), so it lines up evenly next to light and switch tiles. Tapping the card still opens the full pop-up |
| `badge_entity` | No | Entity shown in the status box in the right corner, for example a room temperature sensor or the robot's cleaning progress. Default: air conditioners show the target temperature, infrared devices show a remote icon |
| `badge_icon` | No | Icon placed before the text in the status box, for example `mdi:progress-check`. For air conditioners the default is `mdi:thermometer` |
| `ir_gap` | No | Minimum gap between two consecutive infrared commands, in milliseconds, default 220. Increase it if the device skips steps when you drag on the navigation ring; decrease it if the device receives well and you want it faster |
| `availability_entity` | No | Entity used to know whether the IR blaster is still connected. By default the card watches every entity whose name contains `<blaster>_` |
| `custom` | No | A self-declared infrared code set, used instead of `device` and `model` (see below) |

## Usage

- Tap the card's **icon**: sends the power command (infrared devices) or toggles on/off (air conditioners).
- Tap the **bottom-row buttons**: the commands you use most.
- Tap the **rest** of the card: opens the full control pop-up. Swipe down to close it.
- When the IR blaster or the device loses its connection, the card dims and shows "Unavailable".

### Infrared devices

An infrared remote only sends commands one way, so by default the card does not know whether the device is on or off, and shows a remote icon in the right corner to indicate that. If the device has another entity that can report its state (a network-connected TV, a power-metering plug), declare it in `entity`: the card will change color when the device is on.

```yaml
type: custom:aurora-device-control-card
device: tv
model: samsung
blaster: s06_ir
entity: media_player.samsung_tv
quick: [power, mute, vol_down, vol_up]
```

### Apple TV

Apple TV is controlled over the network through Home Assistant's Apple TV integration; no IR blaster is needed:

```yaml
type: custom:aurora-device-control-card
device: appletv
entity: media_player.appletv
apps: [Netflix, YouTube, Spotify]
```

- Tap the icon: turn on or put to sleep.
- Bottom-row buttons: play/pause, back and home by default. Choose other buttons with `quick`.
- Right corner: an icon showing whether it is playing or paused.
- Pop-up: a navigation ring in the middle (tap the four directions and OK, or hold and drag on the ring like a touchpad: the cursor moves one cell at a time as far as you drag, and moves back when you drag back), with two rows of buttons below it: back, play/pause and the TV button; then the 10-second skip pair, the volume pair and the power button.
- While playing or paused, the top of the pop-up shows the cover art, the content title and the app.
- **Text input box:** appears automatically when Apple TV opens a text entry field (search, password), and is hidden otherwise. The text appears on Apple TV as you type; press Enter to select.
- `apps`: the apps shown as a horizontally scrolling row of buttons in the pop-up; tap one to open it. The names follow the `media_player` source list. Popular apps (YouTube, Netflix, Spotify, Plex...) have built-in icons; set your own icon with `apps: [{ name: Infuse, icon: mdi:play-box }]`.

The card finds the remote entity and the keyboard sensor by itself from the `media_player` name (`remote.<name>`, `binary_sensor.<name>_keyboard_focus`). If the names differ, declare `remote_entity` and `keyboard_entity`.

### Infrared TVs

The TV pop-up (Samsung, LG, Sony) uses the same layout as Apple TV: a navigation ring in the middle (tap, or hold and drag like a touchpad), with the basic keys below it: back, home, mute, input source, volume, channel and power. The number keys, MENU, GUIDE, EXIT, the four color keys and the media playback keys are in the **"Number keys and more"** section; tap it to expand.

### Air conditioners

An infrared air conditioner in ESPHome is already a full `climate` entity, so the card controls that entity directly, with no `blaster` needed:

```yaml
type: custom:aurora-device-control-card
device: climate
entity: climate.s06_ir_toshiba_ac
```

- Tap the icon: turn on or off.
- Bottom-row buttons: the modes the air conditioner supports (cool, dry, fan...); the active mode is highlighted.
- Right corner: the target temperature.
- Pop-up: Home Assistant's native thermostat card, with the temperature dial, mode selection, fan speed and swing if the air conditioner supports them.

### Lights

The card controls a `light` entity and shows only what that light can do:

```yaml
type: custom:aurora-device-control-card
device: light
entity: light.living_room_led
quick: [b50, warm, red, blue]   # optional
```

- Tap the icon: turn on or off. While a colour light is on, the icon and the card border take the colour the light is showing (unless you set `color`).
- Right corner: the current brightness.
- Bottom-row buttons, chosen with `quick`: brightness levels `b25`, `b50`, `b75`, `b100`; whites `warm` (2700 K), `neutral` (4000 K), `cool` (6500 K); colours `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple`, `pink`. Buttons the light does not support are left out. The default is `[b25, b50, b100]`; a plain on/off light has no quick buttons, so turn on `hide_quick` for it.
- Pop-up: power button, then a brightness slider, a colour temperature slider, a colour slider with eight preset colours, and the light's effects, each shown only if the light supports it. A slider sends its command when you release it.
- `controls` adds your own buttons below, as for robot vacuums.

### Roller doors, curtains and blinds

The card controls a `cover` entity, so it works with anything Home Assistant exposes as a cover: roller doors, garage doors, curtains, blinds, awnings.

```yaml
type: custom:aurora-device-control-card
device: cover
entity: cover.garage_door
icon: mdi:garage               # optional; the default is a roller shutter
```

- Tap the icon: open if closed, close if open.
- Right corner: how far it is open in percent, or the state (open, closed, opening...) when the device does not report a position.
- Bottom-row buttons: open, stop and close (`quick: [open, stop, close]`), limited to what the device supports. The open or close button lights up while the door is moving.
- Pop-up: large open, stop and close buttons, a position slider, and a tilt slider for blinds with slats, each shown only if the device supports it.
- `controls` adds your own buttons below, for example the door's light or lock.

A roller door opens the house, so think about who can reach the dashboard before you put this card on it.

### Locks, smart fans, media players and other smart devices

These types all work the same way: the card reads what the entity supports and shows only that. `quick` takes the action ids in the table.

```yaml
type: custom:aurora-smart-device-card
device: lock
entity: lock.front_door
```

| `device` | Tap the icon | Right corner | Actions (`quick`) | Pop-up also has |
|---|---|---|---|---|
| `lock` | Unlock when locked, lock otherwise | State | `lock`, `unlock`, `open` | |
| `fan` | On / off | Speed | `low`, `medium`, `high`, `power`, `oscillate`, `direction` | Speed slider, preset modes |
| `media_player` | On / off, or play / pause if it has no power control | Play or pause icon | `previous`, `play_pause`, `next`, `vol_down`, `mute`, `vol_up`, `power` | What is playing, volume slider, source and sound mode |
| `water_heater` | On / off | Target temperature | `power`, `mode:<name>` | Temperature slider, operation modes |
| `humidifier` | On / off | Target humidity | `power`, `mode:<name>` | Humidity slider, modes |
| `alarm` | Opens the pop-up | State | `arm_home`, `arm_away`, `arm_night`, `arm_vacation`, `disarm` | |
| `valve` | Open / close | Position or state | `open`, `stop`, `close` | Position slider |
| `lawn_mower` | Opens the pop-up | State | `start`, `pause`, `dock` | |

- **Locks:** unlocking and opening ask for confirmation first; set `confirm: false` to turn that off. The card is highlighted while the door is unlocked.
- **Codes:** if a lock or an alarm needs a code, the card asks for it in a browser prompt each time. The code is shown as you type and is never stored.
- **Sockets and switches** (`device: switch`): tapping the icon toggles the entity. Show the power draw with `badge_entity`, and add buttons with `quick` and `controls` as for robot vacuums.
- `controls` adds your own buttons at the bottom of every pop-up.

### Robot vacuums and cameras

These two types watch one entity, while the buttons are declared by you as a list of entities or actions.

```yaml
type: custom:aurora-device-control-card
device: vacuum
entity: vacuum.roborock
name: Roborock
badge_entity: sensor.roborock_cleaning_progress
badge_icon: mdi:progress-check
quick:
  - { entity: button.roborock_clean_all, name: Clean all }
  - { entity: button.roborock_clean_living_room, name: Clean LR }
  - { icon: mdi:home-import-outline, service: vacuum.return_to_base }
```

```yaml
type: custom:aurora-device-control-card
device: camera
entity: camera.tapo_hd_stream
privacy_entity: switch.tapo_privacy    # right corner shows Online / Privacy / Offline
quick:
  - { entity: switch.tapo_privacy, name: Privacy, icon: mdi:eye-off }
pad:                                   # navigation ring in the pop-up, for pan/tilt cameras
  up: button.tapo_move_up
  down: button.tapo_move_down
  left: button.tapo_move_left
  right: button.tapo_move_right
columns: 4                             # number of columns in the button grid below
controls:                              # button grid in the pop-up
  - { entity: switch.tapo_privacy, name: PRIVACY, icon: mdi:eye-off, color: "#F2C879" }
  - { entity: siren.tapo_siren, name: SIREN, icon: mdi:alarm-light, confirm: "Toggle the siren?" }
  - { entity: select.tapo_night_vision, name: NIGHT, icon: mdi:weather-night }
  - { name: HISTORY, icon: mdi:history, path: /media-browser/browser, wide: true }
```

Each button in `quick` and `controls` accepts:

| Field | Description |
|---|---|
| `entity` | The button's entity. A shorthand is allowed: write just the entity id instead of the whole block |
| `name` | Display text. In `quick`, if left empty the entity name is used. In `controls`, if left empty the button shows only an icon |
| `icon` | If left empty, the entity's icon is used |
| `color` | Color when the entity is on |
| `action` | `toggle`, `press`, `more-info` or `navigate`. The default depends on the entity type: a `button` is pressed, `switch`/`light`/`siren`... are toggled, and anything else opens the entity's dialog |
| `service` | Calls a Home Assistant action instead of pressing the entity, for example `vacuum.return_to_base`. The action runs on the button's `entity`, or on the card's entity if there is none. Add parameters with `data` |
| `path` | Path to navigate to (implies `navigate`) |
| `confirm` | Confirmation question asked before the action runs |
| `wide` | `true` to make the button span the whole row |

- **Robot vacuums:** the card changes color when the robot is cleaning, returning to the dock or paused. When `quick` is not declared, the card has a built-in button that stops cleaning and returns to the dock. If `controls` is not declared, tapping the card opens Home Assistant's native dialog.
- **Cameras:** the pop-up shows the live video with sound, along with the player's control bar. Set `audio: false` if you want video without sound. When the camera loses its connection, the card gets a red border and the pop-up shows an offline notice box (change its text with `offline_text`). `pad` declares the four direction buttons (`up`, `down`, `left`, `right`, plus `center` if you want a button in the middle), shown as a navigation ring like a TV remote. `columns` changes the number of columns in the button grid, default 3.

## Actions required on the ESPHome blaster

For infrared devices, the card calls `esphome.<blaster>_send_<protocol>`. Declare the matching actions in the blaster's YAML:

```yaml
api:
  actions:
    # Used by: HSV fan, Toshiba fan, LG TV
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

    # Used by: Samsung TV, LG speaker
    - action: send_samsung
      variables:
        address: int
        command: int
      then:
        - remote_transmitter.transmit_samsung:
            data: !lambda 'return ((uint32_t) address << 16) | ((uint32_t) command & 0xFFFF);'
            nbits: 32

    # Used by: Sony TV (Sony requires the code to be sent 3 times)
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

    # Used by: TCL TV, Panasonic TV, Senko fan, Mitsubishi fan, and buttons declared with "pronto"
    - action: send_pronto
      variables:
        data: string
      then:
        - remote_transmitter.transmit_pronto:
            data: !lambda 'return data;'
```

## Adding your own infrared remote

Declare the code set right in the card with `custom`:

```yaml
type: custom:aurora-device-control-card
blaster: ten_node_esphome
custom:
  name: My fan
  icon: mdi:fan
  color: "#5CC8BE"
  protocol: nec        # the suffix of the action esphome.<blaster>_send_<protocol>
  address: 65025       # default address for every button
  repeats: 2           # remove this line if the action does not accept repeats
  button_height: 54
  power: power         # id of the button sent when the icon is tapped
  quick: [swing, down, up]
  buttons:
    - { id: down, icon: mdi:fan-minus, command: 46155 }
    - { id: power, icon: mdi:power, command: 64515, color: "#e53935" }
    - { id: up, icon: mdi:fan-plus, command: 63495 }
    - { id: swing, icon: mdi:arrow-oscillating, label: SWING, command: 60435 }
```

A button with a `label` shows a small icon with text; a button without a `label` shows only a large icon. `{ spacer: true }` creates an empty cell. Each button can override `address`, `protocol` and `repeats`.

A button whose code is a Pronto string declares `pronto: "0000 006D ..."` instead of `command`; that button is always sent through the `send_pronto` action.

For protocols that send `data` + `nbits` (for example Sony), each button declares `data` instead of `command`, and `nbits` is set at the common level or per button. Replace `buttons` with `groups` if you need several grids with different column counts: `groups: [{ columns: 4, buttons: [...] }]`.

## Related projects

- [Aurora Home Theme](https://github.com/lipnguyen-ha/ha-aurora-home-theme): a theme with a gradient background and frosted-glass cards for Home Assistant. This card takes its background color and corner radius from the active theme.
- [WOL + Presence](https://github.com/lipnguyen-ha/ha-wol-presence): an integration that turns on a computer with Wake-on-LAN and reports whether the machine is awake or asleep; it works with Macs too.

## License

MIT.
