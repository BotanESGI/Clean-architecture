"use strict";
// Implémentation récursive de map, filter et reduce
// Pas de boucles for, juste de la récursion
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = map;
exports.filter = filter;
exports.reduce = reduce;
exports.mapWithReduce = mapWithReduce;
exports.filterWithReduce = filterWithReduce;
function map(array, fn) {
    // Stop si tableau vide
    if (array.length === 0) {
        return [];
    }
    // Sinon on traite le premier et on rappelle sur le reste
    const [first, ...rest] = array;
    return [fn(first, 0), ...map(rest, (item, index) => fn(item, index + 1))];
}
function filter(array, predicate) {
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
function reduce(array, reducer, initialValue) {
    if (array.length === 0) {
        return initialValue;
    }
    const [first, ...rest] = array;
    const newAccumulator = reducer(initialValue, first, 0);
    return reduce(rest, (acc, item, index) => reducer(acc, item, index + 1), newAccumulator);
}
// Version avec reduce (comme demandé dans le cours)
function mapWithReduce(array, fn) {
    return reduce(array, (acc, item) => [...acc, fn(item)], []);
}
function filterWithReduce(array, predicate) {
    return reduce(array, (acc, item) => predicate(item) ? [...acc, item] : acc, []);
}
