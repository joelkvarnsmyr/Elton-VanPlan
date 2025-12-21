export interface Link {
    id: string;
    title: string;
    url: string;
}

export interface Comment {
    id: string;
    text: string;
    createdAt: string;
    author: 'user' | 'ai';
}

export interface Attachment {
    id: string;
    name: string;
    type: 'image' | 'file';
    data: string;
}

export interface ToolCall {
    name: string;
    args: any;
    id: string;
}

// Export/Import Format
export interface ProjectExportMeta {
    project: string;
    exported: string; // ISO date
    version: string;
}
