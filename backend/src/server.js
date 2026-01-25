import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' ,message: 'Server is running smoothly'});
  
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});