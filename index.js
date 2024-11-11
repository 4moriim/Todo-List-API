const express = require("express"); // Chama o framework ExpressJS 
const cors = require("cors"); // Sua função é o servidor aceitar requisições de domínios diferentes
const app = express(); // Declara a variável app que contém a função do expressJS
const port = 3000; // Declara a porta em que o código será executado
const bodyParser = require("body-parser"); // Middleware usado no ExpressJS 
const mysql = require("mysql2"); // Chama o banco de dados MySQL
const dotenv = require("dotenv"); // Chama a ferramenta que carrega as variáveis de ambiente

dotenv.config(); // Carrega variáveis de ambiente, que no caso está no arquivo ".env"

app.use(cors());
app.use(bodyParser.json()); // Middleware para parsear o corpo das requisições

// Cria a conexão com o banco de dados MySQL
const database = mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'todo_api',
});

//Verifica se a conexão do banco de dados foi bem sucedida ou não
database.connect((error) => {
    if (error) {
        console.error("Erro ao conectar-se com o banco de dados: ");
        return;
    }
    console.log("Conectado ao banco de dados");
});

// Função que transforma o valor de is_completed em booleano
function transformIsCompleted(results) {
    return results.map(task => ({
        ...task,
        is_completed: task.is_completed === 1, 
    }));
}

// Endpoints
app.get("/", (request, response) => {
    response.send("Lista de tarefas home page");
});

// Endpoint para obter as tarefas do usuário
app.get("/todos", (request, response) => {
    database.query('SELECT * FROM tasks', (error, results) => {
        if (error) {
            return response.json({ error: error.message }); //Mensagem de erro
        }
        const transformedResults = transformIsCompleted(results); // Aplica a transformação para booleano
        response.json(transformedResults); // Retorna com valores booleanos
    });
});

// Endpoint para obter uma tarefa específica
app.get("/todos/:id", (request, response) => {
    const { id } = request.params;
    database.query('SELECT * FROM tasks WHERE id = ?', [id], (error, results) => {
        if (error) {
            return response.json({ error: error.message }); // Mensagem de erro
        }
        if (results.length > 0) {
            const transformedResult = transformIsCompleted(results); // Aplica a transformação para booleano
            response.json(transformedResult[0]); // Retorna a tarefa transformada
        } else {
            response.json({ message: "Tarefa não encontrada" }); //Caso a tarefa não apareça
        }
    });
});

// Endpoint para adicionar uma nova tarefa
app.post("/todos", (request, response) => {
    const { title, is_completed } = request.body;
    
    // Garantir que is_completed seja um booleano (1 ou 0)
    const completedValue = is_completed ? 1 : 0;
    
    const query = 'INSERT INTO tasks (title, is_completed) VALUES (?, ?)';

    database.query(query, [title, completedValue], (error, result) => {
        if (error) {
            return response.json({ error: error.message }); // Mensagem de erro
        }
        res.json({
            id: result.insertId, 
            title, 
            is_completed // Retorna como booleano (true ou false)
        });
    });
});

// Endpoint para atualizar uma tarefa
app.put("/todos/:id", (request, response) => {
    const { id } = request.params;
    const { title, is_completed } = request.body;
    
    const completedValue = is_completed ? 1 : 0;

    const query = 'UPDATE tasks SET title = ?, is_completed = ? WHERE id = ?';

    database.query(query, [title, completedValue, id], (error, result) => {
        if (error) {
            return response.json({ error: error.message });
        }
        if (result.affectedRows > 0) {
            response.json({
                id, 
                title, 
                is_completed: is_completed // Retorna como booleano (true ou false)
            });
        } else {
            response.json({ message: "Tarefa não encontrada" }); //Caso não seja encontrada a tarefa
        }
    });
});

// Endpoint para deletar uma tarefa
app.delete("/todos/:id", (request, response) => {
    const { id } = request.params;
    const query = 'DELETE FROM tasks WHERE id = ?'; //Manipula um dado do banco MySQL, deletando-o 

    database.query(query, [id], (error, result) => {
        if (error) {
            return response.json({ error: error.message });
        }
        if (result.affectedRows > 0) {
            response.json({ message: "Tarefa deletada com sucesso" }); 
        } else {
            response.json({ message: "Tarefa não encontrada" });
        }
    });
});

app.listen(port, () => {
    console.log(`App está rodando na porta ${port}`); //Mostra em qual porta o código está rodando
});













