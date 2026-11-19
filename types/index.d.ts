export type Worker = {
    id: string;
    type: string;
    description: string;
};
export type Slot = {
    s: 'think' | 'read' | 'web' | 'edit' | 'run' | 'dispatch' | 'wait' | 'error' | 'done' | 'compact' | 'tool' | 'gone';
    at: number;
    x0?: number;
};
declare module 'claude-code' {
    interface PluginState {
        'crew-band': {
            workers: Worker[];
            slots: Record<string, Slot>;
            demo: boolean;
            off: boolean;
        };
    }
}
