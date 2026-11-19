export type State = 'think' | 'read' | 'web' | 'edit' | 'run' | 'dispatch' | 'wait' | 'error' | 'done' | 'compact' | 'tool';
export const LOOKS: Record<State, {
    zh: string;
    how: string;
}> = {
    think: { zh: '在想', how: '巫师帽挥魔杖、冒星星（变魔法）' },
    read: { zh: '在读档', how: '侦探帽弯腰拿放大镜找' },
    web: { zh: '在上网查', how: '望远镜扫一圈' },
    edit: { zh: '在改档', how: '对着笔电打字' },
    run: { zh: '在跑命令', how: '厨师帽翻锅、冒火花' },
    dispatch: { zh: '在派小帮手', how: '贝雷帽看夹板打勾、指派' },
    wait: { zh: '等你回', how: '跑到最前面指着你' },
    error: { zh: '出错了', how: '被骂缩一下、冒汗 · 弹一句话' },
    done: { zh: '做完了', how: '戴耳机听歌、冒音符（听音乐）· 弹一句话' },
    compact: { zh: '在整理记忆', how: '书盖头上睡、冒 z' },
    tool: { zh: '在用工具', how: '摊手' },
};
export function stateOfTool(tool: string): State {
    if (/^(Read|Grep|Glob|LS|NotebookRead)$/.test(tool))
        return 'read';
    if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool))
        return 'edit';
    if (/^(Bash|PowerShell|BashOutput|KillShell|Monitor)$/.test(tool))
        return 'run';
    if (/^(WebSearch|WebFetch)$/.test(tool) || /browser|chrome|playwright|fetch/i.test(tool))
        return 'web';
    if (/^(Agent|Task|Workflow)$/.test(tool))
        return 'dispatch';
    if (/^(AskUserQuestion|ExitPlanMode)$/.test(tool))
        return 'wait';
    return 'tool';
}
export const LINGER: Partial<Record<State, number>> = { done: 8000, error: 4000 };
