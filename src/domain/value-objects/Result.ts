// Type Result pour gérer les erreurs sans throw
// Comme ça, les erreurs sont explicites dans la signature de la fonction
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(public readonly value: T) {}

  // Transforme la valeur si c'est un succès
  map<U>(fn: (value: T) => U): Result<U, never> {
    return success(fn(this.value));
  }

  mapError<E2>(): Result<T, E2> {
    return this as unknown as Result<T, E2>;
  }

  // Chain les Results
  flatMap<U, E2>(fn: (value: T) => Result<U, E2>): Result<U, E2> {
    return fn(this.value);
  }

  // À utiliser seulement si tu es sûr que c'est un succès
  getValueOrThrow(): T {
    return this.value;
  }
}

export class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(public readonly error: E) {}

  // Rien à faire si c'est un échec
  map<U>(): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  mapError<E2>(fn: (error: E) => E2): Result<never, E2> {
    return failure(fn(this.error));
  }

  flatMap<U, E2>(): Result<U, E2> {
    return this as unknown as Result<U, E2>;
  }

  getValueOrThrow(): never {
    throw this.error;
  }
}

// Helpers pour créer des Results
export function success<T>(value: T): Success<T> {
  return new Success(value);
}

export function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}

// Combine plusieurs Results - retourne le premier échec trouvé ou tous les succès
export function combine<T extends readonly unknown[]>(
  ...results: { [K in keyof T]: Result<T[K]> }
): Result<T> {
  const values: unknown[] = [];
  
  for (const result of results) {
    if (result.isFailure) {
      return result as Failure<unknown> as Failure<never>;
    }
    values.push(result.value);
  }
  
  return success(values as unknown as T);
}

