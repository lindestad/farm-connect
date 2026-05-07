/**
 * Pure helper functions extracted from auth-provider for independent testing.
 */

/**
 * Parses both search params and hash params from a URL, with query-string
 * values taking precedence over matching hash values.
 * Returns an empty object for malformed URLs.
 */
export function parseUrlParams(url: string): Record<string, string> {
  try {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.search);
    const hash = parsedUrl.hash.startsWith("#")
      ? parsedUrl.hash.slice(1)
      : parsedUrl.hash;

    if (hash) {
      const hashParams = new URLSearchParams(hash);
      hashParams.forEach((value, key) => {
        if (!params.has(key)) {
          params.set(key, value);
        }
      });
    }

    return Object.fromEntries(params.entries());
  } catch {
    return {};
  }
}

type EmailLinkType = "email" | "recovery" | "invite" | "email_change";

/**
 * Maps a Supabase auth link `type` param to a normalised EmailLinkType.
 * "signup" and "magiclink" both map to "email"; unknown values default to
 * "email" as well.
 */
export function normalizeEmailLinkType(value?: string): EmailLinkType {
  if (!value || value === "signup" || value === "magiclink") {
    return "email";
  }

  if (
    value === "email" ||
    value === "recovery" ||
    value === "invite" ||
    value === "email_change"
  ) {
    return value;
  }

  return "email";
}
