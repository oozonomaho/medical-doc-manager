import express from 'express';
import cors from 'cors';
import './db'; 
import patientsRouter from './routes/patients';
import certificatesRouter from './routes/certificates';
import lifeInsuranceRoutes from './routes/lifeInsurance';


const app = express();
const port = 3001; 
app.use(cors());
app.use(express.json());

// GET /patients などを扱うルーター
app.use('/patients', patientsRouter);
app.use('/certificates', certificatesRouter);
app.use('/life-insurance', lifeInsuranceRoutes); // 




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
