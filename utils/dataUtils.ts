export default function getMonthNameSafe(monthNumber: number) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    if (monthNumber >= 0 && monthNumber <= 11) {
        return monthNames[monthNumber];
    } else {
        return "Invalid Month Number";
    }
}