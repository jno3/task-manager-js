const express = require('express')
const { ObjectId } = require('mongodb')
const PORT = 5000
const app = express()
const client = require('./.env/conn')

app.use(express.static('./public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

async function createTask(client, newTask){
    try{
        await client.connect()
        await client.db("task_manager_db")
        .collection("tasks")
        .insertOne(newTask)
    }
    catch(error){
        console.error(error)
    }
    finally{
        await client.close()
    }
}

app.post('/api/v1/tasks', (req, res) => {
    createTask(client, req.body).then(()=>{
        return res.status(200).json({success: true, data: req.body})
    }).catch((err) => {
        return res.status(400)
    })
})

async function getAllTasks(client){
    try{
        await client.connect()
        const cursor = await client.db("task_manager_db")
        .collection("tasks")
        .find({}, {task: 1, complete: 1})

        const results = await cursor.toArray()
        return results
    }
    catch(error){
        console.error(error)
    }
    finally{
        await client.close()
    }
}

app.get('/api/v1/tasks', (req, res) => {
    getAllTasks(client).then((results) => {
        return res.status(200).json({success: true, data: results})
    }).catch((error) => {
        console.log(error)
        return res.status(501).send("couldn't get the values from the database")
    })
})

async function deleteTask(client, taskId){
    try{
        await client.connect()
        const cursor = await client.db("task_manager_db")
        .collection("tasks")
        .deleteOne({_id: ObjectId(taskId)})
    }
    catch(error){
        console.error(error)
    }
    finally{
        await client.close()
    }
}

app.delete('/api/v1/tasks/:id', (req, res) => {
    deleteTask(client, req.params.id).then(()=>{
        return res.status(200).json({success: true, data: req.params.id})
    }).catch((error) => {
        console.log(error)
        return res.status(501).send(`couldn't get the id ${req.params.id} from the database`)
    })
})

app.listen(PORT, () => {
    console.log(`the server is listening on port ${PORT}`)
})

module.exports = PORT