import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './infra/mongo/connection';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/users', userRouter);
app.use('/auth', authRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

export default app;
