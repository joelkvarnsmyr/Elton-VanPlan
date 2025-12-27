import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus, Priority, TaskType, DifficultyLevel } from '@/types/types';
import { TaskCard, TaskCardProps } from './TaskCard';

export const SortableTaskCard: React.FC<TaskCardProps> = (props) => {
    // Guard against missing task or task.id (can happen with malformed AI-created tasks)
    const taskId = props.task?.id || `temp-${Date.now()}`;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: taskId });

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <TaskCard
                {...props}
                dragAttributes={attributes}
                dragListeners={listeners}
                isDragging={isDragging}
            />
        </div>
    );
};
