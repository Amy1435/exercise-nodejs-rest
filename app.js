import express from "express";
import path from "path";
import fs from "fs";
const app = express();

app.use(express.json());

app.listen(3000, () => {
    console.log(`Server is running`);
});

//Author Properties
const authorProperties = ["name", "surname", "birthyear", "address"];

//functions
const readResourceAuthors = async () => {
    let fileContent = await fs.promises.readFile("./database/authors.json", {
        encoding: "utf-8",
    });
    const resourse = JSON.parse(await fileContent);
    return resourse;
};

const generateId = async () => {
    const resource = await readResourceAuthors();
    const ids = resource.map((b) => b.id);
    for (let i = 0; i <= ids.length; i++) {
        if (!ids.includes(i)) {
            return i;
        }
    }
};

const writeResource = (resource) => {
    const data = JSON.stringify(resource);
    fs.writeFileSync(path.resolve("./database/authors.json"), data);
};

// GET authors
app.get("/authors", (req, res) => {
    res.sendFile(path.resolve("./database/authors.json"));
});

//GET authors/:id
app.get("/authors/:id", async (req, res) => {
    const idAuthorRequest = req.params.id;
    const authorsResource = await readResourceAuthors();
    const idAuthorsResource = authorsResource.filter(
        (author) => Number(author.id) === Number(idAuthorRequest)
    );
    if (idAuthorsResource.length > 0) {
        res.send(idAuthorsResource);
    } else {
        res.status(404).send(`Author with id ${idAuthorRequest} not found`);
    }
});

//POST authors
app.post("/authors", async (req, res) => {
    const newAuthor = req.body;
    const keysLength = Object.keys(newAuthor).length === 4;

    if (!keysLength) {
        res.status(400).send("The author has to have 4 properties");
        return;
    }

    const isReqKeyValid = authorProperties.every(
        (key) => newAuthor[key] !== undefined
    );
    if (!isReqKeyValid) {
        res.status(400).send(
            `The authors must have the following properties : ${authorProperties}`
        );
        return;
    }

    if (isReqKeyValid && keysLength) {
        const authorResource = await readResourceAuthors();
        newAuthor.id = await generateId();
        authorResource.push(newAuthor);
        writeResource(authorResource);
        res.send(newAuthor);
    }
});

//PUT authors/:id
app.put("/authors/:id", async (req, res) => {
    const authorToUpdate = req.body;
    const { id } = req.params;

    const authorsResource = await readResourceAuthors();
    const authorResourceId = authorsResource.map((author) => author.id);

    const keysLength = Object.keys(authorToUpdate).length === 4;
    if (!keysLength) {
        res.status(400).send("The author has to have 4 properties");
        return;
    }

    const isReqKeyValid = authorProperties.every(
        (key) => authorToUpdate[key] !== undefined
    );
    if (!isReqKeyValid) {
        res.status(400).send(
            `The authors must have the following properties : ${authorProperties}`
        );
        return;
    }

    if (authorResourceId.includes(Number(id)) && isReqKeyValid && keysLength) {
        authorToUpdate.id = Number(id);
        authorsResource[id] = authorToUpdate;
        writeResource(authorsResource);
        res.send(authorToUpdate);
    } else {
        res.status(404).send(`There is no Author with the id ${id}. `);
    }
});

//PATCH  authors/:id
app.patch("/authors/:id", async (req, res) => {
    const newAuthorProperties = req.body;
    const { id } = req.params;
    const authorsResource = await readResourceAuthors();
    const authorResourceId = authorsResource.map((author) => author.id);

    const keysLength = Object.keys(newAuthorProperties).length;
    if (keysLength > 3) {
        res.status(400).send(
            "The author has to have less than 4 properties, if you put 4 properties use a PUT REQUEST"
        );
        return;
    }

    let isPropertiesValid = true;
    Object.keys(newAuthorProperties).forEach((key) => {
        isPropertiesValid &= authorProperties.includes(key);
    });
    if (!isPropertiesValid) {
        res.status(400).send(
            `The authors must have the following properties : ${authorProperties}`
        );
        return;
    }

    if (
        authorResourceId.includes(Number(id)) &&
        isPropertiesValid &&
        keysLength
    ) {
        newAuthorProperties.id = Number(id);
        authorsResource[id] = {
            ...authorsResource[id],
            ...newAuthorProperties,
        };
        writeResource(authorsResource);
        res.send(authorsResource[id]);
    } else {
        res.status(404).send(`There is no Author with the id ${id}. `);
    }
});

//DELETE authors/:id
app.delete("/authors/:id", async (req, res) => {
    const { id } = req.params;
    const authorsResource = await readResourceAuthors();
    const idAuthorsResource = authorsResource.filter(
        (author) => Number(author.id) === Number(id)
    );
    if (idAuthorsResource.length > 0) {
        authorsResource.splice(id, 1);
        writeResource(authorsResource);
        res.send(authorsResource);
    } else {
        res.status(404).send(`Author with id ${idAuthorRequest} not found`);
    }
});
