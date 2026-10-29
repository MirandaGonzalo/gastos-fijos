import { ConflictException, NotFoundException } from '@nestjs/common';
import { mapCatalogError, prismaErrorCode } from './prisma-errors';

describe('prisma-errors', () => {
  describe('prismaErrorCode', () => {
    it('lee el código de un error de Prisma', () => {
      expect(prismaErrorCode({ code: 'P2002' })).toBe('P2002');
    });

    it('devuelve undefined si no es un error de Prisma', () => {
      expect(prismaErrorCode(new Error('otro'))).toBeUndefined();
      expect(prismaErrorCode(null)).toBeUndefined();
      expect(prismaErrorCode({ code: 123 })).toBeUndefined();
    });
  });

  describe('mapCatalogError', () => {
    it('nombre repetido (P2002) -> 409', () => {
      const err = mapCatalogError({ code: 'P2002' }, 'La categoría', 'Luz');
      expect(err).toBeInstanceOf(ConflictException);
      expect((err as ConflictException).message).toBe(
        'La categoría "Luz" ya existe',
      );
    });

    it('en uso por un gasto (P2003) -> 409', () => {
      expect(mapCatalogError({ code: 'P2003' }, 'La categoría')).toBeInstanceOf(
        ConflictException,
      );
    });

    it('no existe (P2025) -> 404', () => {
      expect(mapCatalogError({ code: 'P2025' }, 'La categoría')).toBeInstanceOf(
        NotFoundException,
      );
    });

    it('cualquier otro error se devuelve tal cual', () => {
      const original = new Error('se cayó la base');
      expect(mapCatalogError(original, 'La categoría')).toBe(original);
    });
  });
});
