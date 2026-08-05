const MODULES = [
    { key: 'bookings', label: 'Bookings', actions: ['view', 'create', 'update', 'delete'] },
    { key: 'reports', label: 'Reports', actions: ['view'] },
    { key: 'customers', label: 'Customers', actions: ['view', 'create', 'update', 'delete'] },
    { key: 'employees', label: 'Employees', actions: ['view', 'create', 'update', 'delete'] },
    { key: 'payments', label: 'Payments', actions: ['view', 'create', 'update', 'delete'] },
    { key: 'rooms', label: 'Rooms', actions: ['view', 'create', 'update', 'delete'] },
    { key: 'services', label: 'Services', actions: ['view', 'create', 'update', 'delete'] },
    { key: 'settings', label: 'Hotel Settings', actions: ['view'] },
];

const PERMISSIONS = MODULES.flatMap(m =>
    m.actions.map(a => (a === 'view' ? m.key : `${m.key}:${a}`))
);

module.exports = {
    MODULES,
    PERMISSIONS,
    LABELS: Object.fromEntries(MODULES.map(m => [m.key, m.label])),
};
