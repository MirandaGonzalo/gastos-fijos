import { ConflictException, NotFoundException } from '@nestjs/common';

// Códigos de error de Prisma que nos interesan:
// P2002 = valor único repetido, P2003 = clave foránea inválida/en uso, P2025 = registro no encontrado
export function prismaErrorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = err.code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

// Traduce errores de Prisma de los catálogos a errores HTTP claros
export function mapCatalogError(
  err: unknown,
  label: string,
  name?: string,
): unknown {
  switch (prismaErrorCode(err)) {
    case 'P2002':
      return new ConflictException(`${label} "${name}" ya existe`);
    case 'P2003':
      return new ConflictException(
        `${label} está en uso por algún gasto y no se puede borrar`,
      );
    case 'P2025':
      return new NotFoundException(`${label} no existe`);
    default:
      return err;
  }
}
