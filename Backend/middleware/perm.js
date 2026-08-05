function hasPermission(userPerms, required) {
    if (userPerms.includes(required)) return true;
    const prefix = required + ':';
    return userPerms.some(p => p.startsWith(prefix));
}

module.exports = (...required) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Access denied. Not authenticated.' });
        }
        if (req.user.role === 'admin') {
            return next();
        }
        const perms = req.user.permissions || [];
        if (required.some(p => hasPermission(perms, p))) {
            return next();
        }
        return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    };
};
