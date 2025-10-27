import { useState, useEffect } from 'react';
import { appointmentApi, customerApi, vehicleApi } from '../services/api';
import type { Appointment, CreateAppointment, Customer, Vehicle } from '../types';
import AppointmentForm from '../components/appointments/AppointmentForm';
import './CustomersPage.css';
import './AppointmentsPage.css';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, customersData, vehiclesData] = await Promise.all([
        appointmentApi.getAll(),
        customerApi.getAll(),
        vehicleApi.getAll(),
      ]);
      setAppointments(appointmentsData);
      setCustomers(customersData);
      setVehicles(vehiclesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  const getVehicleInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';
      case 'InProgress':
        return 'status-inprogress';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
      case 'NoShow':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleCreate = async (appointment: CreateAppointment) => {
    await appointmentApi.create(appointment);
    await loadData();
    setShowForm(false);
  };

  const handleUpdate = async (appointment: CreateAppointment) => {
    if (editingAppointment) {
      await appointmentApi.update(editingAppointment.id, appointment);
      await loadData();
      setEditingAppointment(undefined);
      setShowForm(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentApi.delete(id);
        await loadData();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete appointment');
      }
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAppointment(undefined);
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  if (showForm) {
    return (
      <div className="customers-page">
        <AppointmentForm
          appointment={editingAppointment}
          onSubmit={editingAppointment ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Appointments</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Schedule Appointment
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {appointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments yet. Schedule your first appointment to get started!</p>
        </div>
      ) : (
        <div className="customers-grid">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="customer-card">
              <div className="customer-header">
                <h3>{appointment.serviceType}</h3>
                <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="customer-details">
                <div className="detail-row">
                  <span className="label">Customer:</span>
                  <span>{getCustomerName(appointment.customerId)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Vehicle:</span>
                  <span>{getVehicleInfo(appointment.vehicleId)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span>{formatDate(appointment.scheduledDate)}</span>
                </div>
                {appointment.description && (
                  <div className="detail-row">
                    <span className="label">Description:</span>
                    <span>{appointment.description}</span>
                  </div>
                )}
                {appointment.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span>{appointment.notes}</span>
                  </div>
                )}
              </div>
              <div className="customer-actions">
                <button onClick={() => handleEdit(appointment)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(appointment.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
