module.exports = {
  randomHash() {
    const segment = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return `${segment()}-${segment()}-${segment()}`;
  },
  padLeadingZeros(num , places) {
    return String(num).padStart(places, '0');
  }
};
