// Implémentation récursive de map, filter et reduce
// Pas de boucles for, juste de la récursion

export function map<T, U>(
  array: readonly T[],
  fn: (item: T, index: number) => U
): U[] {
  // Stop si tableau vide
  if (array.length === 0) {
    return [];
  }

  // Sinon on traite le premier et on rappelle sur le reste
  const [first, ...rest] = array;
  return [fn(first, 0), ...map(rest, (item, index) => fn(item, index + 1))];
}

export function filter<T>(
  array: readonly T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  if (array.length === 0) {
    return [];
  }

  const [first, ...rest] = array;
  const filteredRest = filter(rest, (item, index) => predicate(item, index + 1));
  
  // On garde le premier seulement s'il passe le test
  return predicate(first, 0)
    ? [first, ...filteredRest]
    : filteredRest;
}

export function reduce<T, U>(
  array: readonly T[],
  reducer: (accumulator: U, item: T, index: number) => U,
  initialValue: U
): U {
  if (array.length === 0) {
    return initialValue;
  }

  const [first, ...rest] = array;
  const newAccumulator = reducer(initialValue, first, 0);
  return reduce(rest, (acc, item, index) => reducer(acc, item, index + 1), newAccumulator);
}

// Version avec reduce (comme demandé dans le cours)
export function mapWithReduce<T, U>(
  array: readonly T[],
  fn: (item: T) => U
): U[] {
  return reduce(
    array,
    (acc, item) => [...acc, fn(item)],
    [] as U[]
  );
}

export function filterWithReduce<T>(
  array: readonly T[],
  predicate: (item: T) => boolean
): T[] {
  return reduce(
    array,
    (acc, item) => predicate(item) ? [...acc, item] : acc,
    [] as T[]
  );
}

