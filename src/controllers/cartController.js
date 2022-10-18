const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel=require("../models/userModel");
const {
    isValidObjectId,
    isValidRequestBody,
} = require("../validators/validation");

//============================CREATE CART===================================

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId;
        let data = req.body;
        let { quantity, productId } = data;
        let cartId = req.body.cartId;

        if (!isValidRequestBody(data))
            return res
                .status(400)
                .send({ status: false, message: "Please provide data" });

        if (!isValidObjectId)
            return res
                .status(400)
                .send({ status: false, message: "Not a valid productId" });


        const product = await productModel.findOne({
            _id: productId,
            isDeleted: false,
        });

        if (!product)
            return res
                .status(404)
                .send({ status: false, message: "Product not found" });

        let cartAvaiable = await cartModel.findOne({ userId: userId });
        if (cartAvaiable) {
            if (!quantity)quantity= 1;
            let items = cartAvaiable.items;

            for (let i = 0; i < items.length; i++) {
                if (items[i].productId.toString()==productId) {
                    items[i].quantity++;

                    let updateData = {
                        userId: userId,
                        items: items,
                        totalPrice: (cartAvaiable.totalPrice += product.price),
                        totalItems: items.length,
                    };
                    let cart = await cartModel.findOneAndUpdate({userId:userId},{$set:updateData},{new:true})
                    return res
                        .status(201)
                        .send({ status: true, message: "Created", data: cart });
                } 
            }
                    let itemArray = { productId: productId, quantity: quantity };
                    items.push(itemArray );

                    let updateData = {
                        userId: userId,
                        items: items,
                        totalPrice: (cartAvaiable.totalPrice += product.price * quantity),
                        totalItems: items.length,
                    };
                    let cart = await cartModel.findOneAndUpdate({userId:userId},{$set:updateData},{new:true})
                    return res
                        .status(201)
                        .send({ status: true, message: "Created", data: cart });
        
        }

        if (!cartAvaiable) {
            let pPrice = product.price;
            if (!quantity) quantity = 1

            let itemArray = [{ productId: productId, quantity: quantity }];
            var finalCart = {
                userId: userId,
                items: itemArray,
                totalPrice: pPrice * quantity,
                totalItems: 1
            };
        }
        let createCart = await cartModel.create(finalCart);
        return res.status(201).send({
            status: true,
            message: "cart successfully created",
            data: createCart,
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

//============================GET CART==============================================

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId;
        const checkData = await cartModel.findOne({ userId });

        if (!checkData)
            return res
                .status(400)
                .send({ status: false, message: "Cart not found of this USER" });

        if (checkData.items.length == 0)
            return res
                .status(404)
                .send({ status: false, message: "Cart empty", data: checkData });

        return res
            .status(200)
            .send({ status: true, message: "Success", data: checkData });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId;
        const checkData = await cartModel.findOne({ userId:userId });

        if (!checkData)
            return res
                .status(400)
                .send({ status: false, message: "Cart not found of this USER" });

        if (checkData.items.length == 0)
            return res
                .status(404)
                .send({ status: false, message: "Item already Deleted" });

        const deleteCart = await cartModel.findOneAndUpdate(
            { _id: checkData._id },
            { items: [], totalPrice: 0, totalItems: 0 },
            { new: true }
        );
        return res.status(200).send({
            status: true,
            message: "successfully deleted",
            data: deleteCart,
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const updateCart = async (req, res) => {
    try {
      let data = req.body;
      let userId = req.params.userId;
      let { cartId, productId, removeProduct } = data;
  
      //body empty
      if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Provide the data" });
  
  
      //Checking User
      //if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid UserId" });
      //user authorization
      //if (userId != req.userId) return res.status(403).send({ status: false, message: "Unauthorized Access" });
      //user exist or not
      //let userExist = await userModel.findById(userId);
      //if (!userExist) return res.status(404).send({ status: false, message: "No User Found With this Id" });
  
  
      //product validation
      if (!productId) return res.status(400).send({ status: false, message: "Provide the ProductId" });
  
      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid ProductId" });
      //product exist or not
      let product = await productModel.findById(productId);
      if (!product) return res.status(404).send({ status: false, message: `No Product Found With this ${productId}`, });
  
  
      //removeProduct key validation
      if (!(removeProduct || removeProduct == 0)) return res.status(400).send({ status: false, message: "Provide the removeProduct Key" });
  
  
      //if (!(typeof removeProduct == "number")) return res.status(400).send({ status: false, message: "Provide the removeProduct Key Should be in number only" });
  
      if (!(removeProduct == 1 || removeProduct == 0)) return res.status(400).send({ status: false, message: "RemoveProduct Key value Should be less than quantity and can't accept letters"});
  
      //cardId validation
      if (!cartId) return res.status(400).send({ status: false, message: "Provide the cartId" });
  
      if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Invalid cartId" });
  
  
      let cartExist = await cartModel.findById(cartId);
  
      let flag = false;
  
      if (cartExist) {
        if (cartExist.items.length == 0) {
          return res
            .status(400)
            .send({ status: false, message: "There is No Item in This Cart" });
        }
  
        for (let i = 0; i < cartExist.items.length; i++) {
          if (
            cartExist.items[i].productId == productId &&
            cartExist.items[i].quantity > 0
          ) {
            if (removeProduct == 1) {
              cartExist.items[i].quantity -= 1;
              cartExist.totalPrice -= product.price;
              if (cartExist.items[i].quantity == 0) {
                cartExist.items.splice(i, 1);
              }
            } else if (removeProduct == 0) {
              cartExist.totalPrice =
                cartExist.totalPrice -
                cartExist.items[i].quantity * product.price;
              cartExist.items.splice(i, 1);
            }
            flag = true;
  
            //updation part
            cartExist.totalItems = cartExist.items.length;
            let result = await cartModel.findOneAndUpdate(
              { _id: cartId },
              { $set: cartExist },
              { new: true }
            );
            return res.status(200).send({
              status: true,
              message: "Your Cart is Updated",
              data: result,
            });
          }
        }
        if (flag == false) {
          return res.status(404).send({
            status: false,
            message: `There is no Product with this ${productId} or exist in ur cart`,
          });
        }
      } else {
        return res.status(404).send({
          status: false,
          message: `There is No Cart with id  ${cartId} exist`,
        });
      }
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };

module.exports = { createCart, getCart, deleteCart ,updateCart};
