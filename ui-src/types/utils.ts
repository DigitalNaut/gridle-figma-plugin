/**
 * Extracts the keys of an object whose values are of a certain type.
 * You can specify the type of the key as well.
 * @example
 * const Obj = { a: "string", b: 1, c: "true", 42: false };
 * type Keys = ExtractKeysByValueType<typeof Obj, string, string>; // "a" | "c"
 * type Keys2 = ExtractKeysByValueType<typeof Obj, boolean, number>; // 42
 */
export type ExtractKeysByValueType<Obj, ValueType, KeyType> = {
  [Key in keyof Obj]: Obj[Key] extends ValueType ? Key : never;
}[Extract<keyof Obj, KeyType>];
