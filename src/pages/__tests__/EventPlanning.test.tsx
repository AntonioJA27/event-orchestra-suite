import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom'; // Needed if your component uses Link or other router features
import { vi } from 'vitest';

import EventPlanningPage from '../EventPlanning'; // Adjust path as needed
import { Toaster } from '@/components/ui/toaster'; // Required by the page

// Mock data for events
const MOCK_EVENTS = [
  {
    id: 1,
    name: 'Summer Festival',
    client_id: 1,
    event_type: 'Festival',
    date: '2024-08-15',
    start_time: '2024-08-15T10:00:00Z',
    end_time: '2024-08-15T22:00:00Z',
    venue: 'Central Park',
    guests_count: 500,
    budget: 25000,
    status: 'Planned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Tech Conference 2024',
    client_id: 2,
    event_type: 'Conference',
    date: '2024-09-20',
    start_time: '2024-09-20T09:00:00Z',
    end_time: '2024-09-20T17:00:00Z',
    venue: 'Convention Center',
    guests_count: 1200,
    budget: 75000,
    status: 'Planned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock the global fetch API
global.fetch = vi.fn();

const mockFetch = (data: any, ok = true, status = 200) => {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  } as Response);
};

// Wrapper component to provide context (like Router and Toaster)
const AllTheProviders: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster /> {/* EventPlanningPage uses useToast, which needs Toaster */}
    </BrowserRouter>
  );
};

describe('EventPlanningPage', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Reset mocks before each test
  });

  test('renders event planning page and fetches events', async () => {
    mockFetch(MOCK_EVENTS); // Mock successful fetch for events

    render(<EventPlanningPage />, { wrapper: AllTheProviders });

    // Check for the "Create New Event" button
    expect(screen.getByRole('button', { name: /create new event/i })).toBeInTheDocument();

    // Check for loading state initially (optional, depends on implementation)
    // expect(screen.getByText(/loading events.../i)).toBeInTheDocument();

    // Wait for events to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText(MOCK_EVENTS[0].name)).toBeInTheDocument();
      expect(screen.getByText(MOCK_EVENTS[1].name)).toBeInTheDocument();
    });

    // Verify fetch was called for events
    expect(fetch).toHaveBeenCalledWith('/api/v1/events');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('displays error message if fetching events fails', async () => {
    const errorMessage = "Network Error";
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(errorMessage));

    render(<EventPlanningPage />, { wrapper: AllTheProviders });
    
    // Wait for the error message to be displayed
    // The page shows "Error: {error}" when there's an error and no events.
    // It also shows a toast. We'll check for the inline error message.
    await waitFor(() => {
        expect(screen.getByText(new RegExp(`error: ${errorMessage}`, "i"))).toBeInTheDocument();
    });

    // Check that a toast was also likely displayed (by checking if useToast was called, harder to test directly without more setup)
    // For now, the inline error message is a good indicator.
  });
  
  test('displays "No events found." when API returns empty list', async () => {
    mockFetch([]); // Mock fetch to return an empty list

    render(<EventPlanningPage />, { wrapper: AllTheProviders });

    // Wait for the "No events found" message
    await waitFor(() => {
      expect(screen.getByText(/no events found./i)).toBeInTheDocument();
    });
  });


  test('opens create event dialog when "Create New Event" button is clicked', async () => {
    mockFetch(MOCK_EVENTS); // Mock initial event fetch
    const user = userEvent.setup();

    render(<EventPlanningPage />, { wrapper: AllTheProviders });

    // Wait for page to load events (to ensure button is interactive)
    await waitFor(() => {
      expect(screen.getByText(MOCK_EVENTS[0].name)).toBeInTheDocument();
    });
    
    const createButton = screen.getByRole('button', { name: /create new event/i });
    await user.click(createButton);

    // Check if the dialog title is visible
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /create new event/i, level: 2 })).toBeInTheDocument(); // DialogTitle renders as h2
    });

    // Check for a form field within the dialog
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
  });
  
  // Basic test for form submission (can be expanded)
  test('allows creating a new event via the dialog', async () => {
    mockFetch(MOCK_EVENTS); // Initial fetch
    const user = userEvent.setup();
  
    render(<EventPlanningPage />, { wrapper: AllTheProviders });
    await waitFor(() => expect(screen.getByText(MOCK_EVENTS[0].name)).toBeInTheDocument());
  
    const createButton = screen.getByRole('button', { name: /create new event/i });
    await user.click(createButton);
  
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  
    // Mock successful POST response for creating event
    const newEventData = {
      id: 3,
      name: 'New Year Party',
      client_id: 1,
      event_type: 'Party',
      date: '2025-01-01',
      start_time: '2025-01-01T20:00:00Z',
      end_time: '2025-01-02T02:00:00Z',
      venue: 'Hotel Ballroom',
      guests_count: 150,
      budget: 10000,
      status: 'Planned',
      notes: 'DJ and Catering needed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Mock fetch for POST, then for the refresh GET
    mockFetch(newEventData, true, 200); // For POST
    mockFetch([...MOCK_EVENTS, newEventData], true, 200); // For GET after POST
  
    // Fill the form
    await user.type(screen.getByLabelText(/event name/i), newEventData.name);
    // Select client (assuming MOCK_CLIENTS[0] is Client Alpha with ID 1)
    // The client select is a bit tricky with shadcn, need to click trigger then option
    await user.click(screen.getByRole('combobox', {name: /client/i}));
    await user.click(screen.getByText(/Client Alpha/i)); // Mock client name from EventPlanningPage

    await user.type(screen.getByLabelText(/event type/i), newEventData.event_type);
    
    // Date selection
    await user.click(screen.getByRole('button', { name: /pick a date/i }));
    // This is a simplified way, real date picking might need more specific selectors
    // Assuming the calendar opens and we click the 1st of a month.
    // For a real test, you might need to target specific dates or use a more robust date picker interaction.
    // For now, we'll assume it selects a date. The component sets a default date that might pass validation.
    // The date field in the form is `date: z.date(...)`, so it expects a Date object.
    // The Calendar component calls onChange with a Date object.
    // Let's find a clickable date, e.g., the 1st of the currently displayed month
    const popoverContent = screen.getByRole('application', { name: /calendar/i }); // Calendar is role 'application'
    await user.click(within(popoverContent).getByRole('button', { name: /1/i })); // Click on day "1"

    await user.type(screen.getByLabelText(/start time/i), '20:00');
    await user.type(screen.getByLabelText(/end time/i), '02:00'); // For next day, this logic might be tricky in form
    await user.type(screen.getByLabelText(/venue/i), newEventData.venue);
    await user.clear(screen.getByLabelText(/number of guests/i)); // Clear default 0
    await user.type(screen.getByLabelText(/number of guests/i), newEventData.guests_count.toString());
    await user.clear(screen.getByLabelText(/budget/i)); // Clear default 1000
    await user.type(screen.getByLabelText(/budget/i), newEventData.budget.toString());
    await user.type(screen.getByLabelText(/notes/i), newEventData.notes!);
  
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);
  
    // Wait for the dialog to close and the new event to appear
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(newEventData.name)).toBeInTheDocument();
    });
  
    // Verify fetch was called for POST
    expect(fetch).toHaveBeenCalledWith('/api/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining(newEventData.name), // Check if some key data is in payload
    });
    expect(fetch).toHaveBeenCalledTimes(3); // Initial GET, POST, Refresh GET
  });

});

// Helper to use Testing Library queries within a specific element
// (useful for popovers, dialogs, etc.)
import { queries, getQueriesForElement } from '@testing-library/dom';
function within(element: HTMLElement) {
  return getQueriesForElement(element, queries);
}
