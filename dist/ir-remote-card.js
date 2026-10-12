/*
 * IR Remote Card - card Lovelace cho thiet bi dieu khien bang hong ngoai.
 *
 * Remote IR (quat, loa, TV):
 *   type: custom:ir-remote-card
 *   remote: hsv_fan            # ten bo ma trong REMOTES ben duoi
 *   blaster: sr06_t1_3s_01     # ten node ESPHome phat IR (phan giua cua esphome.<ten>_send_nec)
 *   entity: media_player.tv    # tuy chon: entity cho biet thiet bi dang bat hay tat
 *
 * Dieu hoa (entity climate, vi du climate IR cua ESPHome):
 *   type: custom:ir-remote-card
 *   remote: climate
 *   entity: climate.s06_ir_toshiba_ac
 *
 * Card goi action esphome.<blaster>_send_<protocol>. Khong can build, khong phu thuoc thu vien nao.
 */

const VERSION = "0.3.2";

// Ma NEC 8 bit -> 16 bit theo kieu ESPHome: byte cao la dao bit cua byte thap (0x08 -> 0xF708)
const nec = (code) => (((~code & 0xff) << 8) | code) >>> 0;

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

const mapValues = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));

// Bo ma IR. Them thiet bi moi = them mot muc o day.
//   protocol: phan duoi cua action ESPHome (nec, samsung, sony, ...)
//   address/repeats/nbits: mac dinh cho moi nut, tung nut co the ghi de
//   color: mau nhan khi card co entity trang thai va dang BAT
//   power: id nut duoc gui khi bam vao icon cua card
//   quick: 3 id nut hien o hang duoi cua card
//   buttons: luoi 3 cot trong pop-up; hoac groups: nhieu luoi, moi luoi co so cot rieng.
//     Nut gui { address, command } hoac { data, nbits } tuy giao thuc.
//     label co => icon nho + chu; khong co label => chi icon to. { spacer: true } la o trong.
const REMOTES = {
  hsv_fan: {
    name: "HSV Fan",
    icon: "mdi:ceiling-fan-light",
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
    color: "#3E9BF0",
    protocol: "samsung",
    address: 57568,
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    groups: tvGroups(
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
    color: "#3E9BF0",
    protocol: "nec",
    address: nec(0x04),
    repeats: 1,
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    groups: tvGroups(
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
    color: "#3E9BF0",
    protocol: "sony",
    nbits: 12,
    button_height: 54,
    power: "power",
    quick: ["mute", "vol_down", "vol_up"],
    groups: tvGroups({
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

  // Khong phai bo ma IR: dieu khien mot entity climate (vi du climate IR cua ESPHome)
  climate: {
    kind: "climate",
    name: "Điều hòa",
    icon: "mdi:air-conditioner",
    color: "#35B8E8",
    button_height: 54,
  },
};

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
  /* Vien net dut: thiet bi khong co trang thai */
  ha-card.stateless {
    outline: 1.5px dashed rgba(144, 164, 174, 0.55);
    outline-offset: -1.5px;
  }
  ha-card.offline { opacity: 0.45; }
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
    background: var(--card-off-icon-background-color, rgba(144, 164, 174, 0.18));
    color: color-mix(in srgb, var(--ir-accent) var(--card-off-icon-mix, 0%), #90a4ae);
    cursor: pointer;
    --mdc-icon-size: 24px;
  }
  ha-card.stateless .icon { background: rgba(144, 164, 174, 0.18); color: #90a4ae; }
  ha-card.on .icon {
    background: color-mix(in srgb, var(--ir-accent) var(--card-on-icon-background-mix, 25%), transparent);
    color: var(--card-on-icon-color, var(--ir-accent));
  }
  .name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--primary-text-color);
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
    padding: 0 12px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--primary-text-color);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
  .badge.show-text ha-icon, .badge.show-icon .text { display: none; }
  .quick {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 8px;
    height: 36px;
  }
  .quick button {
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
  }
  ha-card.on .name { color: var(--card-on-text-color, var(--primary-text-color)); }
  ha-card.on .quick button, ha-card.on .badge.show-text {
    background: var(--card-on-sub-button-background-color, rgba(255, 255, 255, 0.1));
    color: var(--card-on-text-color, var(--primary-text-color));
  }
  ha-card .quick button.active { background: var(--ir-accent); color: #fff; }
  button:active { transform: scale(0.95); filter: brightness(1.35); }
`;

const POPUP_CSS = `
  :host {
    position: fixed;
    inset: 0;
    z-index: 1000;
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
    background: rgba(144, 164, 174, 0.18);
    color: #90a4ae;
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

function resolveRemote(config) {
  return config.custom || REMOTES[config.remote];
}

class IrRemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._embedded = [];
    this._onPopState = () => this._closePopup(false);
    this._onKeyDown = (ev) => {
      if (ev.key === "Escape") this._closePopup(true);
    };
  }

  static getStubConfig(hass) {
    return { remote: "hsv_fan", blaster: findBlasters(hass)[0] || "ten_node_esphome" };
  }

  static getConfigElement() {
    return document.createElement("ir-remote-card-editor");
  }

  setConfig(config) {
    const def = resolveRemote(config);
    if (!def) {
      throw new Error(
        `ir-remote-card: khong co remote '${config.remote}'. Co san: ${Object.keys(REMOTES).join(", ")}`
      );
    }
    if (def.kind === "climate") {
      if (!config.entity) throw new Error("ir-remote-card: remote 'climate' can 'entity' (mot entity climate)");
    } else if (!config.blaster) {
      throw new Error("ir-remote-card: thieu 'blaster' (ten node ESPHome phat IR)");
    }
    this._config = config;
    this._def = def;
    this._groups = def.groups || (def.buttons ? [{ columns: 3, buttons: def.buttons }] : []);
    this._byId = {};
    for (const group of this._groups) {
      for (const btn of group.buttons) if (btn.id) this._byId[btn.id] = btn;
    }
    this._blasterIds = null;
    this._quickKey = null;
    this._render();
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
    for (const card of this._embedded) card.hass = hass;
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

  get _stateObj() {
    const id = this._config.entity;
    return id && this._hass ? this._hass.states[id] : undefined;
  }

  get _name() {
    if (this._config.name) return this._config.name;
    const stateObj = this._stateObj;
    if (this._isClimate && stateObj && stateObj.attributes.friendly_name) return stateObj.attributes.friendly_name;
    return this._def.name;
  }

  get _icon() {
    return this._config.icon || this._def.icon;
  }

  _render() {
    const iconButton = el("button", { class: "icon" }, [icon(this._icon)]);
    iconButton.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (this._isClimate) this._callEntity("toggle");
      else this._send(this._byId[this._def.power]);
    });

    this._nameEl = el("div", { class: "name", text: this._name });
    this._badge = el("div", { class: "badge" }, [icon("mdi:remote"), el("span", { class: "text" })]);
    const top = el("div", { class: "top" }, [iconButton, this._nameEl, this._badge]);
    top.addEventListener("click", () => this._openPopup());

    this._quick = el("div", { class: "quick" });
    this._card = el("ha-card", {}, [top, this._quick]);
    this._card.style.setProperty("--ir-accent", this._def.color || "#90a4ae");
    this._card.classList.toggle("stateless", !this._config.entity);
    this.shadowRoot.replaceChildren(el("style", { text: CARD_CSS }), this._card);
  }

  // Ba nut nhanh o hang duoi. Dieu hoa: lay tu hvac_modes cua entity.
  _quickButtons() {
    if (!this._isClimate) {
      return (this._def.quick || []).map((id) => this._byId[id]).filter(Boolean);
    }
    const stateObj = this._stateObj;
    const supported = (stateObj && stateObj.attributes.hvac_modes) || ["cool", "dry", "fan_only"];
    const modes = Object.keys(HVAC_ICONS).filter((mode) => supported.includes(mode));
    return modes.slice(0, 3).map((mode) => ({
      id: mode,
      icon: HVAC_ICONS[mode],
      active: !!stateObj && stateObj.state === mode,
      service: ["set_hvac_mode", { hvac_mode: mode }],
    }));
  }

  _renderQuick() {
    const buttons = this._quickButtons();
    const key = buttons.map((b) => `${b.id}:${b.active ? 1 : 0}`).join(",");
    if (key === this._quickKey) return;
    this._quickKey = key;
    this._quick.replaceChildren(
      ...buttons.map((btn) => {
        const node = el("button", { title: btn.label || btn.id, class: btn.active ? "active" : "" }, [
          icon(btn.icon),
        ]);
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
    if (this._isClimate) {
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
    const offline = this._isOffline();
    const stateObj = this._stateObj;
    const on = !offline && !!stateObj && !OFF_STATES.includes(stateObj.state);
    this._card.classList.toggle("offline", offline);
    this._card.classList.toggle("on", on);
    this._nameEl.textContent = this._name;

    // Goc phai: "Unavailable" khi mat ket noi, nhiet do dat cua dieu hoa, hoac icon remote
    let text = "";
    if (offline) {
      text = (this._hass && this._hass.localize("state.default.unavailable")) || "Unavailable";
    } else if (this._isClimate && stateObj && stateObj.attributes.temperature != null) {
      text = `${stateObj.attributes.temperature} °C`;
    }
    this._badge.querySelector(".text").textContent = text;
    this._badge.classList.toggle("show-text", !!text);
    this._badge.classList.toggle("show-icon", !text && !this._config.entity);

    this._renderQuick();
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
    if (!this._hass) return;
    const domain = this._config.entity.split(".")[0];
    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
    this._hass
      .callService(domain, service, { entity_id: this._config.entity, ...data })
      .catch((err) => this._notifyError(err));
  }

  _press(btn) {
    if (!btn) return;
    if (btn.service) this._callEntity(btn.service[0], btn.service[1]);
    else this._send(btn);
  }

  _send(btn) {
    if (!btn || !this._hass) return;
    const def = this._def;
    const protocol = btn.protocol || def.protocol;
    // Giao thuc kieu data/nbits (sony, lg...) hoac address/command (nec, samsung)
    const data =
      btn.data !== undefined
        ? { data: btn.data, nbits: btn.nbits ?? def.nbits }
        : { address: btn.address ?? def.address, command: btn.command };
    const repeats = btn.repeats ?? def.repeats;
    if (repeats !== undefined) data.repeats = repeats;

    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
    this._hass
      .callService("esphome", `${this._config.blaster}_send_${protocol}`, data)
      .catch((err) => this._notifyError(err));
  }

  _buildGrid(group) {
    const grid = el("div", { class: "grid" });
    grid.style.gridTemplateColumns = `repeat(${group.columns || 3}, 1fr)`;
    for (const btn of group.buttons) {
      if (btn.spacer) {
        grid.appendChild(el("div"));
        continue;
      }
      const btnIcon = icon(btn.icon);
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
      node.addEventListener("click", () => this._press(btn));
      grid.appendChild(node);
    }
    return grid;
  }

  // Noi dung pop-up cua dieu hoa: card thermostat goc cua HA + luoi nut dat san
  _buildClimateBody() {
    const stateObj = this._stateObj;
    const attrs = (stateObj && stateObj.attributes) || {};
    const body = [];

    const holder = el("div", { class: "embedded" });
    body.push(holder);
    const features = [{ type: "climate-hvac-modes" }];
    if (attrs.fan_modes) features.push({ type: "climate-fan-modes" });
    if (attrs.swing_modes) features.push({ type: "climate-swing-modes" });
    if (window.loadCardHelpers) {
      window
        .loadCardHelpers()
        .then((helpers) => {
          if (!this._popup) return;
          const card = helpers.createCardElement({ type: "thermostat", entity: this._config.entity, features });
          card.hass = this._hass;
          this._embedded.push(card);
          holder.appendChild(card);
        })
        .catch((err) => this._notifyError(err));
    }

    const modes = attrs.hvac_modes || [];
    const presets = [{ id: "off", icon: "mdi:power", color: "#e53935", service: ["turn_off", {}] }];
    if (modes.includes("cool")) {
      presets.push(
        { id: "cool_24", icon: "mdi:snowflake", label: "COOL 24", service: ["set_temperature", { hvac_mode: "cool", temperature: 24 }] },
        { id: "cool_26", icon: "mdi:snowflake-melt", label: "COOL 26", service: ["set_temperature", { hvac_mode: "cool", temperature: 26 }] }
      );
    }
    if (modes.includes("dry")) {
      presets.push({ id: "dry", icon: "mdi:water-percent", label: "DRY", service: ["set_hvac_mode", { hvac_mode: "dry" }] });
    }
    if (modes.includes("fan_only")) {
      presets.push({ id: "fan", icon: "mdi:fan", label: "FAN", service: ["set_hvac_mode", { hvac_mode: "fan_only" }] });
    }
    const swingModes = attrs.swing_modes || [];
    const swing = ["both", "vertical", "on"].find((mode) => swingModes.includes(mode));
    if (swing) {
      presets.push({ id: "swing", icon: "mdi:arrow-oscillating", label: "SWING", service: ["set_swing_mode", { swing_mode: swing }] });
    }
    body.push(this._buildGrid({ columns: 3, buttons: presets }));
    return body;
  }

  _openPopup() {
    if (this._popup) return;
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    this._popup = host;

    const close = el("button", { class: "close", title: "Close" }, [icon("mdi:close")]);
    close.addEventListener("click", () => this._closePopup(true));

    const backdrop = el("div", { class: "backdrop" });
    backdrop.addEventListener("click", () => this._closePopup(true));

    const body = this._isClimate ? this._buildClimateBody() : this._groups.map((group) => this._buildGrid(group));
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
        startY = sheet.scrollTop <= 0 ? ev.touches[0].clientY : null;
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
    document.documentElement.style.overflow = this._prevOverflow || "";
    window.removeEventListener("popstate", this._onPopState);
    window.removeEventListener("keydown", this._onKeyDown);
    if (popHistory && history.state && history.state.irRemoteCard) history.back();
    host.classList.remove("open");
    setTimeout(() => host.remove(), 300);
  }
}

// Form cau hinh trong trinh sua card cua dashboard. Bo ma "custom" van sua bang YAML.
const EDITOR_LABELS = {
  remote: "Loại thiết bị",
  blaster: "Bộ phát IR (node ESPHome)",
  entity: "Entity trạng thái (tùy chọn: để card biết đang bật hay tắt)",
  climate_entity: "Entity điều hòa (climate)",
  name: "Tên hiển thị (để trống = tên mặc định)",
  icon: "Icon (để trống = icon mặc định)",
  availability_entity: "Entity báo mất kết nối (để trống = tự động)",
};

class IrRemoteCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  _schema() {
    const def = resolveRemote(this._config) || {};
    const schema = [];
    if (!this._config.custom) {
      schema.push({
        name: "remote",
        required: true,
        selector: {
          select: {
            mode: "dropdown",
            options: Object.entries(REMOTES).map(([value, item]) => ({ value, label: item.name })),
          },
        },
      });
    }
    if (def.kind === "climate") {
      schema.push({ name: "entity", label: "climate_entity", required: true, selector: { entity: { domain: "climate" } } });
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
    schema.push({ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } });
    if (def.kind !== "climate") schema.push({ name: "availability_entity", selector: { entity: {} } });
    return schema;
  }

  _update() {
    if (!this._config || !this._hass) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (field) => EDITOR_LABELS[field.label || field.name] || field.name;
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        // Bo cac o de trong de YAML gon va card dung gia tri mac dinh
        for (const key of ["entity", "name", "icon", "availability_entity", "blaster"]) {
          if (config[key] === "" || config[key] == null) delete config[key];
        }
        this._config = config;
        this.dispatchEvent(
          new CustomEvent("config-changed", { bubbles: true, composed: true, detail: { config } })
        );
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = this._schema();
  }
}

if (!customElements.get("ir-remote-card-editor")) {
  customElements.define("ir-remote-card-editor", IrRemoteCardEditor);
}

if (!customElements.get("ir-remote-card")) {
  customElements.define("ir-remote-card", IrRemoteCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "ir-remote-card",
    name: "IR Remote Card",
    description: "Remote cho quat, loa, TV va dieu hoa hong ngoai, phat qua ESPHome",
  });
  console.info(`%c IR-REMOTE-CARD %c v${VERSION} `, "background:#3E9BF0;color:#fff", "background:#333;color:#fff");
}
