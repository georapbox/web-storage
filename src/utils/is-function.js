export default function isFunction(value) {
  const tag = Object.prototype.toString.call(value);
  const asyncTag = '[object AsyncFunction]';
  const funcTag = '[object Function]';
  const genTag = '[object GeneratorFunction]';
  return tag === asyncTag || tag === funcTag || tag === genTag;
}
