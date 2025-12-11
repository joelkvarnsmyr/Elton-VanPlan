import React, { useState, useMemo } from 'react';
import { Contact } from '@/types/types';
import { Phone, MapPin, Plus, Search, X, Edit2, Trash2, Building2, Car, Wrench, Shield, User } from 'lucide-react';

interface ContactsProps {
    contacts: Contact[];
    onUpdate: (contacts: Contact[]) => void;
    featureLocation?: 'dashboard' | 'header' | 'vehicleSpecs';
}

export const Contacts: React.FC<ContactsProps> = ({ contacts, onUpdate, featureLocation = 'vehicleSpecs' }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<Contact['category'] | 'all'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const categories: (Contact['category'] | 'all')[] = [
        'all',
        'Märkesverkstad',
        'Service & Akut',
        'Specialist',
        'Veteran & Kaross',
        'Försäkring & Räddning'
    ];

    const getCategoryIcon = (category: Contact['category']) => {
        switch (category) {
            case 'Märkesverkstad': return <Car size={16} className="text-blue-600" />;
            case 'Service & Akut': return <Wrench size={16} className="text-orange-600" />;
            case 'Specialist': return <Building2 size={16} className="text-purple-600" />;
            case 'Veteran & Kaross': return <Shield size={16} className="text-teal-600" />;
            case 'Försäkring & Räddning': return <Shield size={16} className="text-red-600" />;
        }
    };

    const getCategoryColor = (category: Contact['category']) => {
        switch (category) {
            case 'Märkesverkstad': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Service & Akut': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Specialist': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Veteran & Kaross': return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'Försäkring & Räddning': return 'bg-red-50 text-red-700 border-red-200';
        }
    };

    const filteredContacts = useMemo(() => {
        let filtered = contacts || [];

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(c => c.category === categoryFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.phone.includes(query) ||
                c.location.toLowerCase().includes(query) ||
                c.specialty.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [contacts, categoryFilter, searchQuery]);

    const groupedContacts = useMemo(() => {
        const groups: { [key in Contact['category']]?: Contact[] } = {};
        filteredContacts.forEach(contact => {
            if (!groups[contact.category]) {
                groups[contact.category] = [];
            }
            groups[contact.category]!.push(contact);
        });
        return groups;
    }, [filteredContacts]);

    const handleDelete = (contact: Contact) => {
        if (confirm(`Ta bort kontakt: ${contact.name}?`)) {
            onUpdate(contacts.filter(c => c.name !== contact.name || c.phone !== contact.phone));
        }
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setShowAddModal(true);
    };

    const handleSave = (contact: Contact) => {
        if (editingContact) {
            // Update existing
            const idx = contacts.findIndex(c =>
                c.name === editingContact.name && c.phone === editingContact.phone
            );
            const updated = [...contacts];
            updated[idx] = contact;
            onUpdate(updated);
        } else {
            // Add new
            onUpdate([...(contacts || []), contact]);
        }
        setShowAddModal(false);
        setEditingContact(null);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Sök kontakter..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingContact(null);
                        setShowAddModal(true);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} />
                    Lägg till
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                            categoryFilter === cat
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 dark:bg-nordic-charcoal text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-nordic-dark-bg'
                        }`}
                    >
                        {cat === 'all' ? 'Alla' : cat}
                        {cat !== 'all' && contacts && ` (${contacts.filter(c => c.category === cat).length})`}
                    </button>
                ))}
            </div>

            {/* Contacts List */}
            {filteredContacts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-nordic-charcoal rounded-2xl">
                    <User size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">
                        {searchQuery || categoryFilter !== 'all'
                            ? 'Inga kontakter matchar dina filter'
                            : 'Inga kontakter ännu. Lägg till din första kontakt!'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedContacts).map(([category, categoryContacts]) => (
                        <div key={category}>
                            <div className="flex items-center gap-2 mb-3">
                                {getCategoryIcon(category as Contact['category'])}
                                <h3 className="font-bold text-nordic-charcoal dark:text-nordic-ice">
                                    {category}
                                </h3>
                                <span className="text-xs text-slate-400">
                                    ({categoryContacts?.length})
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {categoryContacts?.map((contact, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white dark:bg-nordic-dark-surface border border-slate-200 dark:border-nordic-charcoal rounded-xl p-4 hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice mb-1">
                                                    {contact.name}
                                                </h4>
                                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryColor(contact.category)}`}>
                                                    {contact.specialty}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(contact)}
                                                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(contact)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <a
                                                href={`tel:${contact.phone}`}
                                                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                            >
                                                <Phone size={14} />
                                                {contact.phone}
                                            </a>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                            >
                                                <MapPin size={14} />
                                                {contact.location}
                                            </a>
                                        </div>

                                        {contact.note && (
                                            <p className="mt-2 pt-2 border-t border-slate-100 dark:border-nordic-charcoal text-xs text-slate-500 dark:text-slate-400 italic">
                                                {contact.note}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <ContactModal
                    contact={editingContact}
                    onSave={handleSave}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingContact(null);
                    }}
                />
            )}
        </div>
    );
};

// Contact Modal Component
interface ContactModalProps {
    contact: Contact | null;
    onSave: (contact: Contact) => void;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ contact, onSave, onClose }) => {
    const [formData, setFormData] = useState<Contact>(
        contact || {
            name: '',
            phone: '',
            location: '',
            category: 'Märkesverkstad',
            specialty: '',
            note: ''
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-nordic-dark-surface rounded-3xl max-w-lg w-full shadow-2xl">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            {contact ? 'Redigera Kontakt' : 'Ny Kontakt'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Namn *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                            placeholder="Volvo Center Stockholm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Kategori *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as Contact['category'] })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                            required
                        >
                            <option value="Märkesverkstad">Märkesverkstad</option>
                            <option value="Service & Akut">Service & Akut</option>
                            <option value="Specialist">Specialist</option>
                            <option value="Veteran & Kaross">Veteran & Kaross</option>
                            <option value="Försäkring & Räddning">Försäkring & Räddning</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Specialitet
                        </label>
                        <input
                            type="text"
                            value={formData.specialty}
                            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                            placeholder="Elmekaniker, Rostskador, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Telefon *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                            placeholder="08-123 45 67"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Plats
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                            placeholder="Stockholm, Göteborg, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Anteckningar
                        </label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                            rows={3}
                            placeholder="Valfria anteckningar..."
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Spara
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-nordic-dark-bg dark:hover:bg-nordic-charcoal text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                        >
                            Avbryt
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
