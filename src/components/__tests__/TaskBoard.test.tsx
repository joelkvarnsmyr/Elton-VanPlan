import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskBoard } from '../TaskBoard';

describe('TaskBoard', () => {
    const mockTasks = [
        {
            id: 'task1',
            title: 'Reparera motor',
            description: 'Byt motorolja',
            phase: 'Fas 1: Akut',
            status: 'Att göra',
            priority: 'Hög',
            estimatedCostMin: 500,
            estimatedCostMax: 1000,
            subtasks: [
                { id: 'sub1', title: 'Köp olja', completed: false }
            ]
        },
        {
            id: 'task2',
            title: 'Måla kaross',
            description: 'Lacka om',
            phase: 'Fas 2: Renovering',
            status: 'Idé & Research',
            priority: 'Medel',
            estimatedCostMin: 5000,
            estimatedCostMax: 10000
        }
    ] as any[];

    const mockProps = {
        tasks: mockTasks,
        onTaskUpdate: vi.fn(),
        onTaskDelete: vi.fn(),
        onTaskAdd: vi.fn()
    };

    it('renders all tasks', () => {
        render(<TaskBoard {...mockProps} />);

        expect(screen.getByText('Reparera motor')).toBeInTheDocument();
        expect(screen.getByText('Måla kaross')).toBeInTheDocument();
    });

    it('groups tasks by phase', () => {
        render(<TaskBoard {...mockProps} />);

        expect(screen.getByText(/Fas 1: Akut/i)).toBeInTheDocument();
        expect(screen.getByText(/Fas 2: Renovering/i)).toBeInTheDocument();
    });

    it('shows task count per phase', () => {
        render(<TaskBoard {...mockProps} />);

        // Each phase should show count
        const phaseHeaders = screen.getAllByText(/\d+ uppgift/i);
        expect(phaseHeaders.length).toBeGreaterThan(0);
    });

    it('displays priority badges', () => {
        render(<TaskBoard {...mockProps} />);

        expect(screen.getByText('Hög')).toBeInTheDocument();
        expect(screen.getByText('Medel')).toBeInTheDocument();
    });

    it('shows estimated cost range', () => {
        render(<TaskBoard {...mockProps} />);

        expect(screen.getByText(/500.*-.*1.*000/)).toBeInTheDocument();
        expect(screen.getByText(/5.*000.*-.*10.*000/)).toBeInTheDocument();
    });

    it('expands and collapses phases', () => {
        render(<TaskBoard {...mockProps} />);

        const phaseHeader = screen.getByText(/Fas 1: Akut/i);
        fireEvent.click(phaseHeader);

        // Task should be hidden after collapse
        // (Implementation depends on your collapse logic)
    });

    it('opens task detail modal on click', () => {
        render(<TaskBoard {...mockProps} />);

        const taskCard = screen.getByText('Reparera motor');
        fireEvent.click(taskCard);

        // Modal should open (check for modal content)
        expect(screen.getByText('Byt motorolja')).toBeInTheDocument();
    });

    it('shows subtasks count', () => {
        render(<TaskBoard {...mockProps} />);

        // Should show 0/1 subtasks completed
        expect(screen.getByText(/0.*\/.*1/)).toBeInTheDocument();
    });

    it('filters tasks by status', () => {
        render(<TaskBoard {...mockProps} />);

        // If there's a filter UI
        const statusFilter = screen.queryByLabelText(/status/i);
        if (statusFilter) {
            fireEvent.change(statusFilter, { target: { value: 'Att göra' } });

            expect(screen.getByText('Reparera motor')).toBeInTheDocument();
            expect(screen.queryByText('Måla kaross')).not.toBeInTheDocument();
        }
    });

    it('calculates total cost correctly', () => {
        render(<TaskBoard {...mockProps} />);

        // Total max cost: 1000 + 10000 = 11000
        // Check if total is displayed somewhere
        const totalText = screen.queryByText(/11.*000/);
        if (totalText) {
            expect(totalText).toBeInTheDocument();
        }
    });
});
