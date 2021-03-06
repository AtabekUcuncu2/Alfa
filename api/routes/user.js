var ObjectId = require('mongodb').ObjectId; 


module.exports =   {    
    init(app,db,sessions) {        
        app.post('/start-session', (req, res) => {
           
            res.set('Content-Type', 'application/json');
            res.status(200);
            var token = require('crypto').randomBytes(16).toString('hex');
            var task = req.body.task;
            console.log(req.body, "req body bura")
            if (task == "user") {
                var name = req.body.name;
                var surname = req.body.surname;
                var createdId = req.body.userId;
                var databaseId = req.body.databaseId;
                var user = {
                    databaseId: databaseId,
                    username: name,
                    surname: surname,
                    basket: {}
                };

                //user["basket"]  = sessions[createdId]["basket"];
                sessions[createdId] = user;
            
                res.send({ token: token, username: name, surname: surname });
            }
            if (task == "guest") {
                var user = {
                    basket: {}
                };
                sessions[token] = user;
                console.log(sessions, "session  bura")

                res.send({ token: token });
            }

        });

        app.post('/check-session', (req, res) => {
            res.set('Content-Type', 'application/json');
            res.status(200);
            userId = req.body.userId;
            res.send(sessions[userId]);
        });

        app.post('/get-session-data', (req, res) => {
            res.set('Content-Type', 'application/json');
            res.status(200);
            res.send(sessions[userId])
        });

        app.post('/check-user', (req, res) => {
            res.set('Content-Type', 'application/json');

            res.status(200);
            var email = req.body.email;
            var pass = req.body.password;

            var collection = db.collection('users');
            var userEmail = collection.find({ email: email }).toArray(function (err, result) {
                
                if (err) throw err;
                if (result.length > 0) {
                    var userPassword = collection.find({ email: email, password: pass }).toArray(function (err, result) {
                        if (result.length > 0) {
                            res.send({ message: "ok", username: result[0].Name, surname: result[0].Surname ,databaseId:result[0]._id});
                        } else {
                            res.send({ message: "password" });
                        }
                    });
                } else {
                    res.send({ message: "user" });
                }
            });

        });

        app.post('/add-user', (req, res) => {
            res.set('Content-Type', 'application/json');
            res.status(200);

            var email = req.body.email;
            var pass = req.body.password;
            var username = req.body.username;
            var surname = req.body.surname;

            var userCollection = db.collection('users');
            var user = userCollection.find({ email: email }).toArray(function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    res.send({ message: "Email kullanımda" });
                } else {
                    userCollection.insert({ email: email, password: pass, Name: username, Surname: surname,Addresses:[],Cuzdan:"" });
                    res.send({ message: "Kayıt başarılı!" });
                }
            });
        });

        app.post('/logout', (req, res) => {
            res.set('Content-Type', 'application/json');
            res.status(200);
            var userId = req.body.userId;
            delete sessions[userId];
            res.send({});
        });

        app.post('/check-basket-validity',(req,res) => {
            // console.log(req.body,"burzsı")
            res.set('Content-Type', 'application/json'); 
            res.status(200);
            
            var userId = req.body.userId;
            var basket = sessions[userId].basket;
            var basket = req.body.basket;
           
            
            var inValid = {};
            var invalidExists = 0;
            var collection = db.collection('menus');
            var menu = collection.find({}).toArray(function(err, result) {
              if (err) throw err;    
              if  (result.length > 0)  {
                  result.forEach(element => element.Products.forEach(Product => { 
                      var productId = Product["ProductId"];
                      if (basket[productId]) {
                          var dataBasePrice = parseFloat(Product["ListPrice"]);
                          var basketPrice = parseFloat(basket[productId].price);
                          var basketProductCount = parseFloat(basket[productId].count);
                          var validPrice = dataBasePrice*basketProductCount;
                          if(validPrice != basketPrice) {            
                            invalidExists = 1;
                            inValid[productId] = validPrice;                 
                          };    
                      };
                  }));       
          
                  if (invalidExists == 0) {
                    res.send({message:"valid"});
                  } else {
                    
                    
                    res.send(inValid);        
                  }
          
              }
            });
           
        });

        app.post('/add-delete-basket',(req,res) =>{
            res.set('Content-Type', 'application/json');
            res.status(200); 
            console.log("burdayım")
            var userId = req.body.userId;    
            var task = req.body.task;
            
            if (task == "add") {
              sessions[userId]["basket"] = req.body.basket;    
            } 
            if (task == "clear") {
              
              sessions[userId]["basket"] = {};
            }    
         
            console.log(sessions)
           
            res.send({});
        });
        
        app.post('/get-addresses',(req,res)=>{
            res.set('Content-Type', 'application/json');
            res.status(200); 

            var userToken       = req.body.token;
            var databaseId      = sessions[userToken].databaseId;   
            var userCollection  = db.collection('users');   
            var o_id            = new ObjectId(databaseId);

            var userInfo = userCollection.find({_id:o_id}).toArray(function(err, result) {
                if (err) throw err;
                var addresses = result[0].Addresses
                res.send({addresses:addresses});               
            });
        
        });

        app.post('/add-address',(req,res)=>{
            res.set('Content-Type', 'application/json');
            res.status(200);
            
            var id = sessions[req.body.token].databaseId;
           
            var o_id = new ObjectId(id);
           
            var Name        = req.body.address.Ad;
            var Surname     = req.body.address.Soyad;
            var AddressType = req.body.address["Adres Adı"];
            var cell        = req.body.address["Telefon Numarası"];
            var cell2       = req.body.address["TelNo2"];
            var area        = req.body.address.Semt;
            var address     = req.body.address.Adres;
            var addressInfo = req.body.address["Adres Tarifi"];
            var ID =  '_' + Math.random().toString(36).substr(2, 9);
        
            console.log(ID);
            var userCollection = db.collection("users");
            userCollection.update({ _id:o_id},{ $push :
                                                        { 
                                                            Addresses : 
                                                                {       
                                                                    ID,                                                          
                                                                    Name,
                                                                    Surname,
                                                                    address,
                                                                    AddressType,                                                                   
                                                                    cell,
                                                                    cell2,
                                                                    area,
                                                                    addressInfo
                                                                    
                                                                }
                                                            }
                                                    })
            .then( res.send({message:"ok"}));
           
           
        });
          
        app.post('/delete-address',(req,res)=>{
            res.set('Content-Type', 'application/json');
            res.status(200);
            var userToken = req.body.token;            
            var databaseId      = sessions[userToken].databaseId;   
            var userCollection  = db.collection('users');   
            var o_id            = new ObjectId(databaseId);
            var addressID = req.body.addressID;
            userCollection.update({_id:o_id},{$pull: {Addresses:{ID:addressID}}});
            res.send({});

        });
    }
}