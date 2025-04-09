const groupNotificationsByType = (notifications) => {
    const grouped = {
        user: [],
        team: [],
        tournament: [],
        venue: [],
        score: [],
    };

    for (const notif of notifications) {
        const type = notif.type;

        if (grouped[type]) {
            grouped[type].push(notif);
        } else {
            // Optional: add unexpected types for debugging
            grouped[type] = [notif];
        }
    }

    return grouped;
};

module.exports = {
    groupNotificationsByType

}
