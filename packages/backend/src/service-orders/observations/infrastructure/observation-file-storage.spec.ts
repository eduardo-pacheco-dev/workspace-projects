import * as fs from 'fs';
import * as path from 'path';
import { ObservationFileStorage } from './observation-file-storage';
import { ServiceOrderObservation } from '../domain/observation.entity';

jest.mock('fs');

describe('ObservationFileStorage', () => {
  let storage: ObservationFileStorage;

  beforeEach(() => {
    storage = new ObservationFileStorage();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => undefined);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => undefined);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('store', () => {
    it('should write the file and return its metadata', () => {
      const file = {
        originalname: 'anexo.PDF',
        mimetype: 'application/pdf',
        size: 123,
        buffer: Buffer.from('data'),
      } as Express.Multer.File;

      const result = storage.store(7, file);

      expect(result).toMatchObject({ originalName: 'anexo.PDF', mimetype: 'application/pdf', size: 123 });
      expect(result.filename).toMatch(/^[a-f0-9-]+\.PDF$/);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(path.join('service-order-7', 'observations')),
        file.buffer,
      );
    });

    it('should create the directory when it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      const file = {
        originalname: 'a.pdf',
        mimetype: 'application/pdf',
        size: 1,
        buffer: Buffer.from('data'),
      } as Express.Multer.File;

      storage.store(7, file);

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('getFilePath', () => {
    it('should join the storage dir and filename', () => {
      const observation = new ServiceOrderObservation({ id: 1, serviceOrderId: 7, title: 'A', filename: 'x.pdf' });

      const filePath = storage.getFilePath(observation);

      expect(filePath).toContain('service-order-7');
      expect(filePath.endsWith(path.join('observations', 'x.pdf'))).toBe(true);
    });
  });

  describe('remove', () => {
    it('should unlink the file when present', () => {
      const observation = new ServiceOrderObservation({ id: 1, serviceOrderId: 7, title: 'A', filename: 'x.pdf' });

      storage.remove(observation);

      expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when there is no file', () => {
      storage.remove({ serviceOrderId: 7, filename: null });

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
