const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
})


blogsRouter.get('/:id', async (request, response) => {
    const blogs = await Blog.findById(request.param.id)
    if (blogs) {
        response.json(blogs)
    } else {
        response.status(404).end()
    }
})

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}


blogsRouter.delete('/:id', async (request, response) => {
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() === user.id.toString()) {
        const deletedblog = await Blog.findByIdAndRemove(blog.id)
        response.json(deletedblog)
    } else {
        response.status(400).json({ error: "Unauthorized Deletion" })
    }
    response.status(204).end()
})



blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    if (body.title === null) {
        return response.status(400).json({
            error: 'title is missing'
        })
    } else if (body.url === null) {
        return response.status(400).json({
            error: 'url is missing'
        })
    }
    const blogs = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id
    })

    const savedBlog = await blogs.save()
    user.blogs = user.blogs.concat(savedBlog.id)
    await user.save()
    response.json(savedBlog)
})



blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const updated_blogs = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updated_blogs)
})

module.exports = blogsRouter