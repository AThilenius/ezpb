import fs from 'fs';
import path from 'path';

export function makeAndGetUserDataDir(): string {
  const dir =
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Preferences'
      : process.env.HOME + '/.local/share');

  makeDirRecursive(dir);
  return dir;
}

export function makeDirRecursive(inputPath: string) {
  if (fs.existsSync(inputPath)) {
    return;
  }
  const basePath = path.dirname(inputPath);
  if (fs.existsSync(basePath)) {
    fs.mkdirSync(inputPath);
  }
  makeDirRecursive(basePath);
}

export function makeDirRecursiveAndWriteFileSync(
  filePath: string,
  content: string
) {
  makeDirRecursive(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}
