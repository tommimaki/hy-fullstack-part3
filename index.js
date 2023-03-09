require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./models/person");
console.log(Person);

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(
    "method-> :method url-> :url status-> :status :res[content-length] data-> :data Response time-> :response-time ms"
  )
);
// this shows the data in post request
morgan.token("data", (req) => {
  if (req.method === "POST") return JSON.stringify(req.body);
});

const password = process.argv[2];

const url = process.env.MONGODB_URI;
// const url = `mongodb+srv://tommimaki97:${password}@cluster0.vazdipe.mongodb.net/Phonebook?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

app.get("/", (request, response) => {
  response.send("<h1>phonebook api</h1>");
});
app.get("/info", (request, response) => {
  const now = new Date();
  const timezone = now.toString().match(/\(([A-Za-z\s].*)\)/)[1];
  const date = now.toDateString();
  const time = now.toLocaleTimeString();

  response.send(`
      <h4>Phonebook has info for ${persons.length} people </h4>
      <p>Current date: ${date}</p>
      <p>Current time: ${time}</p>
      <p>Timezone: ${timezone}</p>
    `);
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => res.json(person))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Name or number data is missing",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedContact) => res.json(savedContact))
    .catch((error) => next(error));
});
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
