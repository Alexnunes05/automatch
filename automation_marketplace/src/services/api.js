export const n8nApi = {
    async sendNewLead(leadData) {
        try {
            const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL + '/new-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData),
            });
            return response.ok;
        } catch (error) {
            console.error('Error sending lead to n8n:', error);
            return false;
        }
    },

    async registerExpert(expertData) {
        try {
            const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL + '/new-expert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expertData),
            });
            return response.ok;
        } catch (error) {
            console.error('Error registering expert:', error);
            return false;
        }
    },

    async sendProposal(proposalData) {
        try {
            const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL + '/proposal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(proposalData),
            });
            return response.ok;
        } catch (error) {
            console.error('Error sending proposal to n8n:', error);
            return false;
        }
    }
};
