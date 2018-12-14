export default function removePrefix(str, prefix) {
  return str.indexOf(prefix) === 0 ? str.slice(prefix.length) : str;
}
