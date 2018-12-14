export default function trim(str) {
  return String.prototype.trim ? str.trim() : str.replace(/(^\s*|\s*$)/g, '');
}
