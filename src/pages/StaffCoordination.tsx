import React, { useState } from 'react';
import { Users, Clock, Calendar, CheckCircle, AlertTriangle, User, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useStaff, StaffMember } from '@/hooks/useStaff';
import { StaffForm } from '@/components/forms/StaffForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/common/DataTable';
import { format } from 'date-fns';

const StaffCoordination = () => {
  const { staff, loading, createStaffMember, updateStaffMember, updateStaffStatus } = useStaff();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; staff: StaffMember | null }>({
    open: false,
    staff: null,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const upcomingShifts = [
    { event: 'Boda García-López', date: '2024-05-28', staff: ['Carlos Mendoza', 'Ana Rodríguez', 'Miguel Santos'], time: '18:00 - 02:00' },
    { event: 'Evento TechCorp', date: '2024-05-30', staff: ['Laura González', 'Roberto Silva'], time: '19:00 - 23:00' },
    { event: 'Graduación ABC', date: '2024-06-01', staff: ['Sofia Martinez', 'Miguel Santos'], time: '16:00 - 22:00' }
  ];

  const alerts = [
    { type: 'warning', message: 'Chef principal no disponible para evento del 30/05', priority: 'Alta' },
    { type: 'info', message: 'Nuevo mesero requiere entrenamiento', priority: 'Media' },
    { type: 'error', message: 'Falta personal para evento del 1/06', priority: 'Crítica' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'on_event': return 'secondary';
      case 'busy': return 'destructive';
      case 'unavailable': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'on_event': return 'En Evento';
      case 'busy': return 'Ocupado';
      case 'unavailable': return 'No Disponible';
      default: return status;
    }
  };

  const handleCreateStaff = async (data: any) => {
    await createStaffMember(data);
    setIsCreateDialogOpen(false);
  };

  const handleEditStaff = async (data: any) => {
    if (editingStaff) {
      await updateStaffMember(editingStaff.id, data);
      setEditingStaff(null);
    }
  };

  const handleDeleteStaff = async () => {
    if (deleteConfirm.staff) {
      // Note: Delete functionality needs to be implemented in backend
      console.log('Delete staff member:', deleteConfirm.staff.id);
      setDeleteConfirm({ open: false, staff: null });
    }
  };

  const handleStatusChange = async (staffId: number, newStatus: string) => {
    await updateStaffStatus(staffId, newStatus);
  };

  const filteredStaff = statusFilter === 'all' 
    ? staff 
    : staff.filter(member => member.status === statusFilter);

  const availableCount = staff.filter(s => s.status === 'available').length;
  const onEventCount = staff.filter(s => s.status === 'on_event').length;
  const unavailableCount = staff.filter(s => s.status === 'unavailable' || s.status === 'busy').length;

  const staffColumns = [
    {
      key: 'avatar',
      header: '',
      render: (member: StaffMember) => (
        <Avatar>
          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            {member.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (member: StaffMember) => (
        <div>
          <div className="font-semibold">{member.name}</div>
          <div className="text-sm text-slate-600">{member.role}</div>
          {member.specialty && (
            <div className="text-xs text-slate-500">{member.specialty}</div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (member: StaffMember) => (
        <div className="text-sm">
          <div>{member.email}</div>
          {member.phone && <div className="text-slate-600">{member.phone}</div>}
        </div>
      ),
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (member: StaffMember) => (
        <div className="text-sm">
          <div>⭐ {member.rating.toFixed(1)}</div>
          <div className="text-slate-600">{member.total_events} eventos</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (member: StaffMember) => (
        <Badge variant={getStatusColor(member.status)}>
          {getStatusLabel(member.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member: StaffMember) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingStaff(member)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusChange(member.id, member.status === 'available' ? 'unavailable' : 'available')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Toggle Status
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteConfirm({ open: true, staff: member })}
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
          <h1 className="text-3xl font-bold text-slate-900">Coordinación de Personal</h1>
          <p className="text-slate-600 mt-1">Gestión y asignación automática de personal según disponibilidad</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Personal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Personal Total</p>
                <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
              </div>
              <Users className="w-8 h-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{availableCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">En Evento</p>
                <p className="text-2xl font-bold text-blue-600">{onEventCount}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">No Disponibles</p>
                <p className="text-2xl font-bold text-red-600">{unavailableCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span>Personal</span>
              </div>
              <div className="flex space-x-2">
                {['all', 'available', 'on_event', 'unavailable'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'Todos' : getStatusLabel(status)}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredStaff}
              columns={staffColumns}
              loading={loading}
              emptyMessage="No staff members found"
            />
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Próximos Turnos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingShifts.map((shift, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">{shift.event}</h4>
                      <Badge variant="outline">{shift.date}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{shift.time}</p>
                    <div className="space-y-1">
                      {shift.staff.map((person, personIndex) => (
                        <div key={personIndex} className="flex items-center space-x-2 text-sm">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">{person}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Alertas de Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'error' ? 'border-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        alert.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                        alert.priority === 'Alta' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{alert.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Staff Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff member.
            </DialogDescription>
          </DialogHeader>
          <StaffForm
            onSubmit={handleCreateStaff}
            onCancel={() => setIsCreateDialogOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the details for {editingStaff?.name}.
            </DialogDescription>
          </DialogHeader>
          {editingStaff && (
            <StaffForm
              initialData={editingStaff}
              onSubmit={handleEditStaff}
              onCancel={() => setEditingStaff(null)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, staff: deleteConfirm.staff })}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${deleteConfirm.staff?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteStaff}
        variant="destructive"
        loading={loading}
      />
    </div>
  );
};

export default StaffCoordination;