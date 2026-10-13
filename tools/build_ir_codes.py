#!/usr/bin/env python3
"""Tao dist/aurora-ir-codes.js tu kho Flipper-IRDB (https://github.com/Lucaslhm/Flipper-IRDB, CC0).

Cach dung:
    python3 -I tools/build_ir_codes.py <thu muc Flipper-IRDB da giai nen> dist/aurora-ir-codes.js

Moi file .ir la mot remote. Cac remote cung hang, cung giao thuc va dia chi, khong co phim nao
trai ma nhau thi duoc gop thanh mot "bo ma". Ten phim duoc doi ve id chung (power, vol_up...)
de card xep vao bo cuc co san; phim khong nhan ra thi giu ten goc va nam o phan phim phu.
"""
import collections
import json
import os
import re
import sys

# Thu muc cua kho -> loai thiet bi cua card
CATEGORIES = {
    "TVs": "tv", "Fans": "fan", "Projectors": "projector", "SoundBars": "speaker", "Speakers": "speaker",
    "Audio_and_Video_Receivers": "receiver", "Cable_Boxes": "stb", "DVB-T": "stb", "TV_Tuner": "stb",
    "Streaming_Devices": "streamer", "DVD_Players": "player", "Blu-Ray": "player", "CD_Players": "player",
    "LED_Lighting": "led", "Air_Purifiers": "purifier", "Heaters": "heater", "Humidifiers": "humidifier",
    "Vacuum_Cleaners": "vacuum", "Monitors": "monitor",
}
# Giao thuc cua Flipper -> ma ngan trong file du lieu
PROTOCOLS = {
    "NEC": "N", "NECext": "X", "NEC42": "N42", "NEC42ext": "X42", "Samsung32": "S", "RC5": "R5", "RC5X": "R5",
    "RC6": "R6", "SIRC": "S12", "SIRC15": "S15", "SIRC20": "S20", "Kaseikyo": "K", "RCA": "RCA", "Pioneer": "P",
}
PROTOCOL_NAMES = {"N": "NEC", "X": "NEC", "N42": "NEC42", "X42": "NEC42", "S": "Samsung", "R5": "RC5", "R6": "RC6",
                  "S12": "Sony", "S15": "Sony", "S20": "Sony", "K": "Kaseikyo", "RCA": "RCA", "P": "Pioneer"}

# id chung -> cac cach viet (da bo dau cach, gach, viet thuong; "+"/"-" cuoi ten da doi thanh up/down)
SYNONYMS = {
    "power": "power pwr onoff poweronoff powertoggle standby pow poweron/off powerbutton onstandby standbyon powr",
    "power_on": "poweron on turnon",
    "power_off": "poweroff off turnoff",
    "vol_up": "volup volumeup vup volplus volumeplus volu vol_u",
    "vol_down": "voldown voldn volumedown vdown voldwn volminus volumeminus vold volumedn vol_d",
    "mute": "mute muting mutetoggle",
    "ch_up": "chup chnext channelup chanup chplus channelnext progup pup channelplus chu",
    "ch_down": "chdown chprev channeldown chandown chminus channelprev progdown pdown chdn channelminus chd channeldn",
    "up": "up arrowup cursorup navup uparrow", "down": "down arrowdown cursordown navdown downarrow",
    "left": "left arrowleft cursorleft navleft leftarrow", "right": "right arrowright cursorright navright rightarrow",
    "ok": "ok enter select center okay okenter enterok confirm",
    "menu": "menu settings setup", "home": "home smarthub smart hub",
    "return": "back return", "exit": "exit",
    "source": "source input inputs av tvav src inputsource sourceinput inputselect",
    "info": "info display information", "guide": "guide epg",
    "play": "play", "pause": "pause", "play_pause": "playpause playorpause playpa", "stop": "stop",
    "rewind": "rewind rew rw fastrewind fr frwd fastba fastbackward backward", "fast_forward": "fastforward ff fwd forward ffwd fastfwd fastfo",
    "next": "next skipnext nexttrack skipforward skipfwd", "prev": "prev previous skipprev prevtrack skipback previoustrack",
    "record": "record rec",
    "red": "red", "green": "green", "yellow": "yellow", "blue": "blue",
    "pre_ch": "prech lastch last previouschannel recall",
    "speed": "speed fanspeed", "speed_up": "speedup fanup fanspeedup faster", "speed_down": "speeddown fandown fanspeeddown slower",
    "speed_1": "speed1 low fanlow", "speed_2": "speed2 medium med fanmed fanmedium", "speed_3": "speed3 high fanhigh",
    "swing": "swing oscillate osc oscillation rotate rotation", "timer": "timer sleeptimer", "sleep": "sleep sleepmode",
    "mode": "mode", "light": "light lamp lights",
    "bright_up": "brightnessup brightup brighter brightnessplus brightplus briup",
    "bright_down": "brightnessdown brightdown dimmer dim brightnessminus brightminus bridown",
    "white": "white", "flash": "flash", "strobe": "strobe", "fade": "fade", "smooth": "smooth",
    "temp_up": "tempup temperatureup heatup", "temp_down": "tempdown temperaturedown heatdown",
    "eject": "eject openclose", "subtitle": "subtitle subtitles sub cc", "audio": "audio",
    "netflix": "netflix", "youtube": "youtube",
}
MAX_EXTRAS = 48
LOOKUP = {}
for key, words in SYNONYMS.items():
    for word in words.split():
        LOOKUP[re.sub(r"[^a-z0-9]", "", word)] = key
for n in range(10):
    for form in (str(n), f"num{n}", f"digit{n}", f"key{n}", f"n{n}", f"btn{n}", f"number{n}"):
        LOOKUP[form] = f"num_{n}"


def canonical(name):
    text = name.strip().lower()
    if text.endswith("+"):
        text = text[:-1] + "up"
    elif text.endswith("-") and len(text) > 1:
        text = text[:-1] + "down"
    return LOOKUP.get(re.sub(r"[^a-z0-9]", "", text))


def label_of(name):
    return re.sub(r"\s+", " ", name.replace("_", " ")).strip().upper()[:14]


def le_hex(text, width):
    value = int("".join(reversed(text.split())), 16)
    return format(value & ((1 << width) - 1), "x")


def compact_raw(freq, data):
    """Tin hieu tho -> "r:<kHz>:<bang do dai>:<chuoi chi so>"; giu toi da 3 khung dau."""
    values = [int(x) for x in data.split()]
    frames, count = 0, 0
    for i, value in enumerate(values):
        count = i + 1
        if i % 2 == 1 and value > 15000:
            frames += 1
            if frames == 3:
                break
        if count >= 400:
            break
    values = values[:count]
    if len(values) < 8:
        return None
    if len(values) % 2:
        values.append(40000)
    values = [min(v, 65000) for v in values]
    for tolerance in (0.12, 0.2, 0.3):
        palette = []  # [tong, so lan]
        indexes = []
        for value in values:
            for n, (total, hits) in enumerate(palette):
                mean = total / hits
                if abs(value - mean) <= max(60, mean * tolerance):
                    palette[n] = (total + value, hits + 1)
                    indexes.append(n)
                    break
            else:
                palette.append((value, 1))
                indexes.append(len(palette) - 1)
        if len(palette) <= 36:
            digits = "0123456789abcdefghijklmnopqrstuvwxyz"
            means = ".".join(str(round(total / hits)) for total, hits in palette)
            return f"r:{round(int(freq) / 1000)}:{means}:{''.join(digits[i] for i in indexes)}"
    return None


def parse_file(path):
    text = open(path, encoding="utf-8", errors="replace").read()
    signals = []
    for block in re.split(r"^#.*$", text, flags=re.M):
        fields = dict(re.findall(r"^(\w+): (.*)$", block, flags=re.M))
        name = fields.get("name", "").strip()
        if not name:
            continue
        if fields.get("type") == "parsed" and fields.get("protocol") in PROTOCOLS:
            proto = PROTOCOLS[fields["protocol"]]
            try:
                address = le_hex(fields["address"], 32)
                command = le_hex(fields["command"], 32)
            except (KeyError, ValueError):
                continue
            signals.append((name, f"{proto}:{address}:{command}"))
        elif fields.get("type") == "raw" and "data" in fields:
            try:
                code = compact_raw(fields.get("frequency", "38000"), fields["data"])
            except ValueError:
                code = None
            if code:
                signals.append((name, code))
    return signals


def main(root, out):
    files = collections.defaultdict(list)  # (loai, hang) -> [(ten file, tin hieu)]
    for category, kind in CATEGORIES.items():
        base = os.path.join(root, category)
        for folder, _, names in os.walk(base):
            for name in sorted(names):
                if not name.endswith(".ir"):
                    continue
                parts = os.path.relpath(os.path.join(folder, name), base).split(os.sep)
                stem = name[:-3]
                brand = parts[0] if len(parts) > 1 else stem.split("_")[0]
                brand = brand.replace("_", " ").strip()
                signals = parse_file(os.path.join(folder, name))
                if signals:
                    files[(kind, brand)].append((stem, signals))

    types = collections.defaultdict(dict)
    stats = collections.Counter()
    for (kind, brand), remotes in sorted(files.items()):
        sets = []
        remotes.sort(key=lambda item: -len(item[1]))
        for stem, signals in remotes:
            keys, extras = {}, {}
            for name, code in signals:
                key = canonical(name)
                if key and key not in keys:
                    keys[key] = code
                else:
                    label = label_of(name)
                    if label and label not in extras and code not in keys.values():
                        extras[label] = code
            parsed = [code.rsplit(":", 1)[0] for code in list(keys.values()) + list(extras.values()) if not code.startswith("r:")]
            main_addr = collections.Counter(parsed).most_common(1)[0][0] if parsed else None
            target = None
            for item in sets:
                if item["main"] != main_addr:
                    continue
                if main_addr is None:
                    if item["keys"] == keys and item["extras"] == extras:
                        target = item
                        break
                    continue
                # Cung giao thuc va dia chi la cung mot ho ma: luon gop
                target = item
                break
            if target and main_addr is not None:
                known = set(target["keys"].values()) | set(target["extras"].values())
                for key, code in keys.items():
                    if key not in target["keys"]:
                        target["keys"][key] = code
                    elif target["keys"][key] != code and code not in known:
                        # Phim trung ten nhung khac ma (remote doi khac): giu lai o phan phim phu
                        extras.setdefault(f"{key.upper().replace('_', ' ')} 2"[:14], code)
                for label, code in extras.items():
                    if label not in target["extras"] and code not in known:
                        target["extras"][label] = code
                    target["hits"][label] += 1
                target["names"].append(stem)
            elif target:
                target["names"].append(stem)
            else:
                sets.append({"main": main_addr, "keys": keys, "extras": extras, "names": [stem],
                             "hits": collections.Counter(extras.keys())})
        sets.sort(key=lambda item: (-len(item["names"]), -len(item["keys"]) - len(item["extras"])))
        used = collections.Counter()
        result = []
        for item in sets:
            main_addr = item["main"]
            if main_addr:
                proto, address = main_addr.split(":")
                ident = f"{proto}-{address}".lower()
                title = f"{PROTOCOL_NAMES[proto]} {address.upper()}"
            else:
                ident = re.sub(r"[^a-z0-9]+", "-", item["names"][0].lower()).strip("-") or "raw"
                title = "Raw"
            used[ident] += 1
            if used[ident] > 1:
                ident = f"{ident}-{used[ident]}"
            names = [n.replace("_", " ") for n in item["names"]]
            title += " · " + ", ".join(names[:2]) + (f" +{len(names) - 2}" if len(names) > 2 else "")

            def short(code):
                return code.rsplit(":", 1)[1] if main_addr and code.startswith(main_addr + ":") else code

            entry = {"i": ident, "n": title, "k": {k: short(v) for k, v in item["keys"].items()}}
            if main_addr:
                entry["d"] = main_addr
            if item["extras"]:
                # Phim phu: phim co o nhieu remote dung truoc, toi da MAX_EXTRAS phim
                labels = sorted(item["extras"], key=lambda label: -item["hits"][label])[:MAX_EXTRAS]
                entry["x"] = [[label, short(item["extras"][label])] for label in labels]
            result.append(entry)
            stats["sets"] += 1
            stats["keys"] += len(entry["k"]) + len(entry.get("x", []))
        types[kind][brand] = result
        stats["brands"] += 1
        stats["files"] += len(remotes)

    data = {"v": 1, "source": "Flipper-IRDB (CC0)", "types": types}
    body = json.dumps(data, separators=(",", ":"), ensure_ascii=False, sort_keys=True)
    with open(out, "w", encoding="utf-8") as handle:
        handle.write("// Tao tu dong bang tools/build_ir_codes.py tu Flipper-IRDB (CC0). Khong sua tay.\n")
        handle.write(f"window.AURORA_IR_CODES = {body};\n")
    print(dict(stats), "bytes", os.path.getsize(out))
    for kind, brands in types.items():
        print(f"  {kind:11} brands {len(brands):4} sets {sum(len(v) for v in brands.values()):5}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
