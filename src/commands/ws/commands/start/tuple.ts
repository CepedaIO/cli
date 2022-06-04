export function tuple(link:string): [string, string] {
  const parts = link.split(':');
  return [parts[0], parts[1]];
}