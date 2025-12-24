// File: backend/src/controllers/adminController.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        const suffix = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `image-${suffix}${ext}`;
        cb(null, filename);
    }
});

export const upload = multer({storage});
