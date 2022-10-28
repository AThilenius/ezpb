import glob from 'glob';

/**
 * Takes in an array of paths (with or without glob character in them) and
 * returns a list of all path that resolve to the glob. This is done
 * synchronously.
 */
export function globPaths(paths: string | string[]): string[] {
  const pathsArr = typeof paths === 'string' ? [paths] : paths;

  // Resolve glob expressions
  const files: string[] = [];
  for (const fileInput of pathsArr) {
    if (!glob.hasMagic(fileInput)) {
      files.push(fileInput);
    } else {
      files.push(...glob.sync(fileInput));
    }
  }

  return files;
}
