"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LegacyConfirmRedirect;
const react_1 = __importDefault(require("react"));
const navigation_1 = require("next/navigation");
function LegacyConfirmRedirect({ params }) {
    const p = react_1.default.use(params);
    (0, navigation_1.redirect)(`/confirm/${p.token}`);
}
