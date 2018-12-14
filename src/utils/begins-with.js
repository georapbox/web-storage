export default function beginsWith(str, prefix) {
  return str.substr(0, prefix.length) === prefix;
}
