const splits = (s: string): string => {
  if (s === "") return s;
  return s.split('"').join("'").split(",").join("|");
};

const revert_splits = (s: string): string => {
  if (s === "") return s;
  return s.split("'").join('"').split("|").join(",");
};

const encode = <T>(data: T): string => {
  return splits(JSON.stringify(data));
};

const decode = <T>(s: string): T => {
  return JSON.parse(revert_splits(s));
};

export { decode, encode };
