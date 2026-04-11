const pick = (source, allowed) => {
  const out = {};
  allowed.forEach((key) => {
    if (source[key] !== undefined) out[key] = source[key];
  });
  return out;
};

module.exports = pick;
