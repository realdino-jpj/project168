var uid = null

AFRAME.registerComponent("markerhandler", {
    init: async function () {
  
    // if user id is null then ask for an id
      if (uid === null) {
        this.askUserId();
      }

      
    //get the dishes collection from firestore database
    var toys = await this.getToys();

    // if marker if found then countinue 
      this.el.addEventListener("markerFound", () => {
        // if uid is not null then continue
        if (uid !== null) {
          var markerId = this.el.id;
          this.handleMarkerFound(toys, markerId);
        }
      });
  
      this.el.addEventListener("markerLost", () => {
        console.log("marker is lost")
        this.handleMarkerLost();
      });
    },

    // ask the user for an id and update the uid from null to the given id number
    askUserId: function() {
      var iconUrl =
        "https://raw.githubusercontent.com/whitehatjr/ar-toy-store-assets/master/toy-shop.png";
  
      swal({
        title: "Welcome to Toy Shop!!",
        icon: iconUrl,
        content: {
          element: "input",
          attributes: {
            placeholder: "Type your uid Ex:( U01 )"
          }
        }
      }).then(inputValue => {
        uid = inputValue;
      });
    },

    handleMarkerFound: function (toys,markerId) {

      var toy = toys.filter(toy => toy.id === markerId)[0];

      var x = Math.random(0,10)

      if(x>8){
        swal({
          icon: "warning",
          title: dish.dish_name.toUpperCase(),
          text: "This toy is not available now!!!",
          timer: 2500,
          buttons: false
        });
      }else{

      // Changing Model scale to initial scale
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);

      // make model visible
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("visible", true);

      // make mian plane Container visible
      var mainPlane = document.querySelector(`#main-plane-${toy.id}`);
      mainPlane.setAttribute("visible", true);

      // selecting buttons
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";
  
      var summaryButton = document.getElementById("order-summary-button");
      var orderButtton = document.getElementById("order-button");
  
      // Handling Click Events
      summaryButton.addEventListener("click", function () {
        swal({
          icon: "warning",
          title: "order summary",
          text: "Work In Progress"
        });
      });
  
      orderButtton.addEventListener("click", () => {

        uid = uid.toUpperCase();
        this.handleOrder(uid, toy);
        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order!",
          text: "Your order will be delievered at your selected address"
        });
      });
    }
    },
  
    handleMarkerLost: function () {
      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "none";
    },

    handleOrder: function(uid, toy) {
      // Reading current UID order details
      firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .get()
        .then(doc => {
          var details = doc.data();
  
          if (details["current_orders"][toy.id]) {
            // Increasing Current Quantity
            details["current_orders"][toy.id]["quantity"] += 1;
  
            //Calculating Subtotal of item
            var currentQuantity = details["current_orders"][toy.id]["quantity"];
  
            details["current_orders"][toy.id]["subtotal"] =
              currentQuantity * toy.price;
          } else {
            details["current_orders"][toy.id] = {
              item: toy.toy_name,
              price: toy.price,
              quantity: 1,
              subtotal: toy.price * 1
            };
          }
  
          details.total_bill += toy.price;
  
          // Updating Db
          firebase
            .firestore()
            .collection("users")
            .doc(doc.id)
            .update(details);
        });
    },

    getToys: async function () {
      return await firebase
        .firestore()
        .collection("toys")
        .get()
        .then(snap => {
          return snap.docs.map(doc => doc.data());
        });
    }
  });
  