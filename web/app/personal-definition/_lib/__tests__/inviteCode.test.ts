import { describe, expect, it } from "vitest";
import {
  buildInviteUrl, buildPairUrl, cleanName, decodeInvite, encodeInvite, inviteFromProfile,
  personFromBirthDate, personFromInvite, personFromProfile, readHashNames, type InvitePayload,
} from "../inviteCode";
import { track } from "../analytics";
import { calculateNumerology } from "../numerology";
import { profile } from "../../_components/__tests__/fixtures";

const P: InvitePayload = { v: 1, type: "INFP", sign: 11, lifePath: 33 };
const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");

describe("encodeInvite / decodeInvite", () => {
  it("round-trips a payload", () => {
    expect(decodeInvite(encodeInvite(P))).toEqual(P);
  });

  it("produces base64url with no padding", () => {
    expect(encodeInvite(P)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  const bad: [string, string | null | undefined][] = [
    ["null", null],
    ["undefined", undefined],
    ["empty", ""],
    ["not base64", "%%%"],
    ["non-JSON base64", b64("hello")],
    ["a JSON array", b64("[1,2]")],
    ["v: 2", b64(JSON.stringify({ ...P, v: 2 }))],
    ["type XXXX", b64(JSON.stringify({ ...P, type: "XXXX" }))],
    ["sign 12", b64(JSON.stringify({ ...P, sign: 12 }))],
    ["sign 1.5", b64(JSON.stringify({ ...P, sign: 1.5 }))],
    ['sign "3"', b64(JSON.stringify({ ...P, sign: "3" }))],
    ["lifePath 10", b64(JSON.stringify({ ...P, lifePath: 10 }))],
    ["lifePath 0", b64(JSON.stringify({ ...P, lifePath: 0 }))],
    ["over 300 chars", "A".repeat(301)],
    ["truncated (last 4 chars cut)", encodeInvite(P).slice(0, -4)],
  ];
  it.each(bad)("returns null for %s", (_label, code) => {
    expect(decodeInvite(code)).toBeNull();
  });

  it("drops unknown fields", () => {
    const got = decodeInvite(b64(JSON.stringify({ ...P, foo: 1 })));
    expect(got).toEqual(P);
    expect(got).not.toHaveProperty("foo");
  });
});

describe("inviteFromProfile", () => {
  it("carries no name, birth date or year", () => {
    const inv = inviteFromProfile(profile);
    const year = profile.user.birth_date.slice(0, 4);
    for (const s of [JSON.stringify(inv), JSON.stringify(decodeInvite(encodeInvite(inv)))]) {
      expect(s).not.toContain(profile.user.name);
      expect(s).not.toContain(profile.user.birth_date);
      expect(s).not.toContain(year);
    }
  });

  it("maps type, sign index and life path from the profile", () => {
    const person = personFromInvite(inviteFromProfile(profile));
    expect(person).toEqual(personFromProfile(profile));
    expect(person.type).toBe(profile.mbti.type);
    expect(person.sign).toBe(profile.zodiac.sun_sign);
    expect(person.lifePath).toBe(profile.numerology.life_path);
  });
});

describe("readHashNames / cleanName", () => {
  it("decodes n and m", () => {
    expect(readHashNames("#n=Kh%C3%A1nh&m=An")).toEqual({ n: "Khánh", m: "An" });
  });
  it("returns nulls for a bad escape", () => {
    expect(readHashNames("#n=%E0%A4%A")).toEqual({ n: null, m: null });
  });
  it("drops a 31-char name", () => {
    expect(readHashNames(`#n=${"a".repeat(31)}`).n).toBeNull();
  });
  it("drops a blank name", () => {
    expect(readHashNames("#n=%20%20").n).toBeNull();
  });
  it("keeps & = # inside an encoded name", () => {
    expect(readHashNames("#n=A%26B%3DC%23").n).toBe("A&B=C#");
  });
  it("round-trips emoji and CJK", () => {
    expect(readHashNames(`#n=${encodeURIComponent("😀李")}`).n).toBe("😀李");
  });
  it("strips control characters", () => {
    expect(cleanName("A\u0007B\n")).toBe("AB");
  });
});

describe("buildInviteUrl / buildPairUrl", () => {
  const c = encodeInvite(P);
  it("puts the name after #", () => {
    expect(buildInviteUrl("https://x.app", c, "Khánh")).toBe(
      `https://x.app/personal-definition/hop-nhau?i=${c}#n=Kh%C3%A1nh`,
    );
  });
  it("has no # without a name", () => {
    expect(buildInviteUrl("https://x.app", c, null)).toBe(`https://x.app/personal-definition/hop-nhau?i=${c}`);
  });
  it("builds a pair URL with both names", () => {
    expect(buildPairUrl("https://x.app", c, "BBB", "Khánh", "An")).toBe(
      `https://x.app/personal-definition/hop-nhau?i=${c}&j=BBB#n=Kh%C3%A1nh&m=An`,
    );
  });
  it("omits each null name part", () => {
    const base = `https://x.app/personal-definition/hop-nhau?i=${c}&j=BBB`;
    expect(buildPairUrl("https://x.app", c, "BBB", null, "An")).toBe(`${base}#m=An`);
    expect(buildPairUrl("https://x.app", c, "BBB", "Khánh", null)).toBe(`${base}#n=Kh%C3%A1nh`);
    expect(buildPairUrl("https://x.app", c, "BBB", null, null)).toBe(base);
  });
});

describe("personFromBirthDate", () => {
  it("gives sign, element and life path but no type", () => {
    const p = personFromBirthDate("2003-03-14");
    expect(p.sign).toBe("Song Ngư");
    expect(p.element).toBe("Water");
    expect(p.lifePath).toBe(calculateNumerology("2003-03-14", "A").life_path);
    expect(p).not.toHaveProperty("type");
  });
});

describe("track", () => {
  it("is a no-op", () => {
    expect(track("compat_full_view", { tier: "hop-ca" })).toBeUndefined();
  });
});
