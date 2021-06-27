const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
    allUsers = await User.find({}).populate('blog', { url: 1, title: 1, author: 1, id: 1 })
    if (allUsers) {
        response.json(allUsers)
    } else {
        response.status(404)
    }
})


usersRouter.post('/', async (request, response) => {
    const body = request.body
    if (body.username.length < 3) {
        response.status(400).json({ error: 'username must be atleast 3 characters long' })
    } else if (body.password.length < 3) {
        response.status(400).json({ error: 'passsword must be atleast 3 characters long' })
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(body.password, salt)
    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await user.save()
    response.json(savedUser)
})

module.exports = usersRouter