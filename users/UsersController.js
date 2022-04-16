const express = require('express');
const router = express.Router();
const User = require('./User')
const bcrypt = require('bcryptjs');
const adminAuth = require('../middlewares/adminAuth');

router.get('/admin/users', adminAuth,(req, res) => {
    User.findAll().then(users => {
        res.render('admin/users/index', { users: users });
    })
})

router.get('/admin/users/create',(req, res) => {
    res.render('admin/users/create')
})

router.post('/users/create', adminAuth,(req, res) => {
    let email = req.body.email
    let password = req.body.password

    User.findOne({ where: { email: email } }).then(user => {
        if(user == undefined){
            let salt = bcrypt.genSaltSync(10)
            let hash = bcrypt.hashSync(password, salt)

            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect('/admin/users')
            }).catch(err => {
                res.send('Erro ao cadastrar usuário')
            })

        }else{
                res.redirect('/admin/users/create')
        }
    })

})

router.post('/users/delete', adminAuth,(req, res) => {
    let id = req.body.id
    if(id != undefined){
        User.destroy({
            where: { id: id}
        }).then(() => {
            res.redirect('/admin/users')
        }).catch(err => {
            res.send('Erro ao deletar usuário')
        })
    }else {
        res.redirect('/admin/users')
    }
})

router.get('/login', (req, res) => {
    res.render('admin/users/login')
})

router.post('/authenticate', (req, res) => {
    let email = req.body.email
    let password = req.body.password

    User.findOne({ 
        where: { email: email } 
    }).then(user => {
        if(user != undefined){
            let correct = bcrypt.compareSync(password, user.password)
            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect('/admin/categories') 
            }else{
                res.redirect('/login')
            }
        }else {
            res.redirect('/login')
        }
    })
})

router.post('/logout', (req, res) => {
    req.session.user = undefined
    res.redirect('/')
})

router.get('/verificalogin', (req, res) => {
    if(req.session.user != undefined){
        res.redirect('/admin/categories')
    }else{
        res.redirect('/login')
    }
})

module.exports = router;