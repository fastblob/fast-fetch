export type Logger = {
    info: (message: string) => void;
    error: (message: string) => void;
    debug: (message: string) => void;
    warning: (message: string) => void;
}
