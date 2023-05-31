import {
  EnhancedSectionInstance,
  EnhancedPageObject,
  Definition,
} from "nightwatch";

type Context = EnhancedPageObject | EnhancedSectionInstance;

export function expectAllNotVisible(context: Context, selectors: Definition[]): void {
  selectors.forEach(selector => {
    context.expect.element(selector).to.not.be.visible;
  });
}

export function expectAllPresent(context: Context, selectors: Definition[]): void {
  selectors.forEach(selector => {
    context.expect.element(selector).to.be.present;
  });
}

export function expectAllNotPresent(context: Context, selectors: Definition[]): void {
  selectors.forEach(selector => {
    context.expect.element(selector).to.not.be.present;
  });
}

export function expectAllVisible(context: Context, selectors: Definition[]): void {
  selectors.forEach(selector => {
    context.expect.element(selector).to.be.visible;
  });
}

export function nthOfTypeSelector(selector: string, n: number): string {
  return `${selector}:nth-of-type(${n})`;
}

// Stole this from the first answer at https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Safari likes to add whitespace at the beginning/end of strings,
// presumably for layout/sizing purposes?
export function whitespacePaddedRegex(str: string): RegExp {
  return new RegExp(`(\\s+)?${escapeRegExp(str)}(\\s+)?`);
}
