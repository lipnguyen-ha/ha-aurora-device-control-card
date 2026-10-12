/*
 * Aurora Device Control Card - card Lovelace dieu khien thiet bi theo mot kieu thong nhat.
 *
 * Thiet bi hong ngoai (quat, loa, TV) phat qua bo phat IR chay ESPHome:
 *   type: custom:aurora-device-control-card
 *   device: fan                # loai thiet bi
 *   model: hsv                 # mau remote hong ngoai cua loai do
 *   blaster: sr06_t1_3s_01     # ten node ESPHome phat IR (phan giua cua esphome.<ten>_send_nec)
 *   entity: switch.o_cam_quat  # tuy chon: entity cho biet thiet bi dang bat hay tat
 *
 * Thiet bi theo entity (dieu hoa, robot hut bui, camera):
 *   type: custom:aurora-device-control-card
 *   device: climate
 *   entity: climate.s06_ir_toshiba_ac
 *
 * Cau hinh cu "remote: hsv_fan" va ten card cu "custom:ir-remote-card" van chay.
 * Khong can build, khong phu thuoc thu vien nao.
 */

const VERSION = "1.0.5";

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
    color: "#6AA9F0",
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
    color: "#6AA9F0",
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
    domain: "climate",
    name: "Điều hòa",
    icon: "mdi:air-conditioner",
    badge_icon: "mdi:thermometer",
    color: "#5CC4EA",
    button_height: 54,
  },

  // Robot hut bui: card theo entity vacuum, nut nhanh va nut pop-up khai bao bang "quick" / "controls"
  vacuum: {
    kind: "entity",
    domain: "vacuum",
    name: "Robot hút bụi",
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
const DEVICES = {
  fan: { name: "Quạt", models: { hsv: "hsv_fan", toshiba: "toshiba_fan" } },
  speaker: { name: "Loa", models: { lg: "lg_soundbar" } },
  tv: { name: "TV", models: { samsung: "samsung_tv", lg: "lg_tv", sony: "sony_tv" } },
  climate: { name: "Điều hòa", remote: "climate" },
  vacuum: { name: "Robot hút bụi", remote: "vacuum" },
  camera: { name: "Camera", remote: "camera" },
};

// Khoa trong REMOTES ung voi cau hinh: kieu moi (device + model) hoac kieu cu (remote)
function remoteKey(config) {
  if (!config.device) return config.remote;
  const device = DEVICES[config.device];
  if (!device) return undefined;
  return device.remote || device.models[config.model] || Object.values(device.models)[0];
}

// Suy ra { device, model } tu cau hinh, ke ca cau hinh cu chi co "remote"
function deviceOf(config) {
  if (config.device) return { device: config.device, model: config.model };
  for (const [device, item] of Object.entries(DEVICES)) {
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
    height: 28px;
    padding: 0 10px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--primary-text-color);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
  .badge.show-text ha-icon.remote, .badge.show-icon .text { display: none; }
  /* Icon tuy chon dung truoc chu trang thai (badge_icon) */
  .badge ha-icon.extra { display: none; margin-right: 4px; --mdc-icon-size: 14px; }
  .badge.show-text.has-icon ha-icon.extra { display: inline-flex; }
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
  .quick button span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ha-card.on .name { color: var(--card-on-text-color, var(--primary-text-color)); }
  ha-card.on .quick button, ha-card.on .badge.show-text {
    background: var(--card-on-sub-button-background-color, rgba(255, 255, 255, 0.1));
    color: var(--card-on-text-color, var(--primary-text-color));
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
  return config.custom || REMOTES[remoteKey(config)];
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

const HVAC_LABELS = {
  cool: "Làm lạnh",
  dry: "Hút ẩm",
  fan_only: "Quạt",
  heat: "Sưởi",
  heat_cool: "Tự động (sưởi/lạnh)",
  auto: "Tự động",
};

// Cac che do dieu hoa co the dat lam nut nhanh, theo thu tu uu tien
function climateModes(stateObj) {
  const supported = (stateObj && stateObj.attributes.hvac_modes) || ["cool", "dry", "fan_only"];
  return Object.keys(HVAC_ICONS).filter((mode) => supported.includes(mode));
}

// Nut nhanh mac dinh khi nguoi dung chua chon "quick"
function defaultQuick(def, stateObj) {
  if (def.kind === "climate") return climateModes(stateObj).slice(0, 3);
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

  static getStubConfig(hass) {
    return { device: "fan", model: "hsv", blaster: findBlasters(hass)[0] || "ten_node_esphome" };
  }

  static getConfigElement() {
    return document.createElement("aurora-device-control-card-editor");
  }

  setConfig(config) {
    const def = resolveRemote(config);
    if (!def) {
      throw new Error(
        `aurora-device-control-card: khong co thiet bi '${config.device || config.remote}'` +
          (config.model ? ` mau '${config.model}'` : "") +
          `. Loai co san: ${Object.keys(DEVICES).join(", ")}`
      );
    }
    // Thieu entity / bo phat thi khong nem loi: nguoi dung dang chon do trong form,
    // nem loi se lam form bi thay bang o YAML. Card hien "Chua cau hinh" va khong gui lenh.
    this._missing = def.kind ? !config.entity : !config.blaster;
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
    this._update();
    this._updateControls();
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

  // Loai theo entity voi nut tu khai bao (vacuum, camera)
  get _isEntityKind() {
    return this._def.kind === "entity";
  }

  // Co pop-up rieng hay khong; khong co thi bam card mo hop thoai more-info cua HA
  get _hasPopup() {
    return !this._isEntityKind || !!this._def.live || this._controls.length > 0;
  }

  get _stateObj() {
    const id = this._config.entity;
    return id && this._hass ? this._hass.states[id] : undefined;
  }

  get _name() {
    if (this._config.name) return this._config.name;
    const stateObj = this._stateObj;
    if (this._def.kind && stateObj && stateObj.attributes.friendly_name) return stateObj.attributes.friendly_name;
    return this._def.name;
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
      if (this._isClimate) this._callEntity("toggle");
      else if (this._isEntityKind) this._openMain();
      else this._send(this._byId[this._def.power]);
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

  _renderQuick() {
    const buttons = this._quickButtons();
    const key = buttons.map((b) => `${b.id}:${b.active ? 1 : 0}:${b.label || ""}`).join(",");
    if (key === this._quickKey) return;
    this._quickKey = key;
    const anyLabel = buttons.some((b) => b.show_label && b.label);
    this._quick.replaceChildren(
      ...buttons.map((btn) => {
        const children = [btn.control ? this._controlIcon(btn.control) : icon(btn.icon)];
        const labelled = btn.show_label && btn.label;
        if (labelled) children.push(el("span", { text: btn.label }));
        const classes = [];
        if (btn.active) classes.push("active");
        if (btn.control) classes.push("control");
        if (!labelled && anyLabel) classes.push("compact");
        const node = el("button", { title: btn.label || btn.id, class: classes.join(" ") }, children);
        if (btn.control && btn.control.color) node.style.setProperty("--control-color", cssColor(btn.control.color));
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
      !offline && !!stateObj && (onStates ? onStates.includes(stateObj.state) : !OFF_STATES.includes(stateObj.state));
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
      else if (privacy && privacy.state === "on") [text, color] = ["● Riêng tư", "#f2c879"];
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
    }
    const badgeIcon = !offline && !live && text ? this._config.badge_icon || this._def.badge_icon : "";
    this._badge.querySelector(".extra").setAttribute("icon", badgeIcon || "");
    this._badge.classList.toggle("has-icon", !!badgeIcon);
    this._badge.querySelector(".text").textContent = text;
    this._badge.style.color = color;
    this._badge.classList.toggle("plain", live);
    this._badge.classList.toggle("show-text", !!text);
    this._badge.classList.toggle("show-icon", !text && !this._config.entity);

    this._renderQuick();
  }

  _isIrMissingText() {
    return this._def.kind ? "Chưa chọn entity" : "Chưa chọn bộ phát";
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

  _press(btn) {
    if (!btn) return;
    if (btn.control) this._pressControl(btn.control);
    else if (btn.service) this._callEntity(btn.service[0], btn.service[1]);
    else this._send(btn);
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
    if (this._controls.length) {
      body.push(
        this._buildGrid({
          columns: this._config.columns || 3,
          buttons: this._controls.map((spec) => ({
            id: spec.entity || spec.path || spec.service,
            label: spec.name,
            wide: spec.wide,
            control: spec,
          })),
        })
      );
    }
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
      : this._isEntityKind
        ? this._buildEntityBody()
        : this._groups.map((group) => this._buildGrid(group));
    this._updateControls();
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
    this._controlNodes = [];
    this._childDialog = false;
    document.documentElement.style.overflow = this._prevOverflow || "";
    window.removeEventListener("popstate", this._onPopState);
    window.removeEventListener("keydown", this._onKeyDown);
    if (popHistory) history.back();
    host.classList.remove("open");
    setTimeout(() => host.remove(), 300);
  }
}

// Form cau hinh trong trinh sua card cua dashboard. Bo ma "custom" van sua bang YAML.
const EDITOR_LABELS = {
  device: "Loại thiết bị",
  model: "Mẫu remote hồng ngoại",
  blaster: "Bộ phát IR (node ESPHome)",
  entity: "Entity trạng thái (tùy chọn: để card biết đang bật hay tắt)",
  device_entity: "Entity của thiết bị",
  name: "Tên hiển thị (để trống = tên mặc định)",
  icon: "Icon (để trống = icon mặc định)",
  color: "Màu icon (để trống = màu mặc định của loại thiết bị)",
  availability_entity: "Entity báo mất kết nối (để trống = tự động)",
  badge_entity: "Ô trạng thái góc phải: entity hiển thị (để trống = mặc định)",
  badge_icon: "Ô trạng thái góc phải: icon đứng trước (để trống = mặc định của loại thiết bị)",
  quick: "Nút nhanh trên card (chọn một hoặc nhiều, kéo để đổi thứ tự)",
  quick_entities: "Nút nhanh trên card",
  controls: "Nút trong pop-up",
};

// Cac truong cua mot nut gan voi entity, dung cho form cua vacuum / camera
const CONTROL_FIELDS = {
  entity: { label: "Entity (nút bấm, công tắc, đèn...)", selector: { entity: {} } },
  name: { label: "Chữ hiển thị (để trống = tên entity)", selector: { text: {} } },
  icon: { label: "Icon (để trống = icon của entity)", selector: { icon: {} } },
  service: { label: "Action gọi thay cho bấm entity (vd. vacuum.return_to_base)", selector: { text: {} } },
};
const POPUP_CONTROL_FIELDS = {
  ...CONTROL_FIELDS,
  name: { label: "Chữ hiển thị (để trống = chỉ icon)", selector: { text: {} } },
  color: { label: "Màu khi bật (tên màu hoặc mã #hex)", selector: { text: {} } },
  path: { label: "Chuyển tới trang (thay cho entity)", selector: { text: {} } },
  confirm: { label: "Câu hỏi xác nhận trước khi bấm", selector: { text: {} } },
  wide: { label: "Chiếm cả hàng", selector: { boolean: {} } },
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
      // Buoc 1: loai thiet bi. Buoc 2 (chi voi thiet bi hong ngoai): mau remote.
      const { device } = deviceOf(this._config);
      schema.push({
        name: "device",
        required: true,
        selector: {
          select: {
            mode: "dropdown",
            options: Object.entries(DEVICES).map(([value, item]) => ({ value, label: item.name })),
          },
        },
      });
      const models = (DEVICES[device] || {}).models;
      if (models) {
        schema.push({
          name: "model",
          required: true,
          selector: {
            select: {
              mode: "dropdown",
              options: Object.entries(models).map(([value, key]) => ({ value, label: REMOTES[key].name })),
            },
          },
        });
      }
    }
    if (def.kind) {
      schema.push({ name: "entity", label: "device_entity", required: true, selector: { entity: { domain: def.domain } } });
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
    // Camera dung o goc phai cho Online / Offline nen khong co tuy chon nay
    if (!def.live) {
      schema.push({ name: "badge_entity", selector: { entity: {} } }, { name: "badge_icon", selector: { icon: {} } });
    }

    // Nut nhanh: chon tu cac chuc nang cua loai thiet bi
    if (def.kind === "entity") {
      schema.push(
        {
          name: "quick",
          label: "quick_entities",
          selector: { object: { multiple: true, label_field: "name", description_field: "entity", fields: CONTROL_FIELDS } },
        },
        {
          name: "controls",
          selector: {
            object: { multiple: true, label_field: "name", description_field: "entity", fields: POPUP_CONTROL_FIELDS },
          },
        }
      );
    } else {
      const options =
        def.kind === "climate"
          ? climateModes(this._stateObj()).map((mode) => ({ value: mode, label: HVAC_LABELS[mode] || mode }))
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
    const def = resolveRemote(this._config) || {};
    const data = { ...this._config };
    if (!this._config.custom) {
      // Hien cau hinh cu (remote: ...) duoi dang loai thiet bi + mau
      const { device, model } = deviceOf(this._config);
      const models = (DEVICES[device] || {}).models;
      data.device = device;
      if (models) data.model = model || Object.keys(models)[0];
      delete data.remote;
    }
    if (def.kind === "entity") {
      data.quick = (this._config.quick || defaultQuick(def)).map(normalizeControl);
      data.controls = (this._config.controls || []).map(normalizeControl);
    } else if (!Array.isArray(data.quick)) {
      data.quick = defaultQuick(def, this._stateObj());
    }
    return data;
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
        for (const key of ["entity", "name", "icon", "color", "availability_entity", "blaster", "badge_entity", "badge_icon"]) {
          if (config[key] === "" || config[key] == null) delete config[key];
        }
        const before = deviceOf(this._config);
        const deviceChanged = config.device !== before.device;
        const models = (DEVICES[config.device] || {}).models;
        if (!models) delete config.model;
        else if (deviceChanged || !models[config.model]) config.model = Object.keys(models)[0];
        const def = resolveRemote(config) || {};
        // Loai theo entity khong dung bo phat IR
        if (def.kind) {
          delete config.blaster;
          delete config.availability_entity;
        }
        if (!config.custom && (deviceChanged || config.model !== before.model)) {
          // Doi loai thiet bi hoac mau remote: nut nhanh cu khong con dung, quay ve mac dinh moi
          delete config.quick;
          if (def.kind !== "entity") delete config.controls;
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
    this._form.hass = this._hass;
    this._form.data = this._formData();
    this._form.schema = this._schema();
  }
}

// Ten cu "ir-remote-card" duoc giu lai de dashboard da cau hinh tu truoc khong bi hong
const define = (tag, base) => {
  if (!customElements.get(tag)) customElements.define(tag, class extends base {});
};
define("aurora-device-control-card-editor", IrRemoteCardEditor);
define("ir-remote-card-editor", IrRemoteCardEditor);
if (!customElements.get("aurora-device-control-card")) {
  define("aurora-device-control-card", IrRemoteCard);
  define("ir-remote-card", IrRemoteCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "aurora-device-control-card",
    name: "Aurora Device Control Card",
    description: "Dieu khien quat, loa, TV hong ngoai qua ESPHome, dieu hoa, robot hut bui va camera",
  });
  console.info(
    `%c AURORA-DEVICE-CONTROL-CARD %c v${VERSION} `,
    "background:#6AA9F0;color:#fff",
    "background:#333;color:#fff"
  );
}
