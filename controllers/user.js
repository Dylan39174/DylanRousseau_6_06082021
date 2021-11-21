const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const User = require('../models/user');

const passwordSchema = new passwordValidator;

passwordSchema
.is().min(4)
.is().max(100)
.has().uppercase()
.has().lowercase()
.has().digits(1)
.has().not().spaces()

exports.signup = (req, res, next) => {
  
  if(emailValidator.validate(req.body.email) == false){
    return res.status(401).json({Message: 'Adresse email invalide !'});
  }
  if(passwordSchema.validate(req.body.password) == false){
    return res.status(401).json({Message: 'Mot de passe non sécurisé !'});
  }
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      })
      user.save()
        .then(() => res.status(201).json({Message: 'Utilisateur créé !'}))
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
  User.findOne({email: req.body.email})
    .then(user => {
      if(!user){
        return res.status(404).json({Message: 'Utilisateur non trouvé !'});
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if(!valid){
            return res.status(401).json({Message: 'Identifiant incorrect !'});
          }
          return res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              {userId: user._id},
              'RANDOM_TOKEN_SECRET',
              {expiresIn: '24h'}
            )
          });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};