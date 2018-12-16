export default function isString(value) {
  return value != null && (typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]');
}
