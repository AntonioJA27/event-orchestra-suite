
import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const InventoryManagement = () => {
  const inventoryItems = [
    { id: 1, name: 'Manteles blancos', category: 'Mantelería', current: 15, minimum: 20, total: 50, status: 'Crítico', location: 'Almacén A' },
    { id: 2, name: 'Platos principales', category: 'Vajilla', current: 180, minimum: 100, total: 200, status: 'Normal', location: 'Almacén B' },
    { id: 3, name: 'Copas de vino', category: 'Cristalería', current: 45, minimum: 60, total: 120, status: 'Bajo', location: 'Almacén B' },
    { id: 4, name: 'Sillas Tiffany', category: 'Mobiliario', current: 85, minimum: 50, total: 100, status: 'Normal', location: 'Bodega 1' },
    { id: 5, name: 'Centros de mesa', category: 'Decoración', current: 12, minimum: 15, total: 30, status: 'Crítico', location: 'Almacén C' },
    { id: 6, name: 'Servilletas doradas', category: 'Mantelería', current: 200, minimum: 100, total: 300, status: 'Normal', location: 'Almacén A' },
  ];

  const suppliers = [
    { name: 'Textiles Premium', category: 'Mantelería', rating: 4.8, lastDelivery: '2024-05-15', status: 'Activo' },
    { name: 'Cristales y Más', category: 'Cristalería', rating: 4.5, lastDelivery: '2024-05-10', status: 'Activo' },
    { name: 'Mobiliario Eventos', category: 'Mobiliario', rating: 4.2, lastDelivery: '2024-05-08', status: 'Pendiente' },
    { name: 'Decoraciones Elegantes', category: 'Decoración', rating: 4.9, lastDelivery: '2024-05-12', status: 'Activo' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Crítico': return 'destructive';
      case 'Bajo': return 'secondary';
      case 'Normal': return 'default';
      default: return 'outline';
    }
  };

  const getStockPercentage = (current: number, total: number) => {
    return (current / total) * 100;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Inventario</h1>
          <p className="text-slate-600 mt-1">Control de inventario y gestión de proveedores en tiempo real</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex items-center space-x-2">
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
                <p className="text-2xl font-bold text-red-600">8</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-600">15</p>
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
                <p className="text-2xl font-bold text-slate-900">156</p>
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
                <p className="text-2xl font-bold text-green-600">$85,400</p>
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
              <Input placeholder="Buscar productos..." className="pl-10" />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </Button>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryItems.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{item.category} • {item.location}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Stock actual: {item.current} / {item.total}</span>
                      <span className="text-slate-600">Mínimo: {item.minimum}</span>
                    </div>
                    <Progress 
                      value={getStockPercentage(item.current, item.total)} 
                      className="h-2"
                    />
                  </div>
                  
                  {item.current <= item.minimum && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      ⚠️ Stock por debajo del mínimo requerido
                    </div>
                  )}
                </div>
              ))}
            </div>
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
    </div>
  );
};

export default InventoryManagement;
