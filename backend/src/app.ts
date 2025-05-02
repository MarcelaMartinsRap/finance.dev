import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter";
import incomeRouter from "./routes/incomeRouter";
import expenseRouter from "./routes/expenseRouter";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/users", userRouter);
app.use("/incomes", incomeRouter);
app.use("/expenses", expenseRouter)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});