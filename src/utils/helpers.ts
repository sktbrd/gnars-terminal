export function toObject(json?: object, space?: number) {
  if (!json) return json;
  return JSON.parse(
    JSON.stringify(json, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}
