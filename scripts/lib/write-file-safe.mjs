import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

function pause(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

function tmpPath(filePath) {
  return `${filePath}.build-${process.pid}.tmp`;
}

function cleanupTmp(filePath) {
  try {
    fs.unlinkSync(tmpPath(filePath));
  } catch {
    /* ignore */
  }
}

function commitTmp(filePath) {
  const tmp = tmpPath(filePath);
  try {
    fs.renameSync(tmp, filePath);
  } catch {
    fs.copyFileSync(tmp, filePath);
    fs.unlinkSync(tmp);
  }
}

/** Sync atomic write with retries — avoids Windows UNKNOWN errors when files are open in the IDE. */
export function writeFileSafeSync(filePath, content, retries = 8) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const tmp = tmpPath(filePath);
      fs.writeFileSync(tmp, content, 'utf8');
      commitTmp(filePath);
      return true;
    } catch (err) {
      cleanupTmp(filePath);
      if (attempt === retries - 1) {
        throw err;
      }
      pause(80 * (attempt + 1));
    }
  }
  return false;
}

/** Async atomic write with retries. */
export async function writeFileSafe(filePath, content, retries = 8) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const tmp = tmpPath(filePath);
      await fsp.writeFile(tmp, content, 'utf8');
      try {
        await fsp.rename(tmp, filePath);
      } catch {
        await fsp.copyFile(tmp, filePath);
        await fsp.unlink(tmp);
      }
      return true;
    } catch (err) {
      try {
        await fsp.unlink(tmpPath(filePath));
      } catch {
        /* ignore */
      }
      if (attempt === retries - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 80 * (attempt + 1)));
    }
  }
  return false;
}
