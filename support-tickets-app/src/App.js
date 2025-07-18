import React, { useState, useEffect } from 'react';
import { ticketsAPI } from './services/api';
import TicketForm from './components/TicketForm';

const SupportTicketsApp = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', priority: 'all' });
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadTickets();
    loadStats();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ticketsAPI.getTickets();
      setTickets(response.tickets || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ticketsAPI.getTicketStats();
      setStats(response.statistics || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreateTicket = async (ticketData) => {
    try {
      const response = await ticketsAPI.createTicket(ticketData);
      setTickets(prev => [response.ticket, ...prev]);
      setShowForm(false);
      loadStats();
      
      // Show success message
      setError('');
      setTimeout(() => {
        setError('✅ Ticket created successfully! Workflow triggered: ' + 
                (response.workflowTriggered ? 'Yes' : 'No'));
      }, 100);
    } catch (error) {
      throw error; // Let form handle the error
    }
  };

  const handleUpdateTicket = async (ticketData) => {
    try {
      const response = await ticketsAPI.updateTicket(editingTicket._id, ticketData);
      setTickets(prev => prev.map(ticket => 
        ticket._id === editingTicket._id ? response.ticket : ticket
      ));
      setEditingTicket(null);
      setShowForm(false);
      loadStats();
      
      // Show success message
      setError('');
      setTimeout(() => {
        setError('✅ Ticket updated successfully!');
      }, 100);
    } catch (error) {
      throw error; // Let form handle the error
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    try {
      await ticketsAPI.deleteTicket(ticketId);
      setTickets(prev => prev.filter(ticket => ticket._id !== ticketId));
      loadStats();
      
      setError('');
      setTimeout(() => {
        setError('✅ Ticket deleted successfully!');
      }, 100);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      setError('Failed to delete ticket');
    }
  };

  const openCreateForm = () => {
    setEditingTicket(null);
    setShowForm(true);
  };

  const openEditForm = (ticket) => {
    setEditingTicket(ticket);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTicket(null);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter.status !== 'all' && ticket.status !== filter.status) {
      return false;
    }
    if (filter.priority !== 'all' && ticket.priority !== filter.priority) {
      return false;
    }
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Support Tickets</h1>
            <p style={styles.subtitle}>
              Manage and track support requests for {user?.customerId}
            </p>
          </div>
          <button 
            onClick={openCreateForm}
            style={styles.createButton}
          >
            + Create Ticket
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total || 0}</div>
          <div style={styles.statLabel}>Total Tickets</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.open || 0}</div>
          <div style={styles.statLabel}>Open</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.inProgress || 0}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.resolved || 0}</div>
          <div style={styles.statLabel}>Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status:</label>
          <select 
            value={filter.status} 
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Priority:</label>
          <select 
            value={filter.priority} 
            onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Error/Success Message */}
      {error && (
        <div style={{
          ...styles.message,
          ...(error.startsWith('✅') ? styles.successMessage : styles.errorMessage)
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={styles.messageClose}
          >
            ×
          </button>
        </div>
      )}

      {/* Tickets List */}
      <div style={styles.ticketsContainer}>
        {filteredTickets.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎫</div>
            <h3>No tickets found</h3>
            <p>
              {tickets.length === 0 
                ? 'Create your first support ticket to get started'
                : 'Try adjusting your filters'
              }
            </p>
            {tickets.length === 0 && (
              <button onClick={openCreateForm} style={styles.createButton}>
                Create First Ticket
              </button>
            )}
          </div>
        ) : (
          <div style={styles.ticketsList}>
            {filteredTickets.map(ticket => (
              <div key={ticket._id} style={styles.ticketCard}>
                <div style={styles.ticketHeader}>
                  <div style={styles.ticketMeta}>
                    <span 
                      style={{
                        ...styles.priorityBadge,
                        backgroundColor: getPriorityColor(ticket.priority)
                      }}
                    >
                      {ticket.priority}
                    </span>
                    <span 
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(ticket.status)
                      }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <div style={styles.ticketActions}>
                    <button 
                      onClick={() => openEditForm(ticket)}
                      style={styles.actionButton}
                      title="Edit ticket"
                    >
                      ✏️
                    </button>
                    {user?.role === 'Admin' && (
                      <button 
                        onClick={() => handleDeleteTicket(ticket._id)}
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        title="Delete ticket"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                
                <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                <p style={styles.ticketDescription}>{ticket.description}</p>
                
                <div style={styles.ticketFooter}>
                  <div style={styles.ticketInfo}>
                    <span>Created: {formatDate(ticket.createdAt)}</span>
                    {ticket.workflowTriggered && (
                      <span style={styles.workflowBadge}>🔄 Workflow</span>
                    )}
                  </div>
                  <div style={styles.ticketUser}>
                    By: {ticket.userId?.email || 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Form Modal */}
      {showForm && (
        <TicketForm
          ticket={editingTicket}
          onSubmit={editingTicket ? handleUpdateTicket : handleCreateTicket}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'inherit',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    marginBottom: '24px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  filters: {
    display: 'flex',
    gap: '20px',
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successMessage: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  messageClose: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: 'inherit',
  },
  ticketsContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  ticketsList: {
    padding: '20px',
  },
  ticketCard: {
    borderBottom: '1px solid #f3f4f6',
    padding: '20px 0',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  ticketMeta: {
    display: 'flex',
    gap: '8px',
  },
  priorityBadge: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  statusBadge: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '4px',
    textTransform: 'capitalize',
  },
  ticketActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    color: '#dc2626',
  },
  ticketTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  ticketDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
  },
  ticketFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#9ca3af',
  },
  ticketInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  workflowBadge: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
  },
  ticketUser: {
    fontWeight: '500',
  },
};

// Add keyframes for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default SupportTicketsApp;