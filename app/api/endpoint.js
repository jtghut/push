import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON body

// Sample POST endpoint
dep app.post('/endpoint', (req, res) => {
    const { data } = req.body;
    if (data === 'inject') {
        res.json({ success: true, message: "Data received successfully!" });
    } else {
        res.status(400).json({ success: false, message: "Invalid data format." });
    }
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found." });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

