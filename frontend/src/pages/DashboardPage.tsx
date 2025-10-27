import { useState, useEffect } from 'react';
import { customerApi, vehicleApi, appointmentApi, serviceRecordApi } from '../services/api';
import type { Appointment } from '../types';
import './DashboardPage.css';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    appointments: 0,
    serviceRecords: 0,
    upcomingAppointments: [] as Appointment[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [customers, vehicles, appointments, serviceRecords] = await Promise.all([
        customerApi.getAll(),
        vehicleApi.getAll(),
        appointmentApi.getAll(),
        serviceRecordApi.getAll(),
      ]);

      const upcoming = appointments
        .filter((a) => a.status === 'Scheduled' && new Date(a.scheduledDate) > new Date())
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 5);

      setStats({
        customers: customers.length,
        vehicles: vehicles.length,
        appointments: appointments.filter((a) => a.status === 'Scheduled').length,
        serviceRecords: serviceRecords.length,
        upcomingAppointments: upcoming,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="welcome">Welcome to Caleb's Mechanic Shop Management System</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3498db' }}>
            👥
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.customers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#9b59b6' }}>
            🚗
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.vehicles}</div>
            <div className="stat-label">Total Vehicles</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f39c12' }}>
            📅
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.appointments}</div>
            <div className="stat-label">Scheduled Appointments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#27ae60' }}>
            🔧
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.serviceRecords}</div>
            <div className="stat-label">Service Records</div>
          </div>
        </div>
      </div>

      <div className="upcoming-section">
        <h2>Upcoming Appointments</h2>
        {stats.upcomingAppointments.length === 0 ? (
          <p className="empty-message">No upcoming appointments scheduled.</p>
        ) : (
          <div className="appointments-list">
            {stats.upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-date">{formatDate(appointment.scheduledDate)}</div>
                <div className="appointment-details">
                  <div className="appointment-service">{appointment.serviceType}</div>
                  {appointment.description && (
                    <div className="appointment-description">{appointment.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
