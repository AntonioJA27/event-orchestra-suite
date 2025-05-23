import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { InventoryItem, InventoryItemFormData } from '@/hooks/useInventory';

const inventoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  current_stock: z.coerce.number().int().min(0, "Current stock must be 0 or greater"),
  minimum_stock: z.coerce.number().int().min(0, "Minimum stock must be 0 or greater"),
  maximum_stock: z.coerce.number().int().min(1, "Maximum stock must be greater than 0"),
  unit_cost: z.coerce.number().min(0, "Unit cost must be 0 or greater").optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
}).refine((data) => data.maximum_stock >= data.minimum_stock, {
  message: "Maximum stock must be greater than or equal to minimum stock",
  path: ["maximum_stock"],
}).refine((data) => data.current_stock <= data.maximum_stock, {
  message: "Current stock cannot exceed maximum stock",
  path: ["current_stock"],
});

type InventoryFormType = z.infer<typeof inventoryFormSchema>;

const CATEGORIES = [
  'Mantelería',
  'Cristalería',
  'Vajilla',
  'Cubertería',
  'Decoración',
  'Mobiliario',
  'Audiovisual',
  'Iluminación',
  'Cocina',
  'Servicio',
];

const LOCATIONS = [
  'Almacén Principal',
  'Almacén Secundario',
  'Cocina',
  'Salón Principal',
  'Oficina',
  'Bodega Externa',
];

interface InventoryFormProps {
  initialData?: InventoryItem;
  onSubmit: (data: InventoryItemFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function InventoryForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: InventoryFormProps) {
  const form = useForm<InventoryFormType>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || '',
      current_stock: initialData?.current_stock || 0,
      minimum_stock: initialData?.minimum_stock || 0,
      maximum_stock: initialData?.maximum_stock || 100,
      unit_cost: initialData?.unit_cost || undefined,
      location: initialData?.location || '',
      supplier: initialData?.supplier || '',
    },
  });

  const handleSubmit = async (values: InventoryFormType) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., White Table Cloth" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="current_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimum_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maximum_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Cost (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOCATIONS.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., ABC Supplies" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            {initialData ? 'Update' : 'Create'} Item
          </Button>
        </div>
      </form>
    </Form>
  );
}
