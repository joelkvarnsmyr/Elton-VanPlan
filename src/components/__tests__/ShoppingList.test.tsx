import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingList } from '../ShoppingList';
import { ShoppingItemStatus } from '@/types/types';

describe('ShoppingList', () => {
    const mockVehicleData = {
        make: 'Volkswagen',
        model: 'LT',
        year: 1976
    } as any;

    const mockTasks = [
        {
            id: 'task1',
            title: 'Test Task',
            phase: 'Fas 1: Akut',
            description: 'Test',
            status: 'Att göra',
            priority: 'Hög'
        }
    ] as any[];

    const mockItems = [
        {
            id: '1',
            name: 'Motorolja',
            estimatedCost: 500,
            category: 'Reservdelar' as const,
            quantity: '1 st',
            checked: false,
            status: ShoppingItemStatus.RESEARCH,
            linkedTaskId: 'task1'
        },
        {
            id: '2',
            name: 'Bromsbelägg',
            estimatedCost: 800,
            category: 'Reservdelar' as const,
            quantity: '1 set',
            checked: true,
            status: ShoppingItemStatus.BOUGHT
        }
    ];

    const mockProps = {
        items: mockItems,
        tasks: mockTasks,
        vehicleData: mockVehicleData,
        projectId: 'test-project',
        onToggle: vi.fn(),
        onAdd: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
        onUploadReceipt: vi.fn()
    };

    it('renders shopping list with items', () => {
        render(<ShoppingList {...mockProps} />);

        expect(screen.getByText('Motorolja')).toBeTruthy();
        expect(screen.getByText('Bromsbelägg')).toBeTruthy();
    });

    it('displays correct item counts', () => {
        render(<ShoppingList {...mockProps} />);

        // 1 out of 2 items checked
        // 1 out of 2 items checked
        const summary = screen.getByText(/klara/i);
        expect(summary.textContent).toMatch(/1.*2/);
    });

    it('shows estimated cost total', () => {
        render(<ShoppingList {...mockProps} />);

        // Total: 500 + 800 = 1300
        expect(screen.getByText(/1.*300/)).toBeTruthy();
    });

    it('filters by status', async () => {
        render(<ShoppingList {...mockProps} />);

        // Find and click status filter
        const statusFilter = screen.getByLabelText(/status/i);
        fireEvent.change(statusFilter, { target: { value: ShoppingItemStatus.RESEARCH } });

        // Should show only RESEARCH items
        expect(screen.getByText('Motorolja')).toBeTruthy();
        expect(screen.queryByText('Bromsbelägg')).toBeNull();
    });

    it('filters by phase', async () => {
        render(<ShoppingList {...mockProps} />);

        // Find and click phase filter
        const phaseFilter = screen.getByLabelText(/fas/i);
        fireEvent.change(phaseFilter, { target: { value: 'Fas 1: Akut' } });

        // Should show only items linked to Fas 1 tasks
        expect(screen.getByText('Motorolja')).toBeTruthy();
        expect(screen.queryByText('Bromsbelägg')).toBeNull();
    });

    it('adds new item', () => {
        render(<ShoppingList {...mockProps} />);

        const input = screen.getByPlaceholderText(/vad behöver du/i);
        const addButton = screen.getByLabelText(/lägg till/i);

        fireEvent.change(input, { target: { value: 'Ny produkt' } });
        fireEvent.click(addButton);

        expect(mockProps.onAdd).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Ny produkt',
                status: ShoppingItemStatus.RESEARCH
            })
        );
    });

    it('toggles item checked status', () => {
        render(<ShoppingList {...mockProps} />);

        const checkboxes = screen.getAllByRole('button', { name: /markera/i });
        fireEvent.click(checkboxes[0]);

        expect(mockProps.onToggle).toHaveBeenCalledWith('1');
    });

    it('switches between view modes', () => {
        render(<ShoppingList {...mockProps} />);

        const taskViewButton = screen.getByTitle(/visa per task/i);
        fireEvent.click(taskViewButton);

        // Should group by task
        expect(screen.getByText('Test Task')).toBeTruthy();
    });
});
