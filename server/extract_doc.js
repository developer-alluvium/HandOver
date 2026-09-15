import fs from 'fs';
import zlib from 'zlib';

function extractDocxText(docxPath, outPath) {
  const buffer = fs.readFileSync(docxPath);
  let offset = 0;
  while (offset < buffer.length - 30) {
    if (buffer.readUInt32LE(offset) === 0x04034b50) {
      const fnLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);
      const compSize = buffer.readUInt32LE(offset + 18);
      const compMethod = buffer.readUInt16LE(offset + 8);
      const fileName = buffer.toString('utf8', offset + 30, offset + 30 + fnLen);
      const dataStart = offset + 30 + fnLen + extraLen;
      if (fileName === 'word/document.xml') {
        const compData = buffer.slice(dataStart, dataStart + compSize);
        const decompressed = compMethod === 8 ? zlib.inflateRawSync(compData) : compData;
        const text = decompressed
          .toString('utf8')
          .replace(/<w:p[ >]/g, '\n')
          .replace(/<[^>]+>/g, '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
          .join('\n');
        fs.writeFileSync(outPath, text, 'utf8');
        console.log('Extracted', outPath, 'Length:', text.length);
        return;
      }
      offset = dataStart + compSize;
    } else {
      offset++;
    }
  }
}

extractDocxText('OISPL_ITD_Export_ShippingBill_Integration_API_1.1 (1).docx', 'sb_doc_text.txt');

