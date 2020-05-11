const CARDS_INFO = {
    VISA : {
        CARDNAME : "Visa",
        REGEX : "^4[0-9]{12}(?:[0-9]{3})?$",
        CARDLENGTH : 16,
        ICON : "assets/icons/visa.png",
        CARD_COLOR: ["#5d4148","#d8a1b8"]
    },
    MASTER : {
        CARDNAME : "MasterCard",
        REGEX : "^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$",
        CARDLENGTH : 16,
        ICON : "assets/icons/master.png",
        CARD_COLOR: ["#264b6b","#777657"]
    },
    AMEX : {
        CARDNAME : "American Express",
        REGEX : "^3[47][0-9]{13}$",
        CARDLENGTH : 15,
        ICON : "assets/icons/amex.png",
        CARD_COLOR: ["#b50b1b","#171302"]
    },
    DINERS : {
        CARDNAME : "Diners Club",
        REGEX : "^3(?:0[0-5]|[68][0-9])[0-9]{11}$",
        CARDLENGTH : 16,
        ICON : "assets/icons/diners-club.png",
        CARD_COLOR: ["#443032","#d8a1b8"]
    },
    DISCOVER : {
        CARDNAME : "Discover",
        REGEX : "^6(?:011|5[0-9]{2})[0-9]{12}$",
        CARDLENGTH : 16,
        ICON : "assets/icons/discover.png",
        CARD_COLOR: ["#0a7154","#88b59c"]
    },
    JCB : {
        CARDNAME: "JCB",
        REGEX : "^(?:2131|1800|35\d{3})\d{11}$",
        CARDLENGTH:16,
        ICON : "assets/icons/jcb.png",
        CARD_COLOR: ["#08610f","#bbd6d5"]
    }
}

const ERROR_MSG = {
    "EXPIRY_REQUIRED" : "Please enter expiry date",
    "CVV_REQUIRED" : "Please enter CVV",
    "CARDNUMBER_REQUIRED" : "Please enter card number",
    "CARDNAME_REQUIRED" : "Please enter card name",
    "EXPIRY_INVALID" : "Invalid expiry date",
    "CVV_INVALID" : "Invalid CVV",
    "CARDNUMBER_INVALID" : "Invalid Card Number"
}
let savedCards = [];
let localStorage = window.localStorage;

function formatCardNumber(s) {
    return s.toString().replace(/\d{4}(?=.)/g, '$& ');
}

function formatExpiry(s) {
    s = s.replace("/","");
    return s.toString().replace(/\d{2}(?=.)/g, '$&/');
}

function validateExpiry(jumpToNextInput) {
      let expiryEle = document.getElementById('expirydate');
      
      expiryEle.value = formatExpiry(expiryEle.value);
      
      const expiryDate = expiryEle.value.split("/");
      
      if(expiryEle.value.length == 5 && jumpToNextInput) {
          getElementByID('cvv').focus();
      }

      if(validateExpiryMonth(expiryDate[0]) && validateExpiryYear(expiryDate[1]))  {
        const cardExpiryDate = new Date(
            `20${expiryDate[1]}`,
            parseInt(expiryDate[0]) - 1,
            1
        ).getTime();
        if (cardExpiryDate > Date.now()) {
            return true;
        }
      }
      
      
      return false;
}

function validateCardNumber(event, val, jumpToNextInput) {
    // console.log("object", CARDS_INFO.VISA.ICON);
    let validated = false;
    let cardType;
    let ele = document.getElementById('creditno');
    
    if(!val) {
        val = ele.value.split(' ').join('');
    }
    
    ele.value = formatCardNumber(val);

    const cardInfoArray = Object.entries(CARDS_INFO);

    for(let i=0;i<cardInfoArray.length;i++) {
        cardType = cardInfoArray[i][0];
        let cardInfo = cardInfoArray[i][1];
        if(val.match(cardInfo.REGEX)) {
            console.log("true", cardInfo);
            let img = document.getElementById('card-icon-update');
            img.value = cardType;
            img.src = cardInfo.ICON;
            validated = true;
            break;
        }
    }
    if(validated && jumpToNextInput) {
        getElementByID('expirydate').focus();
    }
    return validated;
}

function validatePastedCardNumber() {
    let pasteData = (event.clipboardData || window.clipboardData).getData('text');
    validateCardNumber(event, pasteData);
    // event.returnValue = false;
}

function validateExpiryMonth(expiryMonth) {
      return (
        expiryMonth &&
        expiryMonth.length === 2 &&
        parseInt(expiryMonth) <= 12 &&
        parseInt(expiryMonth) > 0
      );
}

function validateExpiryYear(expiryYear) {
      return (
        expiryYear &&
        expiryYear.length === 2 &&
        parseInt(expiryYear) >=
          parseInt(
            new Date()
              .getFullYear()
              .toString()
              .substr(2)
          ) &&
        parseInt(expiryYear) < 100
      );
}

function validateCVV(jumpToNextInput) {
     let cvv  = document.getElementById('cvv').value;
     if(cvv.length == 3) {
           if(jumpToNextInput)
                getElementByID('cardname').focus();
         return true;
     }
     return false;
}

function checkDigit(event) {
    var code = (event.which) ? event.which : event.keyCode;

    if ((code < 48 || code > 57) && (code > 31)) {
        return false;
    }
    return true;
}

function validateForm() {
    if(!validateCardNumber()) {
         showErrorMsg(ERROR_MSG.CARDNUMBER_INVALID);
         return false;
    }
    if(!validateExpiry()) {
        showErrorMsg(ERROR_MSG.EXPIRY_INVALID);
        return false;
    }
    if(!validateCVV()) {
        showErrorMsg(ERROR_MSG.CVV_INVALID);
        return false;
    }
    return true;
}


function saveCardDetails() {
   let isValidated;
   
   let cardNumber = getDataByID('creditno');
   let expiry = getDataByID('expirydate');
   let cvv = getDataByID('cvv');
   let cardName = getDataByID('cardname');
   

   if(!cardNumber) {
       showErrorMsg(ERROR_MSG.CARDNUMBER_REQUIRED);
       return;
   } 
   if(!expiry) {
       showErrorMsg(ERROR_MSG.EXPIRY_REQUIRED);
       return;
   } 
   if(!cvv) {
       showErrorMsg(ERROR_MSG.CVV_REQUIRED);
       return;
   }
   if(!cardName) {
       showErrorMsg(ERROR_MSG.CARDNAME_REQUIRED);
       return;
   }

   isValidated = validateForm();
   if(!isValidated) return;

   showErrorMsg("");

   let cardType = getDataByID('card-icon-update');

   const obj = {
       cardNumber,
       expiry,
       cvv,
       cardType,
       cardName
   }

   savedCards = JSON.parse(localStorage.getItem('CARD_INFO'));
   if(!savedCards) savedCards = [];
   savedCards.push(obj);
   localStorage.setItem('CARD_INFO', JSON.stringify(savedCards)); 
   showSuccessMsg("Card Details updated successfully");
   clearModal();
}
function selectCard(pos) {
    let selectedCard = savedCards[pos];
    getElementByID('creditno').value = selectedCard.cardNumber;
    getElementByID('expirydate').value = selectedCard.expiry;
    getElementByID('cvv').value = selectedCard.cvv;
    getElementByID('card-icon-update').src = CARDS_INFO[selectedCard.cardType].ICON;
    getElementByID('cardname').value = selectedCard.cardName;
    closeModal();
}

function showErrorMsg(msg) {
    getElementByID('showErrorMsg').innerHTML = msg;
}

function showSuccessMsg(msg) {
    getElementByID('showSuccessMsg').innerHTML = msg;
}

function closeModal() {
    document.getElementById('modal-container').style["display"] = "none";
}

function clearModal() {
    getElementByID('creditno').value = "";
    getElementByID('expirydate').value = "";
    getElementByID('cvv').value = "";
    getElementByID('cardname').value = "";
    getElementByID('card-icon-update').src = "assets/icons/credit-card.png";
}

function getSavedCardDetails() {
    savedCards = JSON.parse(localStorage.getItem('CARD_INFO'));
    
    document.getElementById('modal-container').style["display"] = "block";
    let listcontainer = document.getElementById("saved-card-list");
    
    document.getElementById("no-cards").innerHTML = "";

    listcontainer.innerHTML = '';
    
    if(savedCards.length == 0) {
       document.getElementById("no-cards").innerHTML = "No Saved Cards";
       return;
    }
   
    savedCards.forEach((element, index) => { 
        const card_colors = CARDS_INFO[element.cardType].CARD_COLOR;
        listcontainer.innerHTML += '<li> <div class="list-container" style="background-image: linear-gradient('+card_colors[0]+','+card_colors[1]+'" onclick=selectCard('+ index +')><div class="card-title">'+element.cardName+'</div><div class="card-number">'+element.cardNumber+'</div> <div class="card-type"><img class="" src='+CARDS_INFO[element.cardType].ICON+'></div></div> <button type="button" class="btn-delete" onclick="deleteCardDetails('+index+')">Delete Card</button> </li>'
    })
}

function deleteCardDetails(pos) {
    let confirm = window.confirm("You are deleting this card from Saved Card list. Are you sure...???")
    if(!confirm) {
        return;
    }

    savedCards.splice(pos, 1);
    localStorage.setItem('CARD_INFO', JSON.stringify(savedCards));  
    getSavedCardDetails();
}

function getDataByID(element) {
    return document.getElementById(element) ? document.getElementById(element).value : '';
}
function getElementByID(element) {
    return document.getElementById(element);
}

