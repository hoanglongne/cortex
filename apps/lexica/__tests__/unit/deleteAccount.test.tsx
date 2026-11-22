import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const signOut = vi.fn(async () => {});
let user: { email: string } | null = { email: 'a@b.co' };
vi.mock('../../app/context/AuthContext', () => ({ useAuth: () => ({ user, signOut }) }));
const deleteMyAccount = vi.fn();
vi.mock('../../app/lib/auth', () => ({ deleteMyAccount: () => deleteMyAccount() }));
const resetProgress = vi.fn();
vi.mock('../../app/store/lexicaStore', () => ({ useLexicaStore: (sel: (s: { resetProgress: () => void }) => unknown) => sel({ resetProgress }) }));

import DeleteAccount from '../../app/components/DeleteAccount';

const confirm = () => {
    fireEvent.click(screen.getByText('Xóa tài khoản'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'xóa' } });
};

describe('DeleteAccount', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        user = { email: 'a@b.co' };
    });

    it('shows nothing when signed out', () => {
        user = null;
        const { container } = render(<DeleteAccount />);
        expect(container.firstChild).toBeNull();
    });

    it('needs the confirmation word before it deletes', () => {
        render(<DeleteAccount />);
        fireEvent.click(screen.getByText('Xóa tài khoản'));
        expect((screen.getByText('Xóa vĩnh viễn') as HTMLButtonElement).disabled).toBe(true);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nope' } });
        expect((screen.getByText('Xóa vĩnh viễn') as HTMLButtonElement).disabled).toBe(true);
    });

    it('deletes, clears this device and signs out', async () => {
        deleteMyAccount.mockResolvedValue(true);
        render(<DeleteAccount />);
        confirm();
        fireEvent.click(screen.getByText('Xóa vĩnh viễn'));
        await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/Đã xóa/));
        expect(resetProgress).toHaveBeenCalledOnce();
        expect(signOut).toHaveBeenCalledOnce();
    });

    it('keeps everything when the server refuses', async () => {
        deleteMyAccount.mockResolvedValue(false);
        render(<DeleteAccount />);
        confirm();
        fireEvent.click(screen.getByText('Xóa vĩnh viễn'));
        await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/Chưa xóa được/));
        expect(resetProgress).not.toHaveBeenCalled();
        expect(signOut).not.toHaveBeenCalled();
    });
});
