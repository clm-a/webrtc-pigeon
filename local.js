
let connection = null
let channel = null
let iceCandidates = []

function initConnection(){
  
  connection = new RTCPeerConnection({
    "iceServers": [{"url": "stun:coturn.aerodigitale.fr"}, {
      url: 'turn:coturn.aerodigitale.fr?transport=tcp',
      username: 'guest',
      credential: 'password',
    }
  ]
  }); 
  document.getElementById("createOfferBtn").setAttribute("disabled", "disabled")
  document.getElementById("pasteSDPAnswerBtn").removeAttribute("disabled");
  connection.onicegatheringstatechange = function(event){
    let state = event.target.iceGatheringState
    let iceStateIndicator = document.getElementById("iceState")
    iceStateIndicator.innerText = state
    iceStateIndicator.classList.remove("gray", "green", "orange")
    if(state == "complete"){
      iceStateIndicator.classList.add("green")
      displayIceCandidates()
    }
    else{
      iceStateIndicator.classList.add(state == "new" ? "red" : "orange")
      iceCandidates = []
      resetDisplayIceCandidates()
    }
  }
  connection.onicecandidate = function(event){
    if(!event.candidate)
      return
    iceCandidates.push(event.candidate)
  }


  channel = connection.createDataChannel('monCanal', null);

  channel.onmessage = function(event) {
    alert(`Message reçu : ${event.data}`)
  };
  channel.onopen = function(){
    const state = channel.readyState;
    channelStateIndicator = document.getElementById("chanelState")
    channelStateIndicator.innerText = state
    channelStateIndicator.classList.remove("gray")
    channelStateIndicator.classList.add("green")
    document.getElementById("sendMessageBtn").removeAttribute("disabled", "disabled")
  }

  connection.createOffer().then((desc) => {
    connection.setLocalDescription(desc)
    displayOffer(desc)
  });

}

displayOffer= function(offer){
  document.getElementById("sdpOfferTextarea").value = JSON.stringify(offer)
}

displayIceCandidates = function(){
  document.getElementById("iceCandidatesTextarea").value = JSON.stringify(iceCandidates)
}

resetDisplayIceCandidates = function(){
  document.getElementById("iceCandidatesTextarea").value = "Les candidats ICE qui vous caractérisent (à transmettre à votre correspondant de Jokkmokk) apparaitront ici.\nL'état peut rester sur \"gathering\" pendant une minute environ."
}

function createOffer(){
 initConnection();
}


function pasteSDPAnswer(){
  document.getElementById("pasteSDPAnswerBtn").setAttribute("disabled", "disabled")
  document.getElementById("pasteICECandidateBtn").removeAttribute("disabled")
  let sdpAnswerJSON = prompt("Collez ici la réponse à votre offre de session SDP")
  let sdpAnswer = JSON.parse(sdpAnswerJSON)
  connection.setRemoteDescription(new RTCSessionDescription(sdpAnswer))
}


function send(){
  let message = prompt("Tapez un message");
  channel.send(message)
}

function pasteIceCandidates(){
  let candidateJSON = prompt("Collez ici les candidats ICE de votre correspondant caennais")
  for(candidate of JSON.parse(candidateJSON)){
    connection.addIceCandidate(new RTCIceCandidate(candidate))

  }
}
