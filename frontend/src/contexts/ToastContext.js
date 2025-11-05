"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastProvider = ToastProvider;
exports.useToast = useToast;
const react_1 = __importStar(require("react"));
const ToastContext = (0, react_1.createContext)(undefined);
function ToastProvider({ children }) {
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const show = (text, type = "info", durationMs = 3000) => {
        const id = Math.random().toString(36).slice(2);
        const toast = { id, type, text };
        setToasts((prev) => [...prev, toast]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, durationMs);
    };
    const value = (0, react_1.useMemo)(() => ({ show }), []);
    return (<ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map((t) => (<div key={t.id} className={"pointer-events-auto card min-w-[260px] px-4 py-3 shadow-glow border " +
                (t.type === "success"
                    ? "border-primary/40"
                    : t.type === "error"
                        ? "border-red-500/40"
                        : t.type === "warning"
                            ? "border-yellow-500/40"
                            : "border-white/10")}>
            <p className="text-sm">{t.text}</p>
          </div>))}
      </div>
    </ToastContext.Provider>);
}
function useToast() {
    const ctx = (0, react_1.useContext)(ToastContext);
    if (!ctx)
        throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
