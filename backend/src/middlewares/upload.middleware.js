const multer = require('multer');
const sharp = require('sharp');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs/promises');

const uploadsDir = path.join(__dirname, '../../uploads');
const maxSize = 5 * 1024 * 1024;
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSize, files: 1, fields: 12, fieldSize: 100 * 1024, parts: 13 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(allowed.includes(file.mimetype) ? null : new Error('El archivo debe ser una imagen'), allowed.includes(file.mimetype));
  },
});

module.exports.single = (field) => (req, res, next) => {
  parser.single(field)(req, res, async (error) => {
    if (error) return next(error);
    if (!req.file) return next();
    let output;
    let format;
    try {
      const image = sharp(req.file.buffer, { failOn: 'warning', limitInputPixels: 40000000 });
      const metadata = await image.metadata();
      format = metadata.format;
      if (!['jpeg', 'png', 'webp'].includes(format) || (metadata.pages || 1) > 1 ||
          req.file.mimetype !== `image/${format}`) throw new Error('Invalid image');
      // Decodificar y volver a codificar: rechaza contenido truncado y elimina metadatos.
      output = await image.rotate().toFormat(format).toBuffer();
      if (output.length > maxSize) throw new Error('Invalid image');
    } catch {
      return next(new Error('El archivo debe ser una imagen'));
    }
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      const filename = `managed-${randomUUID()}.${format}`;
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, output, { flag: 'wx' });
      req.file = { filename, path: filePath, mimetype: `image/${format}`, size: output.length };
      next();
    } catch (error) {
      next(error);
    }
  });
};
