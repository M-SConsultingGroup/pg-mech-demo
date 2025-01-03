"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ITicket } from '@/common/interfaces';
import { TICKET_STATUSES } from '@/common/constants';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function Tickets() {
  const { username, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(isAdmin ? 'New' : 'Open');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('');
  const [assignedUsers, setAssignedUsers] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTickets(data);
    };

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/getAllUsers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsers(data.map((user: { username: string }) => user.username));
    };
  
    const fetchData = async () => {
      await Promise.all([fetchTickets(), fetchUsers()]);
    };
  
    fetchData();
  }, []);

  const handleRowToggle = (ticketId: string) => {
    setExpandedRows((prev) => {
      const newExpandedRows = new Set(prev);
      if (newExpandedRows.has(ticketId)) {
        newExpandedRows.delete(ticketId);
      } else {
        newExpandedRows.add(ticketId);
      }
      return newExpandedRows;
    });
  };

  const handleSort = (field: string) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleAssignedToFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssignedToFilter(e.target.value);
  };

  const handleRowDelete = async (ticketId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this ticket?');
    if (!confirmed) {
      return;
    }
  
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tickets?id=${ticketId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  
    if (response.ok) {
      setTickets((prev) => prev.filter((ticket) => ticket._id !== ticketId));
    } else {
      toast.error('Failed to delete ticket');
    }
  };

  const handleAssignedUserChange = async (ticketId: string, user: string) => {
    const previousUser = assignedUsers[ticketId] || '';
    setAssignedUsers((prev) => ({
      ...prev,
      [ticketId]: user,
    }));
  
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/tickets?id=${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ticketId, assignedTo: user, status: 'Open' })
    });
  
    if (response.ok) {
      const updatedTicket = await response.json();
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, assignedTo: user, status: 'Open' } : ticket
        )
      );
      toast.success('Ticket updated successfully');
    } else {
      setAssignedUsers((prev) => ({
        ...prev,
        [ticketId]: previousUser,
      }));
      toast.error('Failed to update ticket');
    }
  };

  const filteredTickets = tickets
    .filter((ticket) =>
      ticket.name.toLowerCase().includes(filter.toLowerCase()) ||
      ticket.serviceAddress.toLowerCase().includes(filter.toLowerCase())
    )
    .filter((ticket) =>
      statusFilter ? ticket.status === statusFilter : true
    )
    .filter((ticket) =>
      assignedToFilter ? ticket.assignedTo === assignedToFilter : true
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      const aValue = a[sortField as keyof ITicket];
      const bValue = b[sortField as keyof ITicket];
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const displayedTickets = isAdmin
    ? filteredTickets
    : filteredTickets.filter((ticket) => ticket.assignedTo === username);

  return (
    <div className="min-h-screen p-4 pb-10 flex flex-col items-center bg-gray-100 space-y-2">
      {isAdmin && (
        <div className="w-full bg-white p-2 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
          <div className="mt-1">
            <p className="text-base  text-gray-800">Total New Tickets: <span className="font-bold text-gray-800">{tickets.filter(ticket => ticket.status === 'New').length}</span></p>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {users.map((user) => {
              const userTickets = tickets.filter((ticket) => ticket.assignedTo === user);
              const totalTickets = userTickets.length;
              const openTickets = userTickets.filter((ticket) => ticket.status === 'Open').length;
              const closedTickets = userTickets.filter((ticket) => ticket.status === 'Closed').length;

              return (
                <div key={user} className="p-1 bg-gray-100 rounded-lg shadow-md">
                  <h2 className="text-base font-semibold text-gray-800">{user}</h2>
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">Total: <span className="font-bold text-gray-800">{totalTickets}</span></p>
                    <p className="text-sm text-gray-600">Open: <span className="font-bold text-gray-800">{openTickets}</span></p>
                    <p className="text-sm text-gray-600">Closed: <span className="font-bold text-gray-800">{closedTickets}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="w-full bg-white p-4 rounded-lg shadow-lg">
        <div className="filter-buttons flex flex-col md:flex-row flex-wrap justify-between items-center mb-2 space-y-2 md:space-y-0">
          <h1 className="text-3xl font-bold text-gray-800">Tickets</h1>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <input
              type="text"
              placeholder="Filter by name or address"
              value={filter}
              onChange={handleFilterChange}
              className="border p-1 rounded"
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border p-1 rounded"
            >
              <option value="">Filter by Status</option>
                {TICKET_STATUSES.map((status: string) => (
                <option key={status} value={status}>
                  {status}
                </option>
                ))}
            </select>
            {isAdmin && (
              <select
                value={assignedToFilter}
                onChange={handleAssignedToFilterChange}
                className="border p-1 rounded"
              >
                <option value="">Filter by Assigned To</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => handleSort('name')}
              className="bg-blue-500 hover:bg-blue-700 text-white p-1 rounded shadow-lg transition duration-300"
            >
              Sort by Name
            </button>
            <button
              onClick={() => handleSort('serviceAddress')}
              className="bg-blue-500 hover:bg-blue-700 text-white p-1 rounded shadow-lg transition duration-300"
            >
              Sort by Address
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 hover:bg-blue-700 text-white p-1 rounded shadow-lg transition duration-300"
            >
              + New
            </button>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="min border-collapse border border-gray-400 w-full">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2 pr-4">Ticket Number</th>
                <th className="border border-gray-400 p-2 pr-4">Name</th>
                <th className="border border-gray-400 p-2 pr-4">Service Address</th>
                {isAdmin && <th className="border border-gray-400 p-2 pr-4 hidden md:table-cell">Email</th>}
                <th className="border border-gray-400 p-2 pr-4 hidden md:table-cell">Phone Number</th>
                <th className="border border-gray-400 p-2 pr-4 hidden md:table-cell">Work Order Description</th>
                <th className="border border-gray-400 p-2 pr-4 hidden md:table-cell">Time Availability</th>
                <th className="border border-gray-400 p-2 pr-4 hidden md:table-cell">Status</th>
                {isAdmin && <th className="border border-gray-400 p-2 pr-4 hidden md:table-cell">Assigned To</th>}
                <th className="border border-gray-400 p-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedTickets.map((ticket: ITicket, index) => (
                <React.Fragment key={ticket._id}>
                  <tr
                    className={`cursor-pointer ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
                    onClick={() => handleRowToggle(ticket._id!)}
                  >
                    <td className="border border-gray-400 p-2 pr-4">{ticket.ticketNumber}</td>
                    <td className="border border-gray-400 p-2 pr-4">{ticket.name}</td>
                    <td className="border border-gray-400 p-2 pr-4">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.serviceAddress || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-blue-600 underline"
                      >
                        {ticket.serviceAddress || ''}
                      </a>
                    </td>
                    {isAdmin && <td className="border border-gray-400 p-2 pr-4 hidden md:table-cell">{ticket.email}</td>}
                    <td className="border border-gray-400 p-2 pr-4 hidden md:table-cell">
                      <a
                        href={`tel:${ticket.phoneNumber}`}
                        className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-blue-600 underline bg-gray-100"
                      >
                        {ticket.phoneNumber || ''}
                      </a>
                    </td>
                    <td className="border border-gray-400 p-2 pr-4 hidden md:table-cell">{ticket.workOrderDescription}</td>
                    <td className="border border-gray-400 p-2 pr-4 hidden md:table-cell">{ticket.timeAvailability}</td>
                    <td className="border border-gray-400 p-2 pr-4 hidden md:table-cell">{ticket.status}</td>
                    {isAdmin && (
                      <td className="border border-gray-400 p-2 pr-4 hidden md:table-cell">
                        <select
                          value={assignedUsers[ticket._id!] || ticket.assignedTo || ''}
                          onChange={(e) => handleAssignedUserChange(ticket._id!, e.target.value)}
                          className="border p-1 rounded"
                        >
                          <option value="">Unassigned</option>
                          {users.map((user) => (
                            <option key={user} value={user}>
                              {user}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="border border-gray-400 p-2 pr-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => router.push(`/tickets/${ticket._id}`)}
                          className="bg-yellow-500 p-1 rounded flex items-center"
                        >
                          <Image src="/edit-pen.svg" alt="Edit" width={20} height={20} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleRowDelete(ticket._id || '')}
                            className="border border-gray-500 p-1 rounded flex items-center"
                          >
                            <Image src="/trash-bin-red.svg" alt="Delete" width={20} height={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(ticket._id!) && (
                    <tr className="md:hidden">
                      <td colSpan={4} className="border border-gray-400">
                        <div><strong>Email:</strong> {ticket.email}</div>
                        <div><strong>Phone Number:</strong> {ticket.phoneNumber}</div>
                        <div><strong>Work Order Description:</strong> {ticket.workOrderDescription}</div>
                        <div><strong>Time Availability:</strong> {ticket.timeAvailability}</div>
                        <div><strong>Status:</strong> {ticket.status}</div>
                        {isAdmin && (
                          <div>
                            <strong>Assigned To:</strong>
                            <select
                              value={assignedUsers[ticket._id!] || ticket.assignedTo || ''}
                              onChange={(e) => handleAssignedUserChange(ticket._id!, e.target.value)}
                              className="border p-1 rounded"
                            >
                              <option value="">Unassigned</option>
                              {users.map((user) => (
                                <option key={user} value={user}>
                                  {user}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
                        <div><strong>Updated At:</strong> {new Date(ticket.updatedAt).toLocaleString()}</div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}