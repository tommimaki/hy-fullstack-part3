const express = require("express");
const morgan = require("morgan");
const app = express();

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

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
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  console.log(body);

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const personExists = persons.some((person) => person.name === body.name);

  if (personExists) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT);
console.log(`Phonebook server running on port ${PORT}`);
