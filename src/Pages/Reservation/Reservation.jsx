import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { FaUsers, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaInfoCircle, FaRegCreditCard } from 'react-icons/fa';

const Reservation = () => {
    // --- All State and Logic functions are preserved ---
    const [reservations, setReservations] = useState([]);
    const [formData, setFormData] = useState({ num_people: '', reservation_time: '', special_request: '' });
    const [formErrors, setFormErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const navigate = useNavigate();

    // All data fetching and handler functions remain the same
    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const response = await axios.get('http://127.0.0.1:8000/api/reservation/showReservation', { headers: { Authorization: `Bearer ${token}` } });
                if (response.data.status === 'success') {
                    setReservations(response.data.data || []);
                }
            } catch (err) {
                if (err.response?.status === 401) navigate('/login');
                else setError('Could not fetch reservations.');
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
    };

    const handleEdit = (reservation) => {
        setEditingId(reservation.reservation_id);
        setFormData({
            num_people: reservation.num_people,
            reservation_time: format(parseISO(reservation.reservation_time), "yyyy-MM-dd'T'HH:mm"),
            special_request: reservation.special_request || '',
        });
        setFormErrors({});
        document.getElementById('reservation-form-container').scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ num_people: '', reservation_time: '', special_request: '' });
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.num_people) errors.num_people = 'Number of people is required.';
        else if (formData.num_people < 1 || formData.num_people > 20) errors.num_people = 'Must be between 1 and 20.';
        if (!formData.reservation_time) errors.reservation_time = 'Reservation time is required.';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
        setSubmitLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            const data = {
                num_people: formData.num_people,
                reservation_time: formData.reservation_time.replace('T', ' ') + ':00',
                ...(formData.special_request && { special_request: formData.special_request })
            };
            const url = editingId ? `http://127.0.0.1:8000/api/reservation/update/${editingId}` : 'http://127.0.0.1:8000/api/reservation/create';
            const method = editingId ? 'patch' : 'post';
            await axios[method](url, data, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess(editingId ? 'Reservation updated!' : 'Reservation created!');
            const refreshResponse = await axios.get('http://127.0.0.1:8000/api/reservation/showReservation', { headers: { Authorization: `Bearer ${token}` } });
            setReservations(refreshResponse.data.data || []);
            cancelEdit();
            setTimeout(() => setSuccess(null), 4000);
        } catch (err) {
            if (err.response?.status === 422) setFormErrors(err.response.data.errors);
            else setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleteLoading(id);
        try {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            await axios.delete(`http://127.0.0.1:8000/api/reservation/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess('Reservation deleted!');
            setReservations(reservations.filter((res) => res.reservation_id !== id));
            setTimeout(() => setSuccess(null), 4000);
        } catch (err) {
            setError('Failed to delete reservation.');
        } finally {
            setDeleteLoading(null);
            setShowDeleteModal(null);
        }
    };

    // --- Sub-components ---
    const StatusBadge = ({ status }) => {
        const statusMap = {
            processing: { color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300', icon: '⏳', label: 'Processing' },
            completed: { color: 'border-green-500/50 bg-green-500/10 text-green-300', icon: '✅', label: 'Completed' },
            cancelled: { color: 'border-red-500/50 bg-red-500/10 text-red-300', icon: '❌', label: 'Cancelled' },
            default: { color: 'border-gray-500/50 bg-gray-500/10 text-gray-300', icon: 'ℹ️', label: status || 'Unknown' }
        };
        const config = statusMap[status?.toLowerCase()] || statusMap.default;
        return <span className={`px-2.5 py-1 border rounded-full text-xs font-semibold flex items-center gap-2 ${config.color}`}>{config.icon} {config.label}</span>;
    };
    
    const LoadingSkeleton = () => (
        <div className="space-y-5 p-6">{[...Array(3)].map((_, i) => <div key={i} className="p-5 bg-neutral-800 rounded-xl animate-pulse space-y-4"><div className="flex justify-between items-center"><div className="h-5 bg-neutral-700 rounded w-1/3"></div><div className="h-6 bg-neutral-700 rounded-full w-24"></div></div><div className="h-4 bg-neutral-700 rounded w-1/2"></div><div className="h-4 bg-neutral-700 rounded w-3/4"></div></div>)}</div>
    );

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 h-full">
            <div className="bg-neutral-800 p-6 rounded-full mb-6"><FaRegCreditCard className="h-16 w-16 text-gray-600" /></div>
            <h3 className="mt-2 text-xl font-semibold text-white">No Bookings Found</h3>
            <p className="mt-2 text-gray-400">Your future reservations will appear here.</p>
        </div>
    );
    
    const DeleteModal = ({ reservationId }) => (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">Confirm Deletion</h3>
                <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete reservation #{reservationId}? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600">Cancel</button>
                    <button onClick={() => handleDelete(reservationId)} disabled={deleteLoading === reservationId} className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center ${deleteLoading === reservationId && 'opacity-50 cursor-not-allowed'}`}>
                        {deleteLoading === reservationId && <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" fill="currentColor"></path></svg>}
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );

    // --- MAIN JSX ---
    return (
    <div className="bg-black text-white min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 mt-16">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">My <span className="text-orange-500">Reservations</span></h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        Book your table and manage your upcoming visits. Your next great dining experience is just a few clicks away.
                    </p>
                </motion.div>
                
                <AnimatePresence>{(error || success) && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 max-w-3xl mx-auto">{error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300 shadow-lg">{error}</div>}{success && <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-300 shadow-lg">{success}</div>}</motion.div>}</AnimatePresence>
                
                <div className="flex flex-col lg:flex-row lg:gap-10">
                    <div className="lg:w-1/3 mb-10 lg:mb-0">
                        <div id="reservation-form-container" className="bg-neutral-900 border border-gray-800 rounded-2xl p-6 lg:sticky top-24 shadow-2xl shadow-black/30">
                           <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">{editingId ? 'Update Reservation' : 'New Reservation'}</h2>{editingId && (<button onClick={cancelEdit} className="text-sm text-gray-400 hover:text-white">&times; Cancel</button>)}</div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative"><label htmlFor="num_people" className="block text-sm font-medium text-gray-400 mb-2">Number of People</label><FaUsers className="absolute left-3 bottom-3.5 text-gray-500 pointer-events-none" /><input type="number" name="num_people" min="1" max="20" value={formData.num_people} onChange={handleChange} required className={`pl-10 block w-full rounded-lg bg-neutral-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500 p-3 transition ${formErrors.num_people && 'border-red-500'}`} />{formErrors.num_people && <p className="mt-1 text-xs text-red-400">{formErrors.num_people}</p>}</div>
                                <div className="relative"><label htmlFor="reservation_time" className="block text-sm font-medium text-gray-400 mb-2">Date & Time</label><FaCalendarAlt className="absolute left-3 bottom-3.5 text-gray-500 pointer-events-none" /><input type="datetime-local" name="reservation_time" value={formData.reservation_time} onChange={handleChange} required className={`pl-10 block w-full rounded-lg bg-neutral-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500 p-3 transition ${formErrors.reservation_time && 'border-red-500'}`} />{formErrors.reservation_time && <p className="mt-1 text-xs text-red-400">{formErrors.reservation_time}</p>}</div>
                                <div><label htmlFor="special_request" className="block text-sm font-medium text-gray-400 mb-2">Special Requests (Optional)</label><textarea name="special_request" rows={3} value={formData.special_request} onChange={handleChange} className="block w-full rounded-lg bg-neutral-800 border-gray-700 text-white focus:ring-orange-500 focus:border-orange-500 p-3 transition" /></div>
                                <button type="submit" disabled={submitLoading} className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md ${submitLoading ? 'bg-orange-600/50 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-orange-500 transition flex items-center justify-center gap-2`}>{submitLoading ? (<svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" fill="currentColor"></path></svg>) : (editingId ? <FaEdit /> : <FaPlus />)}{editingId ? 'Update' : 'Create'}</button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:w-2/3">
                        <div className="bg-neutral-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/30 min-h-full">
                            <div className="p-6 border-b border-gray-800"><h3 className="text-xl font-bold text-white">Your Bookings</h3></div>
                            <div className="p-2 sm:p-6">
                                {loading ? <LoadingSkeleton /> : reservations.length === 0 ? <EmptyState /> : (
                                    // MOBILE IMPROVEMENT: Reduced horizontal padding/margin for more content space on small screens
                                    <div className="relative pl-4 sm:pl-6">
                                        {/* MOBILE IMPROVEMENT: Adjusted line position to match new padding */}
                                        <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-gray-700"></div>
                                        <div className="space-y-10">
                                            <AnimatePresence>
                                                {reservations.map((res) => (
                                                    <motion.div key={res.reservation_id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="relative">
                                                        <div className="absolute left-0 top-1 w-4 h-4 bg-orange-500 rounded-full border-4 border-neutral-900 transform -translate-x-1/2"></div>
                                                        {/* MOBILE IMPROVEMENT: Reduced left margin for more content space */}
                                                        <div className="ml-8 sm:ml-10">
                                                            {/* MOBILE IMPROVEMENT: Stacks items vertically with a gap on small screens for better readability */}
                                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start gap-2 mb-2">
                                                                <h4 className="font-bold text-lg text-white">Reservation #{res.reservation_id}</h4>
                                                                <StatusBadge status={res.status} />
                                                            </div>
                                                            <div className="text-sm text-gray-400 mb-4">{format(parseISO(res.reservation_time), "E, MMM d, yearbook 'at' h:mm a")}</div>
                                                            <div className="bg-neutral-800/50 border border-gray-700/50 rounded-lg p-4">
                                                                <div className="flex items-center gap-4 text-sm"><FaUsers className="text-gray-500" /><span>{res.num_people} Guests</span></div>
                                                                {res.special_request && <div className="flex items-start gap-4 text-sm mt-3 pt-3 border-t border-gray-700/50"><FaInfoCircle className="text-gray-500 mt-0.5" /><span>{res.special_request}</span></div>}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-4">
                                                                <button onClick={() => handleEdit(res)} className="p-2 rounded-full text-gray-400 hover:bg-neutral-700 hover:text-white transition-colors" aria-label="Edit"><FaEdit /></button>
                                                                <button onClick={() => setShowDeleteModal(res.reservation_id)} className="p-2 rounded-full text-gray-400 hover:bg-neutral-700 hover:text-red-500 transition-colors" aria-label="Delete"><FaTrash /></button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <AnimatePresence>{showDeleteModal && <DeleteModal reservationId={showDeleteModal} />}</AnimatePresence>
            </main>
        </div>
    );
};

export default Reservation;