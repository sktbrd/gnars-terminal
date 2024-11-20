export function toObject(json: object, space?: number) {
  return JSON.parse(
    JSON.stringify(json, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}
