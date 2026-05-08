import {
  normalizeEmailLinkType,
  parseUrlParams,
} from "../src/lib/auth-helpers";

// parseUrlParams
describe("parseUrlParams", () => {
  it("parses querystring params", () => {
    expect(parseUrlParams("https://app.example.com?foo=bar&baz=qux")).toEqual({
      foo: "bar",
      baz: "qux",
    });
  });

  it("parses hash params when no querystring", () => {
    expect(
      parseUrlParams("https://app.example.com#token=abc&type=recovery"),
    ).toEqual({
      token: "abc",
      type: "recovery",
    });
  });

  it("merges querystring and hash params", () => {
    expect(
      parseUrlParams("https://app.example.com?from=query#extra=hashval"),
    ).toEqual({ from: "query", extra: "hashval" });
  });

  it("querystring values take precedence over matching hash keys", () => {
    expect(
      parseUrlParams("https://app.example.com?type=recovery#type=email"),
    ).toEqual({ type: "recovery" });
  });

  it("returns empty object for a malformed URL", () => {
    expect(parseUrlParams("not-a-url")).toEqual({});
    expect(parseUrlParams("")).toEqual({});
  });

  it("returns empty object when there are no params", () => {
    expect(parseUrlParams("https://app.example.com")).toEqual({});
  });
});

// normalizeEmailLinkType
describe("normalizeEmailLinkType", () => {
  it("maps undefined to email", () => {
    expect(normalizeEmailLinkType(undefined)).toBe("email");
  });

  it("maps empty string to email", () => {
    expect(normalizeEmailLinkType("")).toBe("email");
  });

  it("maps 'signup' to email", () => {
    expect(normalizeEmailLinkType("signup")).toBe("email");
  });

  it("maps 'magiclink' to email", () => {
    expect(normalizeEmailLinkType("magiclink")).toBe("email");
  });

  it("passes 'email' through unchanged", () => {
    expect(normalizeEmailLinkType("email")).toBe("email");
  });

  it("passes 'recovery' through unchanged", () => {
    expect(normalizeEmailLinkType("recovery")).toBe("recovery");
  });

  it("passes 'invite' through unchanged", () => {
    expect(normalizeEmailLinkType("invite")).toBe("invite");
  });

  it("passes 'email_change' through unchanged", () => {
    expect(normalizeEmailLinkType("email_change")).toBe("email_change");
  });

  it("maps unknown values to email", () => {
    expect(normalizeEmailLinkType("sms")).toBe("email");
    expect(normalizeEmailLinkType("oauth")).toBe("email");
  });
});
