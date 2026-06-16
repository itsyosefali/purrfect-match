import ar from "./locales/ar.json";
import en from "./locales/en.json";
import type { Locale } from "./config";

export type Messages = typeof en;

const catalogs: Record<Locale, Messages> = { en, ar };

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === "string" ? value : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const catalog = catalogs[locale];
  const pluralKey = params?.count !== undefined && Number(params.count) !== 1
    ? `${key}_plural`
    : key;

  let text = getNestedValue(catalog as Record<string, unknown>, pluralKey)
    ?? getNestedValue(catalog as Record<string, unknown>, key)
    ?? getNestedValue(en as Record<string, unknown>, key)
    ?? key;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`\\{${param}\\}`, "g"), String(value));
    });
  }

  return text;
}
