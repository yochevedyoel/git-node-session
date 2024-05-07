const User = require("../models/User")
const Product = require("../models/Product")
const jwt = require('jsonwebtoken')
const Enum = ['custumer', 'admin']
const mongoose = require('mongoose')

const getAllUsers = async (req, res) => {
    if (req.user.role === 'admin') {
        const users = await User.find({}, { password: 0 }).lean()
        if (!users?.length)
            return res.status(400).json("not found user")
        res.json(users)
    }
    else
        return res.status(401).json({ message: 'not athourized to craete product' })
}

const createNewUser = async (req, res) => {


    const { userName, password, name, email, phone } = req.body

    if (!userName || !password || !email) {
        return res.status(400).json(" username and password and name and email is required")
    }

    // if (!Enum.find(e => e === role))
    //     return res.status(400).json(` role must be one of: ${Enum.map(e => e)}`)
    const userarr = await User.find({}, { password: 0 }).lean()
    let arr = userarr.map(u => u.userName === userName)
    if ((arr).find(a => a === true)) {
        return res.status(400).json("you already have such username")
    }
    const user = await User.create({ userName, password, name, email, phone })
    res.json(user)
}
// const getUser= async (req, res) => {
//     const  _id  = req.user._id
//     console.log(_id," id get user *****************************************************************")
//     const user = await User.findById({ _id }, { password: 0 }).lean()
//     if (!user) {
//         return res.status(400).json(" not found user")
//     }
//     res.json(user)
// }
const getUserById = async (req, res) => {
    const { _id } = req.params
    console.log(_id)
    const user = await User.findById({ _id }, { password: 0 }).lean()
    if (!user) {
        return res.status(400).json(" not found user")
    }
    res.json(user)
}

const updateUser = async (req, res) => {
    console.log("ggggggggggggggggggggggggggggggggggggggg");
    const { _id, userName, password, name, email, phone, role, cart } = req.body

    if (req.user.role === 'admin') {

        if (!_id || !userName || !email)
            return res.status(400).json(" name and id is required")
    }
    else {
        if (!_id || !userName || !email || !password)
            return res.status(400).json(" name and id is required")
    }
    const user = await User.findById(_id, { password: 0 }).exec()
    if (!user)
        return res.status(400).json(" user not found")
    user.userName = userName ? userName : user.userName
    // user.password =  p?email:user.email
    user.name = name ? name : user.name
    user.email = email ? email : user.email
    user.phone = phone ? phone : user.phone
    user.role = role ? role : user.role
    user.cart = cart ? cart : user.cart
    console.log(user);
    const myUpdateuser = await user.save()
    const userInfo = {
        _id: user._id, name: user.name,
        role: user.role, userName: user.userName, phone: user.phone,
        email: user.email
    }
    const accesToken = await jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accesToken })
}


const addToCart = async (req, res) => {

    const { prod, qty } = req.body
    console.log("a " + qty);
    if (!prod)
        return res.status(400).json("fieldes required")
    const user = await User.findById(req.user._id, { password: 0 }).exec()
    if (!user)
        return res.status(400).json("user not found")
    const validProd = new mongoose.Types.ObjectId(prod)
    let arr = []
    if (user.cart.find(p => p.prod.equals(validProd))) {
        if (Number(qty) > 1)
            user.cart = user.cart.map(p => p.prod.equals(validProd) ? { prod: validProd, qty: Number(qty) } : p)
        else user.cart = user.cart.map(p => p.prod.equals(validProd) ? { prod: validProd, qty: p.qty + 1 } : p)
    }
    else user.cart.push({ prod: validProd, qty: 1 })
    console.log(user.cart);
    // if (from=="addOne") {
    //     console.log("addOne");
    //     if (user.cart.find(p => p.prod.equals(validProd)))
    //         user.cart = user.cart.map(p => p.prod.equals(validProd) ? { prod: validProd, qty: p.qty + 1 } : p)

    //     else
    //         user.cart.push({ prod: validProd, qty: 1 })
    // }
    // else {
    //     if (user.cart.find(p => p.prod.equals(validProd)))
    //     {
    //         user.cart = user.cart.map(p => p.prod.equals(validProd) ? { prod: validProd, qty } : p)
    //     }
    //     else
    //         user.cart.push({ prod: validProd, qty })
    // }
    const myUpdateuser = await user.save()
    res.json(myUpdateuser)
}






const getCart = async (req, res) => {
    const user = await User.findById(req.user._id, { password: 0 }).populate('cart.prod').lean()
    if (!user?.cart?.length)
        return res.status(400).json("no cart")
    res.json(user.cart)

}

const deleteUser = async (req, res) => {
    const { _id } = req.params
    const user = await User.findById(_id).exec()
    if (!user)
        return res.status(400).json(" not found user")
    const result = await user.deleteOne()
    res.json(result)

}



module.exports = {
    getAllUsers,
    createNewUser,
    getUserById,
    updateUser,
    deleteUser,
    addToCart,
    getCart
}