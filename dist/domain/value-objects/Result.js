"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Failure = exports.Success = void 0;
exports.success = success;
exports.failure = failure;
exports.combine = combine;
class Success {
    constructor(value) {
        this.value = value;
        this.isSuccess = true;
        this.isFailure = false;
    }
    // Transforme la valeur si c'est un succès
    map(fn) {
        return success(fn(this.value));
    }
    mapError() {
        return this;
    }
    // Chain les Results
    flatMap(fn) {
        return fn(this.value);
    }
    // À utiliser seulement si tu es sûr que c'est un succès
    getValueOrThrow() {
        return this.value;
    }
}
exports.Success = Success;
class Failure {
    constructor(error) {
        this.error = error;
        this.isSuccess = false;
        this.isFailure = true;
    }
    // Rien à faire si c'est un échec
    map() {
        return this;
    }
    mapError(fn) {
        return failure(fn(this.error));
    }
    flatMap() {
        return this;
    }
    getValueOrThrow() {
        throw this.error;
    }
}
exports.Failure = Failure;
// Helpers pour créer des Results
function success(value) {
    return new Success(value);
}
function failure(error) {
    return new Failure(error);
}
// Combine plusieurs Results - retourne le premier échec trouvé ou tous les succès
function combine(...results) {
    const values = [];
    for (const result of results) {
        if (result.isFailure) {
            return result;
        }
        values.push(result.value);
    }
    return success(values);
}
