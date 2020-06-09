
let channel = null
let iceCandidates = []


displayAnswer= function(answer){
  document.getElementById("sdpAnswerTextarea").value = JSON.stringify(answer)
}

displayIceCandidates = function(){
  document.getElementById("iceCandidatesTextarea").value = JSON.stringify(iceCandidates)
}

resetDisplayIceCandidates = function(){
  document.getElementById("iceCandidatesTextarea").value = "Les candidats ICE qui vous caractérisent (à transmettre à votre correspondant de Caen) apparaitront ici.\nL'état peut rester sur \"gathering\" pendant une minute environ."
}


function pasteIceCandidate(){
  let candidateJSON = prompt("Collez ici un candidat ICE")
  connection.addIceCandidate(new RTCIceCandidate(JSON.parse(candidateJSON)))

}


function send(){
  let message = prompt("Tapez un message");
  channel.send(message)
}







let connection = null
function pasteSDPOffer(){
  connection = new RTCPeerConnection({
    "iceServers": [{"url": "stun:coturn.aerodigitale.fr"}, {
      url: 'turn:coturn.aerodigitale.fr?transport=tcp',
      username: 'guest',
      credential: 'password',
    }
  ]
  });
  let sdpJSON = prompt("Collez ici la description de session JSON")
  document.getElementById("pasteIceCandidatesBtn").removeAttribute("disabled")
  document.getElementById("pasteSDPOfferBtn").setAttribute("disabled", "disabled")
  connection.setRemoteDescription(new RTCSessionDescription(JSON.parse(sdpJSON)))
  connection.createAnswer().then(desc => {
    connection.setLocalDescription(desc)
    displayAnswer(desc)
  })
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


  
  connection.ondatachannel = function( event){
    channel = event.channel;
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
  }

}
function pasteIceCandidates(){
  let candidateJSON = prompt("Collez ici les candidats ICE de votre correspondant caennais")
  for(candidate of JSON.parse(candidateJSON)){
    connection.addIceCandidate(new RTCIceCandidate(candidate))
  }
}



