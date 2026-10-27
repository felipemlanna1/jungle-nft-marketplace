export function resolveBreakpoints(styles, breakpoints) {
  let resolved = styles;
  for (const [name, value] of Object.entries(breakpoints)) {
    const placeholder = new RegExp(`__BREAKPOINT_${name.toUpperCase()}__`, 'gi');
    resolved = resolved.replaceAll(placeholder, value);
  }
  const remaining = resolved.match(/__BREAKPOINT_[a-z_]+__/i);
  if (remaining) throw new Error(`Unknown breakpoint placeholder: ${remaining[0]}`);
  return resolved;
}
