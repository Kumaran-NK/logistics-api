import app from "./app";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
