/*
 * IR Remote Card - card Lovelace cho thiet bi IR "khong trang thai".
 *
 * Moi thiet bi chi can khai bao:
 *   type: custom:ir-remote-card
 *   remote: hsv_fan            # ten bo ma trong REMOTES ben duoi
 *   blaster: sr06_t1_3s_01     # ten node ESPHome phat IR (phan giua cua esphome.<ten>_send_nec)
 *   name: HSV Fan              # tuy chon, mac dinh lay ten cua remote
 *   availability_entity: ...   # tuy chon, mac dinh tu do theo cac entity cua blaster
 *
 * Card goi action esphome.<blaster>_send_<protocol>. Khong can build, khong phu thuoc thu vien nao.
 */

const VERSION = "0.1.0";

// Bo ma IR. Them thiet bi moi = them mot muc o day.
//   protocol: phan duoi cua action ESPHome (nec, samsung, ...)
//   address/repeats: mac dinh cho moi nut, tung nut co the ghi de
//   power: id nut duoc gui khi bam vao icon cua card
//   quick: 3 id nut hien o hang duoi cua card
//   buttons: luoi nut trong pop-up, theo thu tu tu trai qua phai.
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
};

const OFFLINE_STATES = ["unavailable", "unknown"];

const CARD_CSS = `
  :host { display: block; }
  ha-card {
    height: var(--ir-remote-card-height, 102px);
    box-sizing: border-box;
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    outline: 1.5px dashed rgba(144, 164, 174, 0.55);
    outline-offset: -1.5px;
    overflow: hidden;
    transition: opacity 0.2s;
  }
  ha-card.offline { opacity: 0.45; }
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
    background: rgba(144, 164, 174, 0.18);
    color: #90a4ae;
    cursor: pointer;
    --mdc-icon-size: 24px;
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
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 9px;
    color: #ef9a9a;
    --mdc-icon-size: 18px;
  }
  .badge .text { display: none; }
  ha-card.offline .badge {
    padding: 0 12px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--primary-text-color);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
  ha-card.offline .badge ha-icon { display: none; }
  ha-card.offline .badge .text { display: inline; }
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
  }
  .sheet {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-width: 540px;
    height: 100%;
    padding: 14px 14px calc(14px + env(safe-area-inset-bottom));
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
    .sheet { height: auto; min-height: 240px; max-height: 90%; }
  }
  :host(.open) .backdrop { opacity: 1; }
  :host(.open) .sheet { transform: translateY(0); }
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
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
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
  .grid button ha-icon { opacity: 0.9; }
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

class IrRemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onPopState = () => this._closePopup(false);
    this._onKeyDown = (ev) => {
      if (ev.key === "Escape") this._closePopup(true);
    };
  }

  static getStubConfig() {
    return { remote: "hsv_fan", blaster: "ten_node_esphome" };
  }

  setConfig(config) {
    if (!config.blaster) {
      throw new Error("ir-remote-card: thieu 'blaster' (ten node ESPHome phat IR)");
    }
    const def = config.custom || REMOTES[config.remote];
    if (!def) {
      throw new Error(
        `ir-remote-card: khong co remote '${config.remote}'. Co san: ${Object.keys(REMOTES).join(", ")}`
      );
    }
    this._config = config;
    this._def = def;
    this._byId = Object.fromEntries(def.buttons.filter((b) => b.id).map((b) => [b.id, b]));
    this._blasterIds = null;
    this._render();
    this._updateAvailability();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateAvailability();
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

  get _name() {
    return this._config.name || this._def.name;
  }

  get _icon() {
    return this._config.icon || this._def.icon;
  }

  _render() {
    const def = this._def;
    const iconButton = el("button", { class: "icon", title: this._name }, [icon(this._icon)]);
    iconButton.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._send(this._byId[def.power]);
    });

    const top = el("div", { class: "top" }, [
      iconButton,
      el("div", { class: "name", text: this._name }),
      el("div", { class: "badge" }, [icon("mdi:remote"), el("span", { class: "text" })]),
    ]);
    top.addEventListener("click", () => this._openPopup());

    const quick = el("div", { class: "quick" });
    for (const id of def.quick || []) {
      const btn = this._byId[id];
      if (!btn) continue;
      const node = el("button", { title: btn.label || id }, [icon(btn.icon)]);
      node.addEventListener("click", () => this._send(btn));
      quick.appendChild(node);
    }

    this._card = el("ha-card", {}, [top, quick]);
    this.shadowRoot.replaceChildren(el("style", { text: CARD_CSS }), this._card);
  }

  // Blaster mat ket noi khi moi entity cua no deu unavailable.
  _isOffline() {
    const states = this._hass && this._hass.states;
    if (!states) return false;
    const explicit = this._config.availability_entity;
    if (explicit) {
      return !!states[explicit] && OFFLINE_STATES.includes(states[explicit].state);
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

  _updateAvailability() {
    if (!this._card) return;
    const offline = this._isOffline();
    this._card.classList.toggle("offline", offline);
    if (offline) {
      const text = (this._hass && this._hass.localize("state.default.unavailable")) || "Unavailable";
      this._card.querySelector(".badge .text").textContent = text;
    }
  }

  _send(btn) {
    if (!btn || !this._hass) return;
    const def = this._def;
    const protocol = btn.protocol || def.protocol;
    const data = { address: btn.address ?? def.address, command: btn.command };
    const repeats = btn.repeats ?? def.repeats;
    if (repeats !== undefined) data.repeats = repeats;

    this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "light" }));
    this._hass
      .callService("esphome", `${this._config.blaster}_send_${protocol}`, data)
      .catch((err) => {
        this.dispatchEvent(
          new CustomEvent("hass-notification", {
            bubbles: true,
            composed: true,
            detail: { message: `${this._name}: ${err && err.message ? err.message : err}` },
          })
        );
      });
  }

  _openPopup() {
    if (this._popup) return;
    const def = this._def;
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });

    const close = el("button", { class: "close", title: "Close" }, [icon("mdi:close")]);
    close.addEventListener("click", () => this._closePopup(true));

    const grid = el("div", { class: "grid" });
    for (const btn of def.buttons) {
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
      const node = el("button", { title: btn.label || btn.id }, children);
      node.style.height = `${def.button_height || 54}px`;
      if (!btn.label) node.style.gridTemplateRows = "1fr";
      node.addEventListener("click", () => this._send(btn));
      grid.appendChild(node);
    }

    const backdrop = el("div", { class: "backdrop" });
    backdrop.addEventListener("click", () => this._closePopup(true));

    const sheet = el("div", { class: "sheet" }, [
      el("div", { class: "header" }, [
        el("div", { class: "icon" }, [icon(this._icon)]),
        el("div", { class: "name", text: this._name }),
        close,
      ]),
      grid,
    ]);

    root.append(el("style", { text: POPUP_CSS }), backdrop, sheet);
    document.body.appendChild(host);
    this._popup = host;

    // Them mot muc lich su de nut Back cua dien thoai dong pop-up thay vi roi dashboard
    history.pushState({ irRemoteCard: true }, "");
    window.addEventListener("popstate", this._onPopState);
    window.addEventListener("keydown", this._onKeyDown);

    requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add("open")));
  }

  // popHistory = true khi nguoi dung tu dong (bam X, nen, Esc): can lui lai muc lich su da them
  _closePopup(popHistory) {
    const host = this._popup;
    if (!host) return;
    this._popup = null;
    window.removeEventListener("popstate", this._onPopState);
    window.removeEventListener("keydown", this._onKeyDown);
    if (popHistory && history.state && history.state.irRemoteCard) history.back();
    host.classList.remove("open");
    setTimeout(() => host.remove(), 300);
  }
}

if (!customElements.get("ir-remote-card")) {
  customElements.define("ir-remote-card", IrRemoteCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "ir-remote-card",
    name: "IR Remote Card",
    description: "Remote cho thiet bi IR khong trang thai, phat qua ESPHome",
  });
  console.info(`%c IR-REMOTE-CARD %c v${VERSION} `, "background:#3E9BF0;color:#fff", "background:#333;color:#fff");
}
