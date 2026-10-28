/**
 * Lightweight, zero-dependency ZIP archive generator using standard PKZIP format.
 * Generates valid standard .zip files client-side for Maven project downloading.
 */

// CRC-32 Lookup Table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileEntry {
  path: string;
  content: string | Uint8Array;
}

/**
 * Creates a standard PK Zip Blob from a list of relative file entries.
 */
export function createZipArchive(files: ZipFileEntry[]): Blob {
  const encoder = new TextEncoder();
  const fileRecords: {
    pathBytes: Uint8Array;
    contentBytes: Uint8Array;
    crc: number;
    offset: number;
    time: number;
    date: number;
  }[] = [];

  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  const parts: Uint8Array[] = [];
  let currentOffset = 0;

  for (const file of files) {
    const pathBytes = encoder.encode(file.path.replace(/^\//, ''));
    const contentBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const checksum = crc32(contentBytes);

    // Local file header (30 bytes + filename + data)
    const localHeader = new Uint8Array(30 + pathBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);         // Version needed to extract (2.0)
    view.setUint16(6, 0x0800, true);     // General purpose bit flag (UTF-8 filename)
    view.setUint16(8, 0, true);          // Compression method (0 = stored / uncompressed)
    view.setUint16(10, dosTime, true);   // Last mod file time
    view.setUint16(12, dosDate, true);   // Last mod file date
    view.setUint32(14, checksum, true);  // CRC-32
    view.setUint32(18, contentBytes.length, true); // Compressed size
    view.setUint32(22, contentBytes.length, true); // Uncompressed size
    view.setUint16(26, pathBytes.length, true);    // Filename length
    view.setUint16(28, 0, true);                   // Extra field length

    localHeader.set(pathBytes, 30);

    fileRecords.push({
      pathBytes,
      contentBytes,
      crc: checksum,
      offset: currentOffset,
      time: dosTime,
      date: dosDate,
    });

    parts.push(localHeader);
    parts.push(contentBytes);

    currentOffset += localHeader.length + contentBytes.length;
  }

  // Central directory
  const centralDirStart = currentOffset;
  let centralDirSize = 0;

  for (const rec of fileRecords) {
    // Central directory header (46 bytes + filename)
    const cdHeader = new Uint8Array(46 + rec.pathBytes.length);
    const view = new DataView(cdHeader.buffer);

    view.setUint32(0, 0x02014b50, true); // Central directory file header signature
    view.setUint16(4, 20, true);         // Version made by
    view.setUint16(6, 20, true);         // Version needed to extract
    view.setUint16(8, 0x0800, true);     // General purpose bit flag (UTF-8)
    view.setUint16(10, 0, true);         // Compression method (stored)
    view.setUint16(12, rec.time, true);  // File mod time
    view.setUint16(14, rec.date, true);  // File mod date
    view.setUint32(16, rec.crc, true);   // CRC-32
    view.setUint32(20, rec.contentBytes.length, true); // Compressed size
    view.setUint32(24, rec.contentBytes.length, true); // Uncompressed size
    view.setUint16(28, rec.pathBytes.length, true);    // Filename length
    view.setUint16(30, 0, true);         // Extra field length
    view.setUint16(32, 0, true);         // File comment length
    view.setUint16(34, 0, true);         // Disk number start
    view.setUint16(36, 0, true);         // Internal file attributes
    view.setUint32(38, 0, true);         // External file attributes
    view.setUint32(42, rec.offset, true); // Relative offset of local header

    cdHeader.set(rec.pathBytes, 46);

    parts.push(cdHeader);
    centralDirSize += cdHeader.length;
  }

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true);          // EOCD signature
  eocdView.setUint16(4, 0, true);                   // Number of this disk
  eocdView.setUint16(6, 0, true);                   // Disk where CD starts
  eocdView.setUint16(8, fileRecords.length, true);  // Total entries on this disk
  eocdView.setUint16(10, fileRecords.length, true); // Total entries
  eocdView.setUint32(12, centralDirSize, true);     // Size of central directory
  eocdView.setUint32(16, centralDirStart, true);    // Offset of start of CD
  eocdView.setUint16(20, 0, true);                  // Comment length

  parts.push(eocd);

  return new Blob(parts as any, { type: 'application/zip' });
}
