import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import SettingsPage from '@/app/settings/page';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: jest.fn(),
}));

// Mock useSettings hook
jest.mock('@/hooks/useSettings', () => ({
  useSettings: jest.fn(),
}));

const mockSettings = {
  system_name: 'Test System',
  system_description: 'Test Description',
  admin_email: 'admin@test.com',
  timezone: 'UTC',
  date_format: 'DD/MM/YYYY',
  language: 'en',
  theme: 'light',
  email_notifications: true,
  task_reminders: true,
  system_alerts: true,
  digest_frequency: 'daily',
  password_min_length: 8,
  session_timeout: 30,
  require_2fa: false,
  max_login_attempts: 5,
};

describe('Settings Page', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock useSettings implementation
    (useSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      loading: false,
      error: null,
      updateSettings: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  it('renders all settings sections', () => {
    render(<SettingsPage />);

    // Check for section headings
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
  });

  it('displays current settings values', () => {
    render(<SettingsPage />);

    // Check system settings
    expect(screen.getByDisplayValue(mockSettings.system_name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockSettings.system_description)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockSettings.admin_email)).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    (useSettings as jest.Mock).mockReturnValue({
      settings: {},
      loading: true,
      error: null,
    });

    render(<SettingsPage />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error state', async () => {
    (useSettings as jest.Mock).mockReturnValue({
      settings: {},
      loading: false,
      error: 'Failed to load settings',
    });

    render(<SettingsPage />);
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('Failed to load settings');
  });

  it('handles system settings update', async () => {
    const updateSettings = jest.fn().mockResolvedValue({ success: true });
    (useSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      loading: false,
      error: null,
      updateSettings,
    });

    render(<SettingsPage />);

    // Update system name
    const systemNameInput = screen.getByLabelText('System Name');
    fireEvent.change(systemNameInput, { target: { value: 'New System Name' } });

    // Click save button
    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Check if updateSettings was called with correct values
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        system_name: 'New System Name',
      })
    );

    // Check for success toast
    expect(toast.success).toHaveBeenCalled();
  });

  it('handles settings update failure', async () => {
    const updateSettings = jest.fn().mockRejectedValue(new Error('Update failed'));
    (useSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      loading: false,
      error: null,
      updateSettings,
    });

    render(<SettingsPage />);

    // Update system name
    const systemNameInput = screen.getByLabelText('System Name');
    fireEvent.change(systemNameInput, { target: { value: 'New System Name' } });

    // Click save button
    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Check for error toast
    expect(toast.error).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const updateSettings = jest.fn().mockResolvedValue({ success: true });
    (useSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      loading: false,
      error: null,
      updateSettings,
    });

    render(<SettingsPage />);

    // Clear system name
    const systemNameInput = screen.getByLabelText('System Name');
    fireEvent.change(systemNameInput, { target: { value: '' } });

    // Click save button
    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Check for validation error
    expect(screen.getByText('System name is required')).toBeInTheDocument();
    // Verify that updateSettings was not called
    expect(updateSettings).not.toHaveBeenCalled();
  });

  it('updates theme setting', async () => {
    const updateSettings = jest.fn().mockResolvedValue({ success: true });
    (useSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      loading: false,
      error: null,
      updateSettings,
    });

    render(<SettingsPage />);

    // Change theme
    const themeSelect = screen.getByLabelText('Theme');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    // Click save button
    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Check if updateSettings was called with correct values
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'dark',
      })
    );
  });

  it('updates security settings', async () => {
    const updateSettings = jest.fn().mockResolvedValue({ success: true });
    (useSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      loading: false,
      error: null,
      updateSettings,
    });

    render(<SettingsPage />);

    // Update password min length
    const minLengthInput = screen.getByLabelText('Minimum Password Length');
    fireEvent.change(minLengthInput, { target: { value: '10' } });

    // Update session timeout
    const timeoutInput = screen.getByLabelText('Session Timeout (minutes)');
    fireEvent.change(timeoutInput, { target: { value: '60' } });

    // Click save button
    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Check if updateSettings was called with correct values
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        password_min_length: 10,
        session_timeout: 60,
      })
    );
  });
});
