const express = require('express');
const joi = require('joi');
const fs = require('fs').promises;
const path = require('path');
const pathToFile = path.join(__dirname, 'users.json');

const app = express();
const userSchema = joi.object({
    firstName: joi.string().min(1).required(),
    secondName: joi.string().min(1).required(),
    age: joi.number().min(0).max(150).required(),
    city: joi.string().min(1)
});

app.use(express.json());

app.get('/users', async (req, res) => {
    try {
        const usersData = await readUsersFromFile();
        res.send({ usersData });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const usersData = await readUsersFromFile();
        const userId = +req.params.id;
        const user = usersData.find(user => user.id === userId);
        if (user) {
            res.send({ user });
        } else {
            res.status(404).send({ user: null });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/users', async (req, res) => {
    try {
        const usersData = await readUsersFromFile();
        const uniqueID = usersData.length + 1;
        const newUser = { id: uniqueID, ...req.body };
        usersData.push(newUser);
        await writeUsersToFile(usersData);
        res.send({ id: uniqueID });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const result = userSchema.validate(req.body);
        if (result.error) {
            return res.status(400).send({ error: result.error.details });
        }
        const userId = +req.params.id;
        let usersData = await readUsersFromFile();
        const userIndex = usersData.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            const { firstName, secondName, age, city } = req.body;
            usersData[userIndex] = { ...usersData[userIndex], firstName, secondName, age, city };
            await writeUsersToFile(usersData);
            res.send({ user: usersData[userIndex] });
        } else {
            res.status(404).send({ user: null });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const userId = +req.params.id;
        let usersData = await readUsersFromFile();
        const userIndex = usersData.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            const deletedUser = usersData.splice(userIndex, 1)[0];
            await writeUsersToFile(usersData);
            res.send({ user: deletedUser });
        } else {
            res.status(404).send({ user: null });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

async function readUsersFromFile() {
    const data = await fs.readFile(pathToFile, 'utf-8');
    return JSON.parse(data);
}

async function writeUsersToFile(users) {
    await fs.writeFile(pathToFile, JSON.stringify(users, null, 2));
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});