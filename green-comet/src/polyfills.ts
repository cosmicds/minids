// Polyfill for Array.at
const TypedArray = Reflect.getPrototypeOf(Int8Array);
for (const C of [Array, String, TypedArray]) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Object.defineProperty(C.prototype, "at",
                        { value: function at(n: any) {
                            // ToInteger() abstract op
                            n = Math.trunc(n) || 0;
                            // Allow negative indexing from the end
                            if (n < 0) n += this.length;
                            // OOB access is guaranteed to return undefined
                            if (n < 0 || n >= this.length) return undefined;
                            // Otherwise, this is just normal property access
                            return this[n];
                          },
                          writable: true,
                          enumerable: false,
                          configurable: true });
}