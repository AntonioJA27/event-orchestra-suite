import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger, // Not needed as we trigger programmatically
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define the Event interface based on backend/schemas.py
interface Event {
  id: number;
  name: string;
  client_id: number;
  event_type: string;
  date: string; // ISO 8601 string
  start_time: string; // ISO 8601 string
  end_time: string; // ISO 8601 string
  venue: string;
  guests_count: number;
  budget: number;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Zod schema for form validation (matches EventCreate schema)
const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  client_id: z.coerce.number().int().positive("Client ID must be a positive integer"),
  event_type: z.string().min(1, "Event type is required"),
  date: z.date({ required_error: "Event date is required." }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
  venue: z.string().min(1, "Venue is required"),
  guests_count: z.coerce.number().int().nonnegative("Guests count cannot be negative"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  notes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

// Mock client data - replace with actual client fetching if needed
const MOCK_CLIENTS = [
    { id: 1, name: "Client Alpha" },
    { id: 2, name: "Client Beta" },
    { id: 3, name: "Client Gamma" },
];

const EventPlanningPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<Event | null>(null);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const API_BASE_URL = '/api/v1'; // Or http://localhost:8000/api/v1 if needed

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      client_id: undefined, // Or a default client_id
      event_type: "",
      // date: new Date(), // Set a default, or leave undefined
      start_time: "09:00",
      end_time: "17:00",
      venue: "",
      guests_count: 0,
      budget: 1000,
      notes: "",
    },
  });

  const transformEventDataForForm = (event: Event): EventFormData => ({
    name: event.name,
    client_id: event.client_id,
    event_type: event.event_type,
    date: new Date(event.date), // Assumes event.date is a valid date string for constructor
    start_time: format(new Date(event.start_time), "HH:mm"),
    end_time: format(new Date(event.end_time), "HH:mm"),
    venue: event.venue,
    guests_count: event.guests_count,
    budget: event.budget,
    notes: event.notes || "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Failed to fetch events: ${response.statusText}` }));
        throw new Error(errorData.detail || `Failed to fetch events: ${response.statusText}`);
      }
      const data = await response.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error fetching events",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEventSubmit = async (values: EventFormData) => {
    try {
      // Format date and combine with time for ISO 8601 strings
      const eventDate = values.date; // This is already a Date object from react-hook-form
      
      const [startHour, startMinute] = values.start_time.split(':').map(Number);
      const startDate = new Date(eventDate);
      startDate.setHours(startHour, startMinute, 0, 0);

      const [endHour, endMinute] = values.end_time.split(':').map(Number);
      const endDate = new Date(eventDate); // Assume event is on the same day
      endDate.setHours(endHour, endMinute, 0, 0);

      // Adjust for timezone to ensure proper ISO string
      const timezoneOffset = startDate.getTimezoneOffset() * 60000; //offset in milliseconds
      const isoStartDate = new Date(startDate.getTime() - timezoneOffset).toISOString();
      const isoEndDate = new Date(endDate.getTime() - timezoneOffset).toISOString();
      const isoDate = new Date(eventDate.getTime() - timezoneOffset).toISOString().split('T')[0];


      const payload = {
        ...values,
        date: isoDate,
        start_time: isoStartDate,
        end_time: isoEndDate,
      };

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Error: ${response.statusText}` }));
        throw new Error(errorData.detail || `Server error: ${response.statusText}`);
      }

      toast({
        title: "Event Created",
        description: `Event "${values.name}" has been successfully created.`,
      });
      setIsCreateDialogOpen(false);
      fetchEvents(); // Refresh the list
      form.reset(); // Reset form fields
    } catch (err) {
        const errorMessage = (err as Error).message;
        console.error("Create event error:", err);
        toast({
            variant: "destructive",
            title: "Failed to create event",
            description: errorMessage,
        });
    }
  };


  if (isLoading && !events.length) { // Show loading only on initial load
    return <div className="container mx-auto py-10">Loading events...</div>;
  }

  if (error && !events.length) { // Show error only if no events are displayed
    return <div className="container mx-auto py-10">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <ViewEventDialog event={selectedEventDetails} isOpen={isViewDetailsDialogOpen} onClose={() => setIsViewDetailsDialogOpen(false)} />
      
      {/* Delete Confirmation Dialog */}
      {deletingEvent && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event
                "{deletingEvent.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { 
                setIsDeleteDialogOpen(false); 
                setDeletingEvent(null);
              }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Management</h1>
        {/* Combined Dialog for Create and Edit */}
        <Dialog
          open={isCreateDialogOpen || isEditDialogOpen} 
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingEvent(null);
              form.reset({ // Reset to default create values or specific edit values if needed
                name: "", client_id: undefined, event_type: "",
                start_time: "09:00", end_time: "17:00", venue: "",
                guests_count: 0, budget: 1000, notes: "", date: undefined,
              });
            } else {
              // If isEditDialogOpen is true, form is already populated by handleEditClick
              // If isCreateDialogOpen is true, form is populated by the Create button's onClick
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {
                setEditingEvent(null); // Ensure not in edit mode
                form.reset({ // Reset to default create values
                    name: "", client_id: undefined, event_type: "",
                    start_time: "09:00", end_time: "17:00", venue: "",
                    guests_count: 0, budget: 1000, notes: "", date: undefined,
                });
                setIsCreateDialogOpen(true);
            }}>Create New Event</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update the details of your event." : "Fill in the details below to create a new event."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingEvent ? handleUpdateEventSubmit : handleCreateEventSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Gala" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_CLIENTS.map(client => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} (ID: {client.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Conference, Wedding, Party" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0,0,0,0)) // Disable past dates
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Start Time (HH:MM)</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>End Time (HH:MM)</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="Grand Ballroom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="guests_count"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Number of Guests</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Budget ($)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="5000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific requirements or details..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setEditingEvent(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting 
                      ? (editingEvent ? "Saving..." : "Creating...") 
                      : (editingEvent ? "Save Changes" : "Create Event")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="text-center py-4">Refreshing events...</div>}
      <Table>
        <TableCaption>A list of your planned events.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Event Name</TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length > 0 ? (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{event.client_id}</TableCell>
                <TableCell>{event.venue}</TableCell>
                <TableCell>{format(new Date(event.date), "PPP")}</TableCell>
                <TableCell>{event.status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleViewDetailsClick(event.id)}>View Details</Button>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(event)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(event)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No events found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// ViewEventDialog Component
interface ViewEventDialogProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewEventDialog: React.FC<ViewEventDialogProps> = ({ event, isOpen, onClose }) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event Details: {event.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          <p><strong>Client ID:</strong> {event.client_id}</p>
          <p><strong>Event Type:</strong> {event.event_type}</p>
          <p><strong>Date:</strong> {format(new Date(event.date), "PPP")}</p>
          <p><strong>Start Time:</strong> {format(new Date(event.start_time), "p")}</p>
          <p><strong>End Time:</strong> {format(new Date(event.end_time), "p")}</p>
          <p><strong>Venue:</strong> {event.venue}</p>
          <p><strong>Guests Count:</strong> {event.guests_count}</p>
          <p><strong>Budget:</strong> ${event.budget.toLocaleString()}</p>
          {event.notes && <p><strong>Notes:</strong> {event.notes}</p>}
          <p><strong>Status:</strong> {event.status}</p>
          <p><strong>Created At:</strong> {format(new Date(event.created_at), "Pp")}</p>
          <p><strong>Updated At:</strong> {format(new Date(event.updated_at), "Pp")}</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventPlanningPage;
