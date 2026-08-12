import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ServiceOrderObservation } from '../domain/observation.entity';

export interface StoredFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class ObservationFileStorage {
  private storageDir(serviceOrderId: number): string {
    return path.resolve('uploads', `service-order-${serviceOrderId}`, 'observations');
  }

  getFilePath(observation: { serviceOrderId: number; filename?: string | null }): string {
    return path.join(this.storageDir(observation.serviceOrderId), observation.filename || '');
  }

  store(serviceOrderId: number, file: Express.Multer.File): StoredFile {
    const dir = this.storageDir(serviceOrderId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    fs.writeFileSync(path.join(dir, filename), file.buffer);

    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  remove(observation: { serviceOrderId: number; filename?: string | null }): void {
    if (!observation.filename) return;
    const filePath = this.getFilePath(observation);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
