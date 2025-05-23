import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Plus, Search, Filter, Users, Edit, Trash2, MoreVertical, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { InventoryForm } from '@/components/forms/InventoryForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const restockFormSchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
});

const InventoryManagement = () => {
  const { inventory, loading, createInventoryItem, updateInventoryItem, restockItem } = useInventory();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: InventoryItem | null }>({
    open: false,
    item: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const restockForm = useForm({
    resolver: zodResolver(restockFormSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const suppliers = [
    { name: 'Textiles Premium', category: 'Mantelería', rating: 4.8, lastDelivery: '2024-05-15', status: 'Activo' },
    { name: 'Cristales y Más', category: 'Cristalería', rating: 4.5, lastDelivery: '2024-05-10', status: 'Activo' },
    { name: 'Mobiliario Eventos', category: 'Mobiliario', rating: 4.2, lastDelivery: '2024-05-08', status: 'Pendiente' },
    { name: 'Decoraciones Elegantes', category: 'Decoración', rating: 4.9, lastDelivery: '2024-05-12', status: 'Activo' }
  ];

  const getStatusColor = (item: InventoryItem) => {
    if (item.current_stock === 0) return 'destructive';
    if (item.current_stock <= item.minimum_stock) return 'secondary';
    return 'default';
  };

  const getStatusLabel = (item: InventoryItem) => {
    if (item.current_stock === 0) return 'Sin Stock';
    if (item.current_stock <= item.minimum_stock) return 'Crítico';
    return 'Normal';
  };

  const getStockPercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100);
  };

  const handleCreateItem = async (data: any) => {
    await createInventoryItem(data);
    setIsCreateDialogOpen(false);
  };

  const handleEditItem = async (data: any) => {
    if (editingItem) {
      await updateInventoryItem(editingItem.id, data);
      setEditingItem(null);
    }
  };

  const handleRestockItem = async (data: { quantity: number }) => {
    if (restockingItem) {
      await restockItem(restockingItem.id, data.quantity);
      setRestockingItem(null);
      restockForm.reset();
    }
  };

  const handleDeleteItem = async () => {
    if (deleteConfirm.item) {
      // Note: Delete functionality needs to be implemented in backend
      console.log('Delete inventory item:', deleteConfirm.item.id);
      setDeleteConfirm({ open: false, item: null });
    }
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'critical' && item.current_stock <= item.minimum_stock) ||
                         (statusFilter === 'normal' && item.current_stock > item.minimum_stock);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const criticalItems = inventory.filter(item => item.current_stock <= item.minimum_stock);
  const outOfStockItems = inventory.filter(item => item.current_stock === 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.current_stock * (item.unit_cost || 0)), 0);

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  const inventoryColumns = [
    {
      key: 'name',
      header: 'Item',
      render: (item: InventoryItem) => (
        <div>
          <div className="font-semibold">{item.name}</div>
          <div className="text-sm text-slate-600">{item.category}</div>
          {item.location && (
            <div className="text-xs text-slate-500">{item.location}</div>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: InventoryItem) => (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current: {item.current_stock}</span>
            <span>Max: {item.maximum_stock}</span>
          </div>
          <Progress 
            value={getStockPercentage(item.current_stock, item.maximum_stock)} 
            className="h-2"
          />
          <div className="text-xs text-slate-600">
            Min: {item.minimum_stock}
          </div>
        </div>
      ),
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (item: InventoryItem) => (
        <div className="text-sm">
          {item.unit_cost ? (
            <>
              <div>${item.unit_cost.toFixed(2)} / unit</div>
              <div className="text-slate-600">
                Total: ${(item.current_stock * item.unit_cost).toFixed(2)}
              </div>
            </>
          ) : (
            <span className="text-slate-500">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: InventoryItem) => (
        <Badge variant={getStatusColor(item)}>
          {getStatusLabel(item)}
        </Badge>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (item: InventoryItem) => (
        <div className="text-sm">
          {item.supplier || <span className="text-slate-500">-</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: InventoryItem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingItem(item)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRestockingItem(item)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restock
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteConfirm({ open: true, item })}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Inventario</h1>
          <p className="text-slate-600 mt-1">Control de inventario y gestión de proveedores en tiempo real</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex items-center space-x-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Item</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Items Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Sin Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{outOfStockItems.length}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Items</p>
                <p className="text-2xl font-bold text-slate-900">{inventory.length}</p>
              </div>
              <Package className="w-8 h-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Buscar productos..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-amber-600" />
              <span>Inventario Actual</span>
              <Badge variant="outline">{filteredInventory.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredInventory}
              columns={inventoryColumns}
              loading={loading}
              emptyMessage="No inventory items found"
            />
          </CardContent>
        </Card>

        {/* Suppliers Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Proveedores</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suppliers.map((supplier, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-slate-900">{supplier.name}</h4>
                      <p className="text-sm text-slate-600">{supplier.category}</p>
                    </div>
                    <Badge variant={supplier.status === 'Activo' ? 'default' : 'secondary'}>
                      {supplier.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Calificación:</span>
                      <span className="font-medium text-amber-600">⭐ {supplier.rating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Última entrega:</span>
                      <span>{supplier.lastDelivery}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              Ver Todos los Proveedores
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Enter the details for the new inventory item.
            </DialogDescription>
          </DialogHeader>
          <InventoryForm
            onSubmit={handleCreateItem}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details for {editingItem?.name}.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <InventoryForm
              initialData={editingItem}
              onSubmit={handleEditItem}
              onCancel={() => setEditingItem(null)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={!!restockingItem} onOpenChange={(open) => !open && setRestockingItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add stock to {restockingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...restockForm}>
            <form onSubmit={restockForm.handleSubmit(handleRestockItem)} className="space-y-4">
              <div className="text-sm text-slate-600">
                Current stock: <strong>{restockingItem?.current_stock}</strong>
              </div>
              <FormField
                control={restockForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity to Add</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRestockingItem(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Restocking...' : 'Restock'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, item: deleteConfirm.item })}
        title="Delete Inventory Item"
        description={`Are you sure you want to delete ${deleteConfirm.item?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteItem}
        variant="destructive"
        loading={loading}
      />
    </div>
  );
};

export default InventoryManagement;