export default {
    timer:null,
    init(){
       
        this.insertItems()
        var trash = document.querySelector(".emptyBasket");
        trash.onmouseover   = this.emptyBasketPopupOn;
        trash.onmouseout    = this.emptyBasketPopupOff;
        trash.onclick = this.clearBasket.bind(this);
       //this.clearBasket();       
    },
    addBasket(button){   
        var trash = document.querySelector(".emptyBasket");
        trash.style="display:block";
        var productId       = button.dataset.productId;
        var productName     = button.dataset.name;
        var productCount    = parseInt(document.querySelector("input[data-product-id='"+productId+"']").value); 
        var productPrice    = parseFloat(button.dataset.price.replace(",","."))

        var newItem = {
                            [productId]: {
                                "name":productName,
                                "price":productPrice,
                                "originalPrice":productPrice,
                                "count":productCount
                            }
                        };      
              
        if(localStorage.getItem("basket")){
            var basket = JSON.parse(localStorage.getItem("basket"));
        }
       
        var exists = 0;
        if(basket){
            var keys = Object.keys(basket);
            keys.forEach((id) => {               
                if(id === productId) { 
                    exists = 1;   
                    basket[id]["price"] = productCount*productPrice + parseFloat(basket[id]["price"]);
                    basket[id]["count"] = productCount + parseFloat(basket[id]["count"])
                } 
            });     
            if(exists == 0) {                
                basket[productId] = {
                    "name":productName,
                    "price":productPrice*productCount,
                    "count":productCount,
                    "originalPrice":productPrice
                }                
            }    
            localStorage.setItem("basket",JSON.stringify(basket));             
        } else {
            localStorage.setItem("basket",JSON.stringify(newItem));
        }
        this.insertItems();      
    },
    clearBasket(){        
        localStorage.setItem("basket","");
        this.insertItems();
        var trash = document.querySelector(".emptyBasket");
        trash.style="display:none";
    },
    deleteItem(button){
        var basket =  JSON.parse(localStorage.getItem("basket"));       
        delete basket[button.dataset.productId];
        localStorage.setItem("basket",JSON.stringify(basket));
        this.insertItems();

    },changeCount(input){
        var that = this
        clearTimeout(this.timer);   
        var basket =  JSON.parse(localStorage.getItem("basket")); 
        var productId = input.dataset.productId;
       
        this.timer =  setTimeout(function() {
            if(input.value == 0 || input.value == "" || input.value >=999 || isNaN(input.value)){
                input.value = 1;
            }
            basket[productId]["count"] = input.value; 
            basket[productId]["price"] = input.value*parseInt(basket[productId]["originalPrice"])     
            localStorage.setItem("basket",JSON.stringify(basket));
            that.insertItems();     
         },300);
          
    },
    insertItems(){
        var basketItemList  = document.querySelector(".items");
        var itemExists = document.querySelectorAll(".exists")
        var emptyList = document.querySelector(".no-item");
        
        if(localStorage.getItem("basket")){
            var basket  = JSON.parse(localStorage.getItem("basket"));
        
            var keys            = Object.keys(basket);
            var total = document.querySelector(".totalPrice");
            var totalPrice = 0;
            
            var tbodyItem =""
            
            keys.forEach((id) => {               
                tbodyItem += `<tr>
                                <td class="item-name">
                                        <a>${basket[id]["name"]}</a>
                                        <span></span>
                                    </td>
                                <td class = "item-count">                              
                                    <input type="text"  data-product-id = "${id}" name="txtCount" class="txtCount ys-input-mini" title="Ürün Adedi" value="${basket[id]["count"]}">                                
                                </td>                           
                                <td class="item-price">
                                    ${basket[id]["price"]} TL
                                </td>
                                <td class ="item-actions">
                                    <button class="rmv-basket ys-pullRight" data-product-id = "${id}" ><i  class="fas fa-times"></i></button>
                                </td>
                            </tr>`;      
                totalPrice += parseFloat(basket[id]["price"]);        
            });     
            total.innerHTML = totalPrice + " TL";
            basketItemList.innerHTML = tbodyItem;  
            itemExists.forEach((el) => {el.style  = "display:block"});     
            emptyList.style ="display:none";
            var trash = document.querySelector(".emptyBasket");
            trash.style="display:block";
        } else {
            basketItemList.innerHTML = "";
            console.log("burdayım")
            itemExists.forEach((el) => {el.style  = "display:none"});     
            emptyList.style ="display:block" ;
        }

        var deleteButtons = document.querySelectorAll(".rmv-basket");   
        deleteButtons.forEach(element => element.onclick = this.deleteItem.bind(this,element));
        var productCounts = document.querySelectorAll(".txtCount");          
        productCounts.forEach(element => element.onkeyup = this.changeCount.bind(this,element));
        
       
       
    },
    emptyBasketPopupOn(){
        var popup = document.getElementById("emptyBasket");
        popup.classList.add("show");
    },
    emptyBasketPopupOff(){
        var popup = document.getElementById("emptyBasket");
        
        popup.classList.remove("show");
    }
   
}