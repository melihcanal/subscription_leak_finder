export const workflowSteps = [
    {
        title: "Upload your CSV",
        description: "Use a simple export with three columns: date, description, and amount."
    },
    {
        title: "We detect recurring merchants",
        description: "The app groups similar merchant names, checks close amounts, and validates monthly timing."
    },
    {
        title: "Review your dashboard",
        description: "See estimated monthly subscription cost and identify spending you may want to cancel."
    }
];

export const csvSamples = [
    {
        title: "Streaming services",
        content: `date,description,amount
2024-01-05,Netflix,-15.99
2024-02-05,Netflix,-15.99
2024-03-05,Netflix,-15.99
2024-01-10,Spotify,-9.99
2024-02-10,Spotify,-9.99
2024-03-10,Spotify,-9.99`
    },
    {
        title: "Productivity tools",
        content: `date,description,amount
2024-01-15,Notion,-8.00
2024-02-15,Notion,-8.00
2024-03-15,Notion,-8.00
2024-01-20,Apple iCloud,-2.99
2024-02-20,Apple iCloud,-2.99
2024-03-20,Apple iCloud,-2.99`
    },
    {
        title: "Mixed activity",
        content: `date,description,amount
2024-01-07,Random Grocery,-42.10
2024-01-15,Notion,-8.00
2024-01-18,One-time Gift,-50.00
2024-02-15,Notion,-8.00
2024-03-15,Notion,-8.00
2024-03-19,Coffee Shop,-4.50`
    }
];

export const dashboardBenefits = [
    "Monthly cost summary across detected subscriptions.",
    "Grouped merchants like Netflix, Spotify, Notion, and iCloud.",
    "Recurring pattern detection based on amount tolerance and monthly cadence.",
    "Potentially unnecessary subscriptions highlighted for review."
];
